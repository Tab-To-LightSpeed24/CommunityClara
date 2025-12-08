#!/usr/bin/env python3
"""Generate analytics data for existing servers"""

import asyncio
from app.database.connection import get_db_session
from app.database.models import Server
from app.services.community_learner import CommunityLearner

async def main():
    learner = CommunityLearner()
    
    with get_db_session() as session:
        servers = session.query(Server).all()
        
        for server in servers:
            print(f"Generating analytics for {server.name} ({server.id})...")
            await learner.update_daily_analytics(server.id)
            print(f"✅ Done for {server.name}")

if __name__ == "__main__":
    asyncio.run(main())