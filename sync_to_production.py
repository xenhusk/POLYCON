# Production Data Migration Guide

## 🚀 Quick Start - Transfer Local Data to Production

### **Option 1: Full Database Export (Recommended)**

```bash
# 1. Export your entire local database
python update_render_database.py export --type all

# 2. Follow the generated instructions to upload to Render
```

### **Option 2: Export Only Your Unique Concerns**

```bash
# Export just consultation sessions with your improved data
python update_render_database.py export --type consultations
```

---

## 📋 Step-by-Step Process

### **Step 1: Prepare Your Data**

1. **Ensure your local database has the unique concerns**:
   ```bash
   python analyze_concern_duplicates.py
   ```
   ✅ Should show 0% duplication rate

2. **Export your data**:
   ```bash
   python update_render_database.py
   ```
   - Choose option 1 for full export
   - Choose option 2 for specific data

### **Step 2: Access Render Database**

1. **Go to your Render Dashboard**:
   - Open [render.com/dashboard](https://render.com/dashboard)
   - Navigate to your PostgreSQL database service
   - Click "Connect" tab
   - Copy the **External Connection String**

2. **Format will look like**:
   ```
   postgresql://username:password@host:port/database_name
   ```

### **Step 3: Upload to Production**

#### **Method A: Direct psql Upload**
```bash
# If you have psql installed locally:
psql "your_render_connection_string" < database/your_exported_file.sql
```

#### **Method B: Via Render Shell**
1. Go to your **Backend Service** in Render
2. Open the **Shell** tab
3. Upload your SQL file to your repository
4. Run the import command in the shell

#### **Method C: Manual SQL Execution**
1. Connect to your Render database using a tool like pgAdmin or DBeaver
2. Execute the SQL file contents manually

---

## ⚠️ Important Safety Steps

### **Before Upload:**

1. **Backup Production Database**:
   ```bash
   # Connect to render and export current data
   pg_dump "your_render_connection_string" > database/production_backup_$(date +%Y%m%d).sql
   ```

2. **Test with Small Dataset First**:
   - Export just 10-20 consultation sessions
   - Upload those first to test the process

### **After Upload:**

1. **Verify Data Integrity**:
   ```bash
   # Run your analytics to ensure everything works
   curl https://your-app.onrender.com/api/hometeacher-analytics
   ```

2. **Check Concern Quality**:
   - Verify that your unique concerns transferred correctly
   - Test the analytics dashboard

---

## 🔧 Alternative Methods

### **Method 4: API-Based Data Sync**

<function_calls>
<invoke name="create_file">
<parameter name="content">#!/usr/bin/env python3
"""
API-Based Data Synchronization
------------------------------
Upload data to production via your Flask API endpoints
Usage: python sync_to_production.py --url https://your-app.onrender.com
"""

import requests
import json
import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

class APIDataSync:
    def __init__(self, production_url, local_db_url=None):
        self.base_url = production_url.rstrip('/')
        self.session = requests.Session()
        self.local_db_url = local_db_url or os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost/polycon')
    
    def get_local_sessions(self, limit=None):
        """Get consultation sessions from local database"""
        try:
            conn = psycopg2.connect(self.local_db_url)
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            query = "SELECT * FROM consultation_sessions ORDER BY created_at DESC"
            if limit:
                query += f" LIMIT {limit}"
            
            cursor.execute(query)
            sessions = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return sessions
        except Exception as e:
            print(f"❌ Error connecting to local database: {e}")
            return []
    
    def sync_consultation_sessions(self, limit=None):
        """Sync consultation sessions via API"""
        
        sessions = self.get_local_sessions(limit)
        
        if not sessions:
            print("❌ No sessions found in local database")
            return
        
        success_count = 0
        error_count = 0
        
        print(f"🚀 Starting sync of {len(sessions)} sessions...")
        
        for session in sessions:
            try:
                # Convert to dict and handle datetime serialization
                session_data = dict(session)
                
                # Convert datetime objects to ISO format strings
                for key, value in session_data.items():
                    if hasattr(value, 'isoformat'):
                        session_data[key] = value.isoformat()
                
                # Send to production
                response = self.session.post(
                    f"{self.base_url}/api/consultation-sessions",
                    json=session_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                if response.status_code in [200, 201]:
                    success_count += 1
                    print(f"✅ Synced session {session.get('id', 'unknown')}")
                else:
                    error_count += 1
                    print(f"❌ Failed session {session.get('id', 'unknown')}: {response.status_code} - {response.text[:100]}")
            
            except Exception as e:
                error_count += 1
                print(f"❌ Error with session {session.get('id', 'unknown')}: {e}")
        
        print(f"\n📊 Sync Results:")
        print(f"✅ Success: {success_count}")
        print(f"❌ Errors: {error_count}")
        print(f"📈 Total: {len(sessions)}")
        print(f"📈 Success Rate: {(success_count/len(sessions)*100):.1f}%")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Sync POLYCON data to production via API')
    parser.add_argument('--url', required=True, help='Production API URL (e.g., https://your-app.onrender.com)')
    parser.add_argument('--limit', type=int, help='Limit number of records to sync (useful for testing)')
    parser.add_argument('--local-db', help='Local database URL (default: from DATABASE_URL env var)')
    parser.add_argument('--type', default='consultations', 
                       choices=['consultations'], help='Data type to sync')
    
    args = parser.parse_args()
    
    print(f"🔄 Syncing {args.type} to {args.url}")
    if args.limit:
        print(f"📊 Limited to {args.limit} records")
    
    syncer = APIDataSync(args.url, args.local_db)
    
    if args.type == 'consultations':
        syncer.sync_consultation_sessions(args.limit)

if __name__ == '__main__':
    main()
