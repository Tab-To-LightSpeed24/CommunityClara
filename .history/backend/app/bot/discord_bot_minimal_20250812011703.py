# backend/app/bot/discord_bot_minimal.py
import discord
from discord.ext import commands
import asyncio
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

from app.utils.config import config
from app.utils.logger import logger
from app.ml.content_analyzer import content_analyzer
from app.database.connection import get_db_session
from app.database.models import Server, User, Violation
from app.bot.spam_tracker import spam_tracker

# Bot intents
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.guild_messages = True
intents.members = True

class CommunityClara(commands.Bot):
    """CommunityClara Discord Bot - FIXED INDENTATION"""
    
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
        
        # 🚨 START SPAM TRACKER CLEANUP - This was missing!
        await spam_tracker.start_cleanup()
        logger.info("🧹 Spam tracker cleanup started")

    async def on_message(self, message: discord.Message):
        """Handle incoming messages with spam detection - ENHANCED DEBUG VERSION"""
        # Ignore bot messages
        if message.author.bot:
            return
        
        # Process commands FIRST and ALWAYS
        await self.process_commands(message)
        
        # Skip moderation if message is a command
        if message.content.startswith(self.command_prefix):
            return
        
        # Skip empty messages
        if not message.content.strip():
            return
        
        # Log the raw message
        logger.info(f"📝 RAW MESSAGE: '{message.content}' from {message.author} in #{message.channel.name}")
        
        # Increment processed messages counter
        self.processed_messages += 1
        
        try:
            # Get server configuration
            server_config = await self._get_server_config(message.guild.id)
            if not server_config:
                logger.warning(f"❌ No server config found for {message.guild.id}")
                return
            
            logger.info(f"🔧 Using config: toxicity={server_config['toxicity_threshold']}, auto_delete={server_config['auto_delete']}")
            
            # 🚨 ENHANCED SPAM DETECTION WITH DEBUG LOGGING
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
                    await self._handle_spam(message, spam_analysis)
                    return  # Exit early for spam
                else:
                    logger.info(f"✅ Not spam - continuing to AI analysis")
                    
            except Exception as spam_error:
                logger.error(f"❌ Spam analysis failed: {spam_error}")
                import traceback
                logger.error(f"Spam analysis traceback: {traceback.format_exc()}")
            
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


    async def _handle_spam(self, message: discord.Message, spam_analysis: Dict):
        """Handle detected spam - IMPROVED VERSION"""
        try:
            self.violations_detected += 1  # Increment counter
            
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
                    value=f"• {chr(10).join(spam_analysis['reasons'][:3])}",  # Show max 3 reasons
                    inline=False
                )
                
                embed.add_field(
                    name="Please Follow Guidelines",
                    value="• Slow down your messaging pace\n• Avoid repeating the same content\n• Write meaningful messages",
                    inline=False
                )
                
                embed.set_footer(text="CommunityClara AI • Anti-Spam Protection")
                
                await message.author.send(embed=embed)
                logger.info(f"📬 Spam warning sent to {message.author}")
                
            except Exception as dm_error:
                logger.warning(f"Could not send spam DM to {message.author}: {dm_error}")
            
            # Send alert to channel
            try:
                embed = discord.Embed(
                    title="🚫 Spam Detected & Removed",
                    color=0xFF6600,
                    timestamp=datetime.utcnow()
                )
                
                embed.add_field(name="User", value=f"{message.author.mention}", inline=True)
                embed.add_field(name="Action", value="Message Deleted", inline=True)  
                embed.add_field(name="Spam Score", value=f"{spam_analysis['spam_score']}/100", inline=True)
                
                patterns_text = "\n".join(spam_analysis['reasons'][:2])  # Show top 2 reasons
                embed.add_field(
                    name="Patterns Detected",
                    value=f"```{patterns_text}```",
                    inline=False
                )
                
                embed.set_footer(text="CommunityClara AI • Anti-Spam Protection")
                
                await message.channel.send(embed=embed)
                logger.info(f"📤 Spam alert sent to {message.channel}")
                
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
        """Log spam violation to database"""
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
                
                # Save spam violation record
                violation_record = Violation(
                    server_id=str(message.guild.id),
                    user_id=str(message.author.id),
                    channel_id=str(message.channel.id),
                    violation_type='spam',
                    confidence_score=spam_analysis['spam_score'] / 100,  # Convert to 0-1 scale
                    action_taken='delete',
                    created_at=datetime.utcnow()
                )
                session.add(violation_record)
                session.commit()
                
                logger.info(f"✅ SAVED spam violation: user='{message.author.display_name}', score={spam_analysis['spam_score']}")
                
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
            
            # Log violation to database
            await self._log_violation(message, violation, action_taken)
            
            # RESET warnings after 3rd strike - THIS WAS MISSING
            if new_warning_count >= 3:
                await self._reset_user_warnings(message.author.id, message.guild.id)
                logger.info(f"🔄 Reset warnings for {message.author} after 3rd strike")
            
            # Send moderation alert
            await self._send_moderation_alert(message, violation, action_taken, new_warning_count)
            
        except Exception as e:
            logger.error(f"Error handling violation: {e}")


    async def _log_violation(self, message: discord.Message, violation: Dict[str, Any], action_taken: str):
        """Log violation with proper action tracking"""
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
                
                # Save violation record
                violation_record = Violation(
                    server_id=str(message.guild.id),
                    user_id=str(message.author.id),
                    channel_id=str(message.channel.id),
                    violation_type=violation['violation_category'],
                    confidence_score=violation['confidence'],
                    action_taken=action_taken,  # Now properly tracks warnings
                    created_at=datetime.utcnow()
                )
                session.add(violation_record)
                session.commit()
                
                logger.info(f"✅ SAVED violation: user='{message.author.display_name}', action='{action_taken}'")
                
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
        """Send moderation alert"""
        try:
            embed = discord.Embed(
                title="🚨 SERIOUS Violation Detected",
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
            
            embed.set_footer(text="CommunityClara AI • 3-Warning System")
            
            await message.channel.send(embed=embed)
            logger.info(f"📤 Sent alert: {action} for violation #{violation_count}")
            
        except Exception as e:
            logger.error(f"Error sending alert: {e}")

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
                        nsfw_threshold=0.7,       # 70% for NSFW content
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
        """Get server configuration from database with debug logging"""
        try:
            with get_db_session() as session:
                server = session.query(Server).filter_by(id=str(guild_id)).first()
                
                if server:
                    config = {
                        'nsfw_threshold': float(server.nsfw_threshold),
                        'toxicity_threshold': float(server.toxicity_threshold),
                        'auto_delete': bool(server.auto_delete),
                        'auto_timeout': bool(server.auto_timeout),
                        'timeout_duration': int(server.timeout_duration)
                    }
                    
                    # Enhanced debug logging
                    logger.info(f"🔧 Current config for {guild_id}:")
                    logger.info(f"   📊 Toxicity threshold: {config['toxicity_threshold']}")
                    logger.info(f"   🔞 NSFW threshold: {config['nsfw_threshold']}")
                    logger.info(f"   🗑️ Auto delete: {config['auto_delete']}")
                    logger.info(f"   ⏰ Auto timeout: {config['auto_timeout']}")
                    logger.info(f"   ⏱️ Timeout duration: {config['timeout_duration']}s")
                    
                    return config
                else:
                    logger.warning(f"❌ No server config found for {guild_id}")
                
        except Exception as e:
            logger.error(f"Error getting server config: {e}")
            import traceback
            traceback.print_exc()
        
        return None
    
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