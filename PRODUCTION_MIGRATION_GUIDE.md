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

## 📊 Data Types You Can Export

| Type | Description | Tables Included |
|------|-------------|-----------------|
| `all` | Complete database | All tables |
| `consultations` | Session data with unique concerns | consultation_sessions |
| `users` | User accounts | users, students, faculty |
| `appointments` | Booking data | appointments |
| `departments` | Academic structure | departments, programs |
| `semesters` | Academic periods | semesters |
| `all_academic` | Academic data only | users, students, faculty, departments, programs, semesters |
| `all_sessions` | Session data only | consultation_sessions, appointments |

---

## 🛡️ Security & Best Practices

### **Connection Security**
- Always use SSL connections
- Keep connection strings secure
- Use environment variables for sensitive data

### **Data Validation**
- Check foreign key constraints
- Verify data types match
- Test with small datasets first

### **Backup Strategy**
- Always backup before importing
- Keep multiple backup versions
- Document your migration steps

---

## 🚨 Troubleshooting

### **Common Issues**

1. **Connection Errors**:
   - Verify connection string format
   - Check network connectivity
   - Ensure database allows external connections

2. **Import Errors**:
   - Check for constraint violations
   - Verify table exists
   - Look for data type mismatches

3. **Large File Issues**:
   - Split large exports into smaller files
   - Use streaming uploads for big datasets
   - Consider using background jobs

### **Getting Help**

- Check Render documentation: [render.com/docs](https://render.com/docs)
- PostgreSQL documentation: [postgresql.org/docs](https://postgresql.org/docs)
- Flask-SQLAlchemy: [flask-sqlalchemy.palletsprojects.com](https://flask-sqlalchemy.palletsprojects.com)

---

## 📝 Example Commands

```bash
# Quick export of your unique consultation data
python update_render_database.py export --type consultations

# Interactive mode (recommended for first-time users)
python update_render_database.py

# Check your local data quality first
python analyze_concern_duplicates.py

# Verify your improvements are ready
python backend/test_full_flow.py
```
