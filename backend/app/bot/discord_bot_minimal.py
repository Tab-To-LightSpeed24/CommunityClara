# backend/app/bot/discord_bot_minimal.py
import discord
from discord.ext import commands
import asyncio
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta, timezone

from app.utils.config import config
from app.utils.logger import logger
from app.ml.content_analyzer import content_analyzer
from app.database.connection import get_db_session
from app.database.models import Server, User, Violation
from app.bot.spam_tracker import spam_tracker
from discord.ext import tasks
from app.services.adaptive_learning import learning_service

# Bot intents
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.guild_messages = True
intents.members = True

IST = timezone(timedelta(hours=5, minutes=30))


class CommunityClara(commands.Bot):
    """CommunityClara Discord Bot"""
    
    def __init__(self):
        super().__init__(
            command_prefix='!clara ',
            intents=intents,
            help_command=None,
            case_insensitive=True
        )
        self.processed_messages = 0
        self.violations_detected = 0

    async def on_ready(self):
        """Bot startup event"""
        logger.info(f"🤖 {self.user} is now online!")
        logger.info(f"📊 Connected to {len(self.guilds)} servers")
        
        await self.change_presence(
            activity=discord.Activity(
                type=discord.ActivityType.watching,
                name="for serious violations 🛡️"
            )
        )
        
        await self._initialize_servers()
        
        # 🚨 START SPAM TRACKER CLEANUP
        await spam_tracker.start_cleanup()
        
        # 🧠 START CULTURE ADAPTATION LOOP
        if not self.culture_adaptation_loop.is_running():
            self.culture_adaptation_loop.start()
            
        logger.info("🧹 Spam tracker cleanup started")

    @tasks.loop(hours=6)
    async def culture_adaptation_loop(self):
        """Periodic task to adjust server thresholds based on feedback"""
        logger.info("🧠 Running Culture Adaptation Cycle...")
        for guild in self.guilds:
            await learning_service.process_server_learning(str(guild.id))

    async def on_member_join(self, member):
        """Handle new member joining - Welcome Message"""
        try:
            server_config = await self._get_server_config(member.guild.id)
            if not server_config:
                return

            welcome_msg = server_config.get('welcome_message')
            if welcome_msg:
                # Format message
                formatted_msg = welcome_msg.replace('{user}', member.mention)\
                                         .replace('{server}', member.guild.name)\
                                         .replace('{username}', member.display_name)
                
                # Determine channel: System Channel -> General -> First Text Channel
                target_channel = member.guild.system_channel
                
                if not target_channel:
                    # Search for 'general' or 'welcome'
                    for channel in member.guild.text_channels:
                        if 'general' in channel.name.lower() or 'welcome' in channel.name.lower():
                            target_channel = channel
                            break
                            
                # Fallback to first available channel
                if not target_channel and member.guild.text_channels:
                    target_channel = member.guild.text_channels[0]
                    
                if target_channel:
                    try:
                        await target_channel.send(formatted_msg)
                        logger.info(f"👋 Sent welcome message to {member} in {member.guild}")
                    except Exception as e:
                        logger.warning(f"Failed to send welcome message: {e}")
                        
        except Exception as e:
            logger.error(f"Error in on_member_join: {e}")

    async def on_message(self, message: discord.Message):
        """Handle incoming messages with proper settings integration"""
        # Ignore bot messages
        if message.author.bot:
            return
        
        # Process commands FIRST
        await self.process_commands(message)
        
        # Process commands manually since we are using a custom prefix with space
        if message.content.lower().startswith('!clara'):
            try:
                # Robust split to handle multiple spaces
                parts = message.content.strip().split()
                if len(parts) > 1:
                    cmd = parts[1].lower()
                    
                    if cmd == 'help':
                        await self._manual_help_command(message)
                        return
                    elif cmd == 'status':
                        await self._manual_status_command(message)
                        return
                    elif cmd == 'test':
                        await self._manual_test_command(message)
                        return
                    elif cmd == 'checkperms':
                        await self._manual_checkperms_command(message)
                        return
                    elif cmd == 'testspam':
                        await self.test_spam_tracker(message)
                        return
                    else:
                        # Unknown command
                        pass
                
                # If we are here, it matches prefix but not a valid command, or it was just "!clara"
                # We return to skip moderation for partial commands
                return

            except discord.Forbidden:
                logger.error(f"❌ Forbidden error handling command for {message.author}")
                try:
                    await message.channel.send("⚠️ **Error:** I don't have permission to reply (Missing 'Embed Links' or 'Send Messages'?)")
                except:
                    pass
                return
            except Exception as e:
                logger.error(f"❌ Error handling command: {e}")
                try:
                    await message.channel.send(f"❌ **Internal Error:** {str(e)}")
                except:
                    pass
                return
        
        # Skip empty messages (unless it has an attachment)
        if not message.content.strip() and not message.attachments:
            return
        
        # Get server configuration
        server_config = await self._get_server_config(message.guild.id)
        if not server_config:
            logger.warning(f"❌ No server config found for {message.guild.id}")
            return
        
        # CHECK EXEMPT ROLES
        if await self._is_user_exempt(message.author, server_config):
            logger.info(f"⚪ Skipping moderation for exempt user: {message.author}")
            return
        
        # CHECK MODERATION CHANNELS
        if not await self._should_moderate_channel(message.channel, server_config):
            logger.info(f"⚪ Skipping non-moderated channel: #{message.channel.name}")
            return
        
        logger.info(f"📝 MODERATING: '{message.content}' from {message.author} in #{message.channel.name}")
        
        # Increment processed messages counter
        self.processed_messages += 1
        
        try:
            logger.info(f"🔧 Using config: toxicity={server_config['toxicity_threshold']}, auto_delete={server_config['auto_delete']}")
            
            # SPAM DETECTION
            logger.info(f"🔍 Starting spam analysis for user {message.author.id}...")
            
            try:
                spam_analysis = spam_tracker.add_message(
                    user_id=str(message.author.id),
                    content=message.content,
                    timestamp=datetime.utcnow()
                )
                
                logger.info(f"🔍 Spam analysis result:")
                logger.info(f"   📊 Spam score: {spam_analysis.get('spam_score', 'ERROR')}/100")
                logger.info(f"   🚨 Is spam: {spam_analysis.get('is_spam', 'ERROR')}")
                logger.info(f"   📝 Reasons: {spam_analysis.get('reasons', 'ERROR')}")
                logger.info(f"   📈 Recent messages: {spam_analysis.get('recent_messages', 'N/A')}")
                logger.info(f"   🔄 Repeat count: {spam_analysis.get('repeat_count', 'N/A')}")
                logger.info(f"   📋 Full analysis: {spam_analysis}")
                
                # Handle spam detection FIRST
                if spam_analysis.get('is_spam', False):
                    logger.info(f"🚨 SPAM DETECTED: {spam_analysis}")
                    
                    # ALSO check for toxicity in the spam message (User Request)
                    toxicity_result = await self._analyze_message(message, server_config)
                    if toxicity_result:
                        spam_analysis['toxicity_data'] = toxicity_result
                        logger.info(f"☠️ Spam also contains toxicity: {toxicity_result['violation_category']}")
                    
                    await self._handle_spam(message, spam_analysis, server_config)
                    return  # Exit early for spam
                
                logger.info(f"✅ Not spam - continuing to AI analysis")
                
            except Exception as spam_error:
                logger.error(f"❌ Spam analysis failed: {spam_error}")
                import traceback
                logger.error(f"Spam analysis traceback: {traceback.format_exc()}")

            # IMAGE ANALYSIS ('else' block removed as 'if' returns)
            logger.info(f"📎 Message attachments: {len(message.attachments)}")
            if message.attachments:
                from app.ml.image_analyzer import image_analyzer
                for attachment in message.attachments:
                    if attachment.content_type and attachment.content_type.startswith('image/'):
                        logger.info(f"🖼️ Analyzing image: {attachment.filename}")
                        img_result = await image_analyzer.analyze_image(attachment.url)
                        
                        if img_result and img_result['is_nsfw']:
                            logger.info(f"🚨 NSFW IMAGE DETECTED: {img_result}")
                            
                            # CHECK IF NSFW IS ALLOWED
                            if server_config.get('nsfw_allowed', False):
                                logger.info(f"⚪ NSFW allowed in this server. Ignoring violation.")
                                return

                            # Construct violation object
                            violation_data = {
                                'violation_category': 'nsfw_image',
                                'confidence': img_result['score'],
                                'analysis': img_result
                            }
                            
                            # CUSTOM ACTION HANDLING FOR NSFW
                            # We handle this manually here because it has specific settings (Ban/Timeout)
                            
                            # 1. Log violation first
                            await self._log_violation(message, violation_data, "nsfw_detected")

                            # 2. Execute Actions
                            action_taken = []
                            
                            # Auto-Delete
                            if server_config.get('nsfw_auto_delete', True):
                                try:
                                    await message.delete()
                                    action_taken.append("Deleted Message")
                                    logger.info(f"🗑️ Deleted NSFW image from {message.author}")
                                except:
                                    pass

                            # Auto-Ban (Strict)
                            if server_config.get('nsfw_auto_ban', False):
                                try:
                                    await message.guild.ban(message.author, reason="NSFW content detected (Auto-Ban)")
                                    action_taken.append("Banned User")
                                    logger.info(f"🚫 Banned {message.author} for NSFW")
                                except Exception as e:
                                    logger.error(f"Failed to ban: {e}")
                            
                            # Auto-Kick (New)
                            elif server_config.get('nsfw_auto_kick', False):
                                try:
                                    await message.guild.kick(message.author, reason="NSFW content detected (Auto-Kick)")
                                    action_taken.append("Kicked User")
                                    logger.info(f"👢 Kicked {message.author} for NSFW")
                                except Exception as e:
                                    logger.error(f"Failed to kick: {e}")

                            # Auto-Timeout (if not banned/kicked)
                            elif server_config.get('nsfw_auto_timeout', False):
                                try:
                                    timeout_time = discord.utils.utcnow() + timedelta(minutes=10)
                                    await message.author.timeout(timeout_time, reason="NSFW content detected")
                                    action_taken.append("Timed Out (10m)")
                                    logger.info(f"⏰ Timed out {message.author} for NSFW")
                                except:
                                    pass
                            
                            # Send Alert
                            await self._send_moderation_alert(message, violation_data, " + ".join(action_taken))
                            
                            return # Exit after finding bad image

            # Only run AI analysis if not spam
            violation_result = await self._analyze_message(message, server_config)
            
            if violation_result:
                logger.info(f"🚨 Violation detected: {violation_result}")
                await self._handle_violation(message, violation_result, server_config)
            else:
                logger.info(f"✅ Message clean: '{message.content[:50]}...'")
                
        except Exception as e:
            logger.error(f"❌ Error processing message: {e}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")

    async def test_spam_tracker(self, message):
        """Test spam tracker directly - for debugging"""
        try:
            logger.info(f"🧪 Testing spam tracker directly...")
            
            # Test multiple rapid messages
            for i in range(6):  # This should trigger rapid fire detection
                test_analysis = spam_tracker.add_message(
                    user_id="test_user_123",
                    content="test message",
                    timestamp=datetime.utcnow()
                )
                logger.info(f"🧪 Test message {i+1}: score={test_analysis.get('spam_score', 'ERROR')}, is_spam={test_analysis.get('is_spam', 'ERROR')}")
                
            await message.channel.send("✅ Spam tracker test completed - check logs!")
            logger.info(f"🧪 Spam tracker test completed")
            
        except Exception as e:
            logger.error(f"❌ Spam tracker test failed: {e}")
            await message.channel.send(f"❌ Spam tracker test failed: {e}")


    async def _handle_spam(self, message: discord.Message, spam_analysis: Dict, server_config: Dict):
        """Handle detected spam with settings integration"""
        try:
            self.violations_detected += 1
            
            # Delete the spam message immediately
            try:
                await message.delete()
                logger.info(f"🗑️ Deleted spam message from {message.author}")
            except discord.Forbidden:
                logger.warning(f"❌ No permission to delete spam from {message.author}")
            except Exception as delete_error:
                logger.error(f"❌ Failed to delete spam message: {delete_error}")
            
            # Send warning DM to user
            try:
                embed = discord.Embed(
                    title="🚫 Spam Detected & Removed",
                    description=f"Your rapid messages in {message.guild.name} were detected as spam.",
                    color=0xFF6600
                )
                
                embed.add_field(
                    name="Spam Score",
                    value=f"{spam_analysis['spam_score']}/100",
                    inline=True
                )
                
                embed.add_field(
                    name="Detected Patterns",
                    value=f"• {chr(10).join(spam_analysis['reasons'][:3])}",
                    inline=False
                )
                
                # Add Toxicity Logic
                if 'toxicity_data' in spam_analysis:
                    tox = spam_analysis['toxicity_data']
                    embed.add_field(
                        name="☠️ Toxic Content",
                        value=f"Category: {tox['violation_category']}\nConfidence: {tox['confidence']:.1%}",
                        inline=False
                    )
                
                embed.set_footer(text="CommunityClara AI • Anti-Spam Protection")
                
                try:
                    await message.author.send(embed=embed)
                    logger.info(f"📬 Spam warning sent to {message.author}")
                except Exception:
                    pass # Ignore DM failures for spammers
                
            except Exception as dm_error:
                logger.warning(f"Could not send spam DM to {message.author}: {dm_error}")
            
            # Send alert to designated log channel
            try:
                # Get designated log channel
                alert_channel = await self._get_log_channel(message.guild, server_config)
                
                # Fallback to current channel if no log channel set
                if not alert_channel:
                    alert_channel = message.channel
                
                # AUTOMATIC SPAM REDUCTION FOR ALERTS
                # If we just sent an alert to this channel for this user < 5 seconds ago, skip it
                # (This is a simplified version; normally we'd track this in memory)
                
                embed = discord.Embed(
                    title="🚫 Spam Detected & Removed",
                    color=0xFF6600,
                    timestamp=datetime.utcnow()
                )
                
                embed.add_field(name="User", value=f"{message.author.mention}", inline=True)
                embed.add_field(name="Channel", value=message.channel.mention, inline=True)
                embed.add_field(name="Action", value="Message Deleted", inline=True)  
                embed.add_field(name="Spam Score", value=f"{spam_analysis['spam_score']}/100", inline=True)
                
                patterns_text = "\n".join(spam_analysis['reasons'][:2])
                embed.add_field(
                    name="Patterns Detected",
                    value=f"```{patterns_text}```",
                    inline=False
                )
                
                if 'toxicity_data' in spam_analysis:
                     embed.add_field(
                        name="☠️ Toxic Content",
                        value=f"⚠️ {spam_analysis['toxicity_data']['violation_category']}",
                        inline=True
                    )
                
                embed.set_footer(text="CommunityClara AI • Anti-Spam Protection")
                
                sent_message = await alert_channel.send(embed=embed)
                logger.info(f"📤 Spam alert sent to #{alert_channel.name} for violation in #{message.channel.name}")
                
                # Return the message so we can track it (though we don't use it yet for spam)
                return sent_message
                
            except Exception as alert_error:
                logger.error(f"Could not send spam alert: {alert_error}")
            
            # Log spam violation to database
            try:
                await self._log_spam_violation(message, spam_analysis)
                logger.info(f"📝 Logged spam violation to database")
            except Exception as log_error:
                logger.error(f"❌ Failed to log spam violation: {log_error}")
                    
        except Exception as e:
            logger.error(f"Error handling spam: {e}")

    async def _log_spam_violation(self, message: discord.Message, spam_analysis: Dict):
        """Log spam violation to database with message content"""
        try:
            with get_db_session() as session:
                # Ensure user exists
                user = session.query(User).filter_by(id=str(message.author.id)).first()
                if not user:
                    user = User(
                        id=str(message.author.id),
                        username=message.author.display_name or str(message.author)
                    )
                    session.add(user)
                else:
                    user.username = message.author.display_name or str(message.author)
                
                # Save spam violation record WITH MESSAGE CONTENT
                violation_record = Violation(
                    server_id=str(message.guild.id),
                    user_id=str(message.author.id),
                    channel_id=str(message.channel.id),
                    violation_type='spam',
                    confidence_score=spam_analysis['spam_score'] / 100,  # Convert to 0-1 scale
                    action_taken='delete',
                    created_at=datetime.now(IST),
                    # ADD THESE FIELDS FOR REAL CONTENT:
                    channel_name=f"#{message.channel.name}"  # Store real channel name
                )
                session.add(violation_record)
                session.commit()
                
                logger.info(f"✅ SAVED spam violation: user='{message.author.display_name}', content='{message.content}', score={spam_analysis['spam_score']}")
                
        except Exception as e:
            logger.error(f"Error logging spam violation: {e}")



    async def _manual_help_command(self, message):
        """Manual help command"""
        embed = discord.Embed(
            title="🛡️ CommunityClara - Help",
            description="High-sensitivity Discord moderation with 3-warning system + spam detection",
            color=0x8B5CF6
        )
        embed.add_field(
            name="📋 Commands", 
            value="`!clara help` - Show this help\n`!clara status` - Bot statistics\n`!clara test` - Test command\n`!clara checkperms` - Check permissions",
            inline=False
        )
        embed.add_field(
            name="🔄 Warning System",
            value="**Warning 1**: DM notification\n**Warning 2**: Final warning\n**Warning 3**: Timeout + message delete",
            inline=False
        )
        embed.add_field(
            name="🚫 Auto-Delete",
            value="**Spam**: Instant delete + warning\n**NSFW**: Instant delete + warning",
            inline=False
        )
        embed.set_footer(text="Only serious violations count toward warnings")
        await message.channel.send(embed=embed)
        logger.info(f"✅ Manual help sent to {message.author}")

    async def _manual_status_command(self, message):
        """Manual status command"""
        embed = discord.Embed(title="📊 Bot Status", color=0x00FF00)
        embed.add_field(name="Messages Processed", value=f"{self.processed_messages:,}", inline=True)
        embed.add_field(name="Violations Detected", value=f"{self.violations_detected:,}", inline=True)
        embed.add_field(name="Servers", value=f"{len(self.guilds):,}", inline=True)
        embed.add_field(name="Version", value="v4.0 SPAM PROTECTION", inline=True)
        embed.add_field(name="Features", value="✅ 3-Warning System\n✅ Rapid-Fire Spam Detection\n✅ NSFW Detection", inline=True)
        await message.channel.send(embed=embed)
        logger.info(f"✅ Manual status sent to {message.author}")

    async def _manual_test_command(self, message):
        """Manual test command"""
        await message.channel.send("✅ **TEST SUCCESSFUL!** All systems operational!\n🛡️ 3-Warning System: Active\n🚫 Spam Detection: Active")
        logger.info(f"✅ Manual test sent to {message.author}")

    async def _manual_checkperms_command(self, message):
        """Manual permission check command"""
        try:
            me = message.guild.me
            perms = me.guild_permissions
            
            # Required permissions
            required_perms = [
                ("Send Messages", perms.send_messages, "📝"),
                ("Read Message History", perms.read_message_history, "📖"),
                ("Manage Messages", perms.manage_messages, "🗑️"),
                ("Moderate Members", perms.moderate_members, "⏰"),
                ("Use External Emojis", perms.use_external_emojis, "😀"),
                ("Embed Links", perms.embed_links, "🔗"),
                ("Add Reactions", perms.add_reactions, "👍")
            ]
            
            embed = discord.Embed(
                title="🔐 Bot Permission Check",
                color=0x00FF00 if all(has_perm for _, has_perm, _ in required_perms) else 0xFF0000
            )
            
            all_good = True
            for perm_name, has_perm, emoji in required_perms:
                status = "✅ Yes" if has_perm else "❌ **MISSING**"
                embed.add_field(name=f"{emoji} {perm_name}", value=status, inline=True)
                if not has_perm:
                    all_good = False
            
            if all_good:
                embed.add_field(
                    name="🎉 Status", 
                    value="All permissions correctly configured!", 
                    inline=False
                )
            else:
                embed.add_field(
                    name="⚠️ Missing Permissions",
                    value="**To fix issues:**\n1. Go to Discord Developer Portal\n2. OAuth2 → URL Generator\n3. Check 'bot' + 'Moderate Members'\n4. Re-invite bot with new URL",
                    inline=False
                )
            
            await message.channel.send(embed=embed)
            logger.info(f"✅ Manual permission check sent - All good: {all_good}")
            
        except Exception as e:
            logger.error(f"❌ Error in manual permission check: {e}")
            await message.channel.send("❌ Error checking permissions")

    async def _analyze_message(self, message: discord.Message, server_config: Dict) -> Optional[Dict[str, Any]]:
        """Analyze message for violations - FIXED VERSION"""
        if not message.content.strip():
            return None
            
        try:
            logger.info(f"🔍 Starting AI analysis for: '{message.content}'")
            
            # Import and use the content analyzer
            from app.ml.content_analyzer import content_analyzer
            
            # Run the AI analysis (this was missing!)
            text_analysis = await content_analyzer.analyze_text(message.content)
            logger.info(f"🤖 AI result: flagged={text_analysis.get('flagged')}, score={text_analysis.get('max_score', 0):.3f}")
            
            # Get thresholds from server config
            toxicity_threshold = server_config.get('toxicity_threshold', 0.7)
            max_score = text_analysis.get('max_score', 0)
            violation_type = text_analysis.get('violation_type')
            
            # Log the comparison
            logger.info(f"🎯 THRESHOLD CHECK: {max_score:.3f} vs {toxicity_threshold:.3f}")
            
            # Check if violation should be triggered
            should_flag = max_score >= toxicity_threshold
            
            if should_flag:
                logger.info(f"🚨 VIOLATION TRIGGERED: {max_score:.3f} >= {toxicity_threshold:.3f}")
                return {
                    'type': 'text', 
                    'violation_category': violation_type or 'toxicity',
                    'confidence': max_score,
                    'analysis': text_analysis
                }
            else:
                logger.info(f"✅ NO VIOLATION: {max_score:.3f} < {toxicity_threshold:.3f}")
                return None
                    
        except Exception as e:
            logger.error(f"❌ Error in AI analysis: {e}")
            import traceback
            traceback.print_exc()
        
        return None
    async def _handle_violation(self, message: discord.Message, violation: Dict[str, Any], server_config: Dict):
        """Handle detected violation with 3-warning system - FIXED"""
        self.violations_detected += 1
        
        try:
            # Get server configuration
            auto_delete = server_config.get('auto_delete', False)
            auto_timeout = server_config.get('auto_timeout', False)
            
            logger.info(f"🔧 Action config: auto_delete={auto_delete}, auto_timeout={auto_timeout}")
            
            # Get user's current warning count (from last 30 days)
            warning_count = await self._get_user_violation_count(message.author.id, message.guild.id)
            new_warning_count = warning_count + 1
            
            logger.info(f"📊 User {message.author} warnings: {warning_count} → {new_warning_count}")
            
            action_taken = "log"
            
            # Determine action based on warning count and server settings
            if new_warning_count >= 3:
                # 3rd warning: Delete + Timeout (if enabled) + RESET warnings
                try:
                    await message.delete()
                    action_taken = "delete"
                    logger.info(f"🗑️ Auto-deleted violating message from {message.author}")
                except discord.Forbidden:
                    logger.warning(f"❌ No permission to delete message from {message.author}")
                except Exception as e:
                    logger.error(f"❌ Failed to delete message: {e}")
                
                # Apply timeout if enabled
                if auto_timeout:
                    timeout_duration = server_config.get('timeout_duration', 300)
                    try:
                        # Use datetime.timedelta, not discord.timedelta
                        timeout_time = discord.utils.utcnow() + timedelta(seconds=timeout_duration)
                        await message.author.timeout(timeout_time, reason="3rd violation - automatic moderation")
                        action_taken = f"timeout_{timeout_duration}s"
                        logger.info(f"⏰ Auto-timed out {message.author} for {timeout_duration} seconds")
                    except discord.Forbidden:
                        logger.warning(f"❌ No permission to timeout {message.author}")
                    except Exception as e:
                        logger.error(f"❌ Failed to timeout user: {e}")

                
                # Send final warning DM
                await self._send_warning_dm(message, violation, 3)
                
                # Log the 3rd violation with reset action
                action_taken = "warn3_reset"
                
            elif new_warning_count == 1:
                # First warning - just warn
                action_taken = "warn1"
                await self._send_warning_dm(message, violation, 1)
                logger.info(f"⚠️ Sent warning 1/3 to {message.author}")
                
            elif new_warning_count == 2:
                # Second warning - final warning
                action_taken = "warn2"
                await self._send_warning_dm(message, violation, 2)
                logger.info(f"⚠️ Sent warning 2/3 to {message.author}")
                
            else:
                # Fallback - just log
                action_taken = "log"
                logger.info(f"📝 Logged violation from {message.author}")
            
            # Send moderation alert FIRST to get the message ID
            alert_message = await self._send_moderation_alert(message, violation, action_taken, new_warning_count)
            log_message_id = str(alert_message.id) if alert_message else None
            
            # Log violation to database with the alert message ID (for reaction tracking)
            await self._log_violation(message, violation, action_taken, log_message_id)
            
            # RESET warnings after 3rd strike - THIS WAS MISSING
            if new_warning_count >= 3:
                await self._reset_user_warnings(message.author.id, message.guild.id)
                logger.info(f"🔄 Reset warnings for {message.author} after 3rd strike")
            
        except Exception as e:
            logger.error(f"Error handling violation: {e}")


    async def _log_violation(self, message: discord.Message, violation: Dict[str, Any], action_taken: str, log_message_id: str = None):
        """Log violation with proper action tracking and message content"""
        try:
            with get_db_session() as session:
                # Ensure user exists
                user = session.query(User).filter_by(id=str(message.author.id)).first()
                if not user:
                    user = User(
                        id=str(message.author.id),
                        username=message.author.display_name or str(message.author)
                    )
                    session.add(user)
                else:
                    user.username = message.author.display_name or str(message.author)
                
                # Save violation record WITH MESSAGE CONTENT
                violation_record = Violation(
                    server_id=str(message.guild.id),
                    user_id=str(message.author.id),
                    channel_id=str(message.channel.id),
                    violation_type=violation['violation_category'],
                    confidence_score=violation['confidence'],
                    action_taken=action_taken,
                    created_at=datetime.now(IST),
                    # ✅ STORE ACTUAL CONTENT:
                    message_content=message.content[:500],  # Store first 500 chars
                    channel_name=f"#{message.channel.name}",  # Store channel name
                    log_message_id=log_message_id
                )

                session.add(violation_record)
                session.commit()
                
                logger.info(f"✅ SAVED violation: user='{message.author.display_name}', content='{message.content}', action='{action_taken}'")
                
        except Exception as e:
            logger.error(f"Error logging violation: {e}")

    async def _execute_action(self, message: discord.Message, action: str, violation: Dict[str, Any], violation_count: int = None):
        """Execute moderation action"""
        try:
            if action == 'warn1':
                await self._send_warning_dm(message, violation, 1)
                logger.info(f"⚠️ Warning 1/3 sent to {message.author}")
                
            elif action == 'warn2':
                await self._send_warning_dm(message, violation, 2)
                logger.info(f"⚠️ Warning 2/3 sent to {message.author}")
                
            elif action == 'timeout_2min':
                # Try timeout, fallback to delete
                timeout_applied = False
                
                try:
                    me = message.guild.me
                    if me.guild_permissions.moderate_members and message.author != message.guild.owner:
                        # Use datetime.timedelta, not discord.timedelta
                        timeout_duration_time = timedelta(minutes=2)
                        await message.author.timeout(timeout_duration_time, reason="3rd violation - serious content")
                        timeout_applied = True
                        logger.info(f"⏰ Successfully timed out {message.author} for 2 minutes")
                    else:
                        logger.warning(f"❌ Cannot timeout {message.author} (owner or no permission)")
                except Exception as timeout_error:
                    logger.error(f"❌ Timeout failed: {timeout_error}")
                
                # Delete message
                try:
                    await message.delete()
                    logger.info(f"🗑️ Deleted violation message from {message.author}")
                except Exception as delete_error:
                    logger.error(f"❌ Could not delete message: {delete_error}")
                
                # Send DM notification
                try:
                    embed = discord.Embed(
                        title="🚫 3rd Strike - Final Action",
                        description=f"Your message in {message.guild.name} triggered the 3rd violation.",
                        color=0xFF6B6B
                    )
                    
                    if timeout_applied:
                        embed.add_field(name="Action", value="2-minute timeout + message deleted", inline=True)
                    else:
                        embed.add_field(name="Action", value="Message deleted", inline=True)
                    
                    embed.add_field(name="Reset", value="Warning count reset to 0", inline=False)
                    embed.set_footer(text="Serious violations have consequences")
                    
                    await message.author.send(embed=embed)
                    logger.info(f"📬 Sent 3rd strike notification to {message.author}")
                except Exception as dm_error:
                    logger.warning(f"Could not send DM: {dm_error}")
                    
        except Exception as e:
            logger.error(f"Error executing action {action}: {e}")

    async def _send_warning_dm(self, message: discord.Message, violation: Dict[str, Any], warning_num: int):
        """Send warning DM to user"""
        try:
            if warning_num <= 2:
                embed = discord.Embed(
                    title=f"⚠️ Warning {warning_num}/3",
                    description=f"Your message in {message.guild.name} violated community guidelines.",
                    color=0xFFA500 if warning_num < 3 else 0xFF6B6B
                )
                embed.add_field(name="Type", value=violation['violation_category'].replace('_', ' ').title(), inline=True)
                embed.add_field(name="Confidence", value=f"{violation['confidence']:.1%}", inline=True)
                
                if warning_num == 1:
                    embed.add_field(name="Next", value="2 more violations = action taken", inline=False)
                elif warning_num == 2:
                    embed.add_field(name="⚠️ FINAL WARNING", value="1 more violation = message deletion/timeout", inline=False)
                
                embed.set_footer(text="Only serious violations count toward warnings")
                await message.author.send(embed=embed)
                
            elif warning_num == 3:
                embed = discord.Embed(
                    title="🚫 3rd Violation - Action Taken",
                    description=f"Your message in {message.guild.name} was your 3rd violation.",
                    color=0xFF6B6B
                )
                embed.add_field(name="Action", value="Message deleted and/or timeout applied", inline=True)
                embed.add_field(name="Reset", value="Warning count reset to 0", inline=False)
                embed.set_footer(text="Serious violations have consequences")
                await message.author.send(embed=embed)
                
        except Exception as e:
            logger.warning(f"Could not send warning DM: {e}")

    async def _get_user_violation_count(self, user_id: int, server_id: int) -> int:
        """Get user's active warning count (only warn1 and warn2 count, exclude resolved)"""
        try:
            with get_db_session() as session:
                thirty_days_ago = datetime.utcnow() - timedelta(days=30)
                count = session.query(Violation).filter(
                    Violation.user_id == str(user_id),
                    Violation.server_id == str(server_id),
                    Violation.created_at >= thirty_days_ago,
                    Violation.action_taken.in_(['warn1', 'warn2'])  # Only active warnings
                ).count()
                logger.info(f"📊 User {user_id} has {count} active warnings")
                return count
        except Exception as e:
            logger.error(f"Error getting violation count: {e}")
            return 0

    async def _send_moderation_alert(self, message: discord.Message, violation: Dict[str, Any], action: str, violation_count: int = None):
        """Send moderation alert to designated log channel"""
        try:
            server_config = await self._get_server_config(message.guild.id)
            
            # Get designated log channel
            alert_channel = await self._get_log_channel(message.guild, server_config)
            
            # Fallback to current channel if no log channel set
            if not alert_channel:
                alert_channel = message.channel
            
            embed = discord.Embed(
                title="🚨 Violation Detected",
                color=0xFF0000,
                timestamp=datetime.utcnow()
            )
            embed.add_field(name="User", value=f"{message.author.mention} ({message.author})", inline=True)
            embed.add_field(name="Channel", value=message.channel.mention, inline=True)
            embed.add_field(name="Violation", value=violation['violation_category'].replace('_', ' ').title(), inline=True)
            embed.add_field(name="Confidence", value=f"{violation['confidence']:.1%}", inline=True)
            embed.add_field(name="Action", value=action.replace('_', ' ').title(), inline=True)
            
            if violation_count:
                embed.add_field(name="Warning #", value=f"{violation_count}/3", inline=True)
            
            preview = message.content[:100] + "..." if len(message.content) > 100 else message.content
            embed.add_field(name="Content", value=f"```{preview}```", inline=False)
            
            embed.set_footer(text="CommunityClara AI • Moderation System")
            
            sent_message = await alert_channel.send(embed=embed)
            logger.info(f"📤 Sent alert to #{alert_channel.name} for violation in #{message.channel.name}")
            return sent_message
            
        except Exception as e:
            logger.error(f"Error sending alert: {e}")
            return None

    # Utility methods
    async def _update_message_count(self, guild_id: int):
        """Update server message count"""
        try:
            with get_db_session() as session:
                server = session.query(Server).filter_by(id=str(guild_id)).first()
                if server:
                    server.total_messages_processed = (server.total_messages_processed or 0) + 1
                    session.commit()
        except Exception as e:
            logger.error(f"Error updating message count: {e}")

    async def _initialize_servers(self):
        """Initialize servers in database"""
        for guild in self.guilds:
            await self._ensure_server_exists(guild)
    
    async def _ensure_server_exists(self, guild: discord.Guild):
        """Ensure server exists in database"""
        try:
            with get_db_session() as session:
                existing_server = session.query(Server).filter_by(id=str(guild.id)).first()
                if not existing_server:
                    new_server = Server(
                        id=str(guild.id),
                        name=guild.name,
                        owner_id=str(guild.owner_id),
                        toxicity_threshold=0.6,   # 60% for toxicity (more balanced)
                        auto_delete=True,         # Enable auto-delete for violations
                        auto_timeout=False,       # Warnings first
                        timeout_duration=300
                    )
                    session.add(new_server)
                    session.commit()
                    logger.info(f"📝 Added server to database: {guild.name} with optimal thresholds")

        except Exception as e:
            logger.error(f"Error ensuring server exists: {e}")
    
    async def _get_server_config(self, guild_id: int) -> Optional[Dict]:
        """Get server configuration including all settings - FORCE FRESH QUERY"""
        try:
            with get_db_session() as session:
                # FORCE fresh query - no caching
                server = session.query(Server).filter_by(id=str(guild_id)).first()
                if not server:
                    logger.warning(f"❌ No server found in database for guild_id: {guild_id}")
                    return None
                
                # Log what we got from database
                logger.info(f"🔧 FRESH config from DB: toxicity={server.toxicity_threshold}")
                
                import json
                
                # Parse JSON fields safely
                moderation_channels = []
                exempt_roles = []
                
                try:
                    if server.moderation_channels:
                        moderation_channels = json.loads(server.moderation_channels)
                except:
                    pass
                    
                try:
                    if server.exempt_roles:
                        exempt_roles = json.loads(server.exempt_roles)
                except:
                    pass
                
                config = {
                    'toxicity_threshold': float(server.toxicity_threshold),  # Should be 0.3
                    'spam_threshold': getattr(server, 'spam_threshold', 0.7),
                    'harassment_threshold': getattr(server, 'harassment_threshold', 0.7),
                    'auto_delete': bool(server.auto_delete),
                    'auto_timeout': bool(server.auto_timeout),
                    'timeout_duration': int(server.timeout_duration),
                    'warning_enabled': getattr(server, 'warning_enabled', True),
                    'escalation_enabled': getattr(server, 'escalation_enabled', True),
                    'moderation_channels': moderation_channels,
                    'exempt_roles': exempt_roles,
                    'custom_keywords': server.custom_keywords or '',
                    'violation_log_channel': server.violation_log_channel or '',
                    'escalation_threshold': server.escalation_threshold or 3,
                    'learning_enabled': server.learning_enabled,
                    'privacy_mode': server.privacy_mode,
                    'welcome_message': server.welcome_message or '',
                    
                    # NSFW Settings
                    'nsfw_allowed': getattr(server, 'nsfw_allowed', False),
                    'nsfw_auto_delete': getattr(server, 'nsfw_auto_delete', True),
                    'nsfw_auto_timeout': getattr(server, 'nsfw_auto_timeout', False),
                    'nsfw_auto_ban': getattr(server, 'nsfw_auto_ban', False)
                }
                
                # Debug log the final config
                logger.info(f"🎯 FINAL config: toxicity_threshold={config['toxicity_threshold']}")
                return config
                
        except Exception as e:
            logger.error(f"Error getting server config: {e}")
            return None

    async def _should_moderate_channel(self, channel, server_config) -> bool:
        """Check if channel should be moderated"""
        if not server_config:
            return True
        
        moderation_channels = server_config.get('moderation_channels', [])
        
        # If no specific channels set, moderate all channels
        if not moderation_channels:
            return True
        
        # Check if current channel is in moderation list
        return channel.name in moderation_channels

    async def _is_user_exempt(self, member, server_config) -> bool:
        """Check if user has exempt role"""
        if not server_config:
            return False
        
        exempt_roles = server_config.get('exempt_roles', [])
        if not exempt_roles:
            return False
        
        # Check if user has any exempt role
        user_roles = [role.name for role in member.roles]
        return any(role in exempt_roles for role in user_roles)

    async def _get_log_channel(self, guild, server_config):
        """Get designated log channel or fallback to current channel"""
        if not server_config:
            return None
        
        log_channel_name = server_config.get('violation_log_channel', '')
        if not log_channel_name:
            return None
        
        # Find channel by name
        for channel in guild.channels:
            if channel.name == log_channel_name and hasattr(channel, 'send'):
                return channel
        
        return None

    async def on_member_join(self, member):
        """Handle new member joins with custom welcome message"""
        try:
            server_config = await self._get_server_config(member.guild.id)
            if not server_config:
                return
            
            welcome_template = server_config.get('welcome_message', '')
            if not welcome_template:
                return
            
            # Replace placeholders
            welcome_message = welcome_template.replace('{{user}}', member.mention)
            welcome_message = welcome_message.replace('{{server}}', member.guild.name)
            
            # Send to system channel or general
            channel = member.guild.system_channel
            if not channel:
                # Try to find general channel
                for ch in member.guild.channels:
                    if ch.name.lower() in ['general', 'chat', 'main'] and hasattr(ch, 'send'):
                        channel = ch
                        break
            
            if channel:
                await channel.send(welcome_message)
                logger.info(f"👋 Sent welcome message to {member} in {channel}")
        
        except Exception as e:
            logger.error(f"Error sending welcome message: {e}")
    
    async def _reset_user_warnings(self, user_id: int, server_id: int):
        """Reset user's warning count by updating previous warn1 and warn2 records"""
        try:
            with get_db_session() as session:
                thirty_days_ago = datetime.utcnow() - timedelta(days=30)
                
                # Update all previous warn1 and warn2 actions to 'resolved'
                previous_warnings = session.query(Violation).filter(
                    Violation.user_id == str(user_id),
                    Violation.server_id == str(server_id),
                    Violation.created_at >= thirty_days_ago,
                    Violation.action_taken.in_(['warn1', 'warn2'])
                ).all()
                
                for warning in previous_warnings:
                    warning.action_taken = 'resolved'
                    logger.info(f"🔄 Resolved warning: {warning.action_taken} → resolved")
                
                session.commit()
                logger.info(f"✅ Reset {len(previous_warnings)} warnings for user {user_id}")
                
        except Exception as e:
            logger.error(f"Error resetting user warnings: {e}")
        


    async def on_reaction_add(self, reaction: discord.Reaction, user: discord.Member):
        """Handle feedback on violations via reactions (Feedback Loop)"""
        try:
            # Ignore bot's own reactions
            if user.bot:
                return

            # Only check reactions on our own messages
            if reaction.message.author.id != self.user.id:
                return
            
            # Check for specific feedback emojis
            emoji = str(reaction.emoji)
            if emoji not in ['✅', '❌']:
                return

            logger.info(f"🗳️ Feedback received: {emoji} from {user} on msg {reaction.message.id}")
            
            # Update the database
            await self._handle_feedback(reaction.message.id, emoji, user)
            
        except Exception as e:
            logger.error(f"Error handling reaction: {e}")

    async def _handle_feedback(self, message_id: int, emoji: str, user: discord.Member):
        """Process the feedback and update the violation record"""
        try:
            with get_db_session() as session:
                # Find violation by log_message_id
                violation = session.query(Violation).filter_by(log_message_id=str(message_id)).first()
                
                if not violation:
                    logger.warning(f"⚠️ No violation found for message {message_id}")
                    return

                # Check permissions (admins only for training data)
                if not user.guild_permissions.administrator and not user.guild_permissions.manage_messages:
                    logger.warning(f"⛔ Unauthorized feedback from {user}")
                    return

                # Update the record
                is_false_positive = (emoji == '❌')
                violation.false_positive = is_false_positive
                
                # Update server stats
                server = session.query(Server).filter_by(id=violation.server_id).first()
                if server:
                    if is_false_positive:
                        server.false_positive_count = (server.false_positive_count or 0) + 1
                        logger.info(f"📉 Marked as FALSE POSITIVE by {user}")
                        

                    else:
                        server.true_positive_count = (server.true_positive_count or 0) + 1
                        logger.info(f"📈 Marked as CONFIRMED by {user}")
                
                session.commit()
                
        except Exception as e:
            logger.error(f"Error processing feedback in DB: {e}")

# Create bot instance
bot = CommunityClara()

async def start_bot():
    """Start the Discord bot"""
    try:
        if not config.DISCORD_BOT_TOKEN:
            logger.error("❌ Discord bot token not configured")
            return
        
        logger.info("🚀 Starting CommunityClara Bot with Spam Protection...")
        await bot.start(config.DISCORD_BOT_TOKEN)
        
    except Exception as e:
        logger.error(f"❌ Bot startup error: {e}")
        raise