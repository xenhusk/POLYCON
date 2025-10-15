# Reminder System Documentation

## Overview
This project has TWO reminder systems due to production environment limitations:

## 1. Background Thread Schedulers (Development Only)
**Files:**
- `services/scheduler_service.py` - Development scheduler
- `services/scheduler_service_production.py` - Production scheduler (doesn't work)

**Status:** 
- ✅ Works in development
- ❌ Broken in Render production (background threads don't execute)

**Issue:** Render production environment prevents background thread loops from executing

## 2. Alternative Reminder System (Production Solution)
**Files:**
- `routes/alternative_reminders.py` - HTTP endpoint-based system

**Endpoints:**
- `GET /alternative-reminders/status` - Health check
- `POST/GET /alternative-reminders/trigger` - Main reminder trigger
- `GET /alternative-reminders/check_upcoming` - Monitor upcoming appointments

**Status:**
- ✅ Works perfectly in production
- ✅ Triggered by external cron service (cron-job.org)
- ✅ Sends reminders via Socket.IO

## Current Production Setup
- **External Cron:** cron-job.org calls `/alternative-reminders/trigger` every 5 minutes
- **URL:** https://polycon.onrender.com/alternative-reminders/trigger
- **Method:** POST with Content-Type: application/json, Body: {}

## Why Keep Both Systems?
1. **Fallback safety** - Multiple options available
2. **Development use** - Background schedulers work fine locally
3. **Learning reference** - Understanding threading limitations
4. **Future flexibility** - If hosting environment changes

## Maintenance Notes
- ✅ Alternative reminder system is the active production solution
- ⚠️ Background schedulers are kept but not functional in production
- 📝 Both systems can coexist safely
- 🔧 Focus maintenance on alternative reminder endpoints

## Testing
Use `test_production_reminders.py` to verify the alternative system is working.
