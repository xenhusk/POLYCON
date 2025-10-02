# Concern Analytics Prefetch Setup Guide

This guide explains how to set up automatic prefetching for concern analytics data to improve loading performance.

## What is Prefetching?

The concern analytics system processes large amounts of data using AI and machine learning algorithms. This can take 10-30 seconds on first load. Prefetching automatically generates and caches this data in the background so users get instant results.

## Implementation Options

### Option 1: Background Service (Recommended for Development)

The system includes a background prefetch service that runs automatically:

- **Automatic**: Refreshes cache every 30 minutes
- **Manual**: Force refresh via admin panel or API
- **Monitoring**: Status dashboard in Admin Portal

**Endpoints:**
- `GET /prefetch/status` - Check service status
- `POST /prefetch/force` - Force immediate cache refresh
- `POST /prefetch/start` - Start the service
- `POST /prefetch/stop` - Stop the service

### Option 2: External Cron Service (Recommended for Production)

For production environments like Render where background threads may not work reliably, use external cron services:

**Simple Cache Warming Endpoint:**
```
GET/POST {your-domain}/cache/warm-analytics-cache
```

**Example with cron-job.org:**
1. Go to https://cron-job.org
2. Create a new cron job
3. Set URL: `https://your-app.onrender.com/cache/warm-analytics-cache`
4. Set schedule: Every 30 minutes
5. Set method: GET or POST

**Example Schedule Options:**
- Every 30 minutes: `*/30 * * * *`
- Every hour: `0 * * * *`
- Every 2 hours: `0 */2 * * *`
- Business hours only: `0 8-18/2 * * 1-5` (every 2 hours, 8am-6pm, weekdays)

## API Endpoints Reference

### Prefetch Service Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/prefetch/status` | GET | Get service status and last run info |
| `/prefetch/force` | POST | Force immediate cache refresh |
| `/prefetch/start` | POST | Start the background service |
| `/prefetch/stop` | POST | Stop the background service |

### Cache Warming Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cache/warm-analytics-cache` | GET/POST | Warm up analytics cache (for external cron) |
| `/cache/cache-status` | GET | Get cache status information |
| `/cache/health` | GET | Health check for monitoring |

## Testing the Setup

### Test Background Service (Development)
```bash
# Check if service is running
curl http://localhost:5001/prefetch/status

# Force a cache refresh
curl -X POST http://localhost:5001/prefetch/force

# Test analytics load speed
curl http://localhost:5001/hometeacher/student_concern_analytics
```

### Test Cache Warming (Production)
```bash
# Warm the cache
curl https://your-app.onrender.com/cache/warm-analytics-cache

# Check cache status
curl https://your-app.onrender.com/cache/cache-status

# Test analytics load speed
curl https://your-app.onrender.com/hometeacher/student_concern_analytics
```

### Using the Test Script
```bash
# Test local development
python test_prefetch_service.py

# Test production
python test_prefetch_service.py https://your-app.onrender.com
```

## Monitoring

### Admin Panel
- The Admin Portal includes a Prefetch Monitor component
- Shows real-time status, last run time, and controls
- Allows manual cache refresh with one click

### Response Times
- **Without prefetch**: 10-30 seconds (cold cache)
- **With prefetch**: 1-3 seconds (warm cache)

### Logs
Check application logs for prefetch activity:
```
✅ Concern analytics prefetch service initialized
🔄 Prefetch loop iteration #1
✅ Successfully prefetched analytics with 8 categories
```

## Troubleshooting

### Background Service Not Working
1. Check service status: `GET /prefetch/status`
2. Look for thread_alive: false in response
3. Try restarting: `POST /prefetch/stop` then `POST /prefetch/start`
4. Check application logs for errors

### External Cron Not Working
1. Test the endpoint manually: `curl {domain}/cache/warm-analytics-cache`
2. Check if the response shows `"success": true`
3. Verify the cron service is hitting the correct URL
4. Check your app's request logs

### Cache Not Improving Performance
1. Verify cache is being populated: `GET /cache/cache-status`
2. Check if `cache_entries > 0`
3. Make sure you're testing the same query parameters
4. Clear browser cache if testing in frontend

## Recommended Setup

### For Development
- Use the background prefetch service
- Monitor via Admin Panel
- Set interval to 30 minutes

### For Production
- Use external cron service (cron-job.org)
- Hit `/cache/warm-analytics-cache` every 30 minutes
- Set up monitoring alerts for failed requests
- Consider running during off-peak hours if data changes are predictable

## Security Notes

- All endpoints require the same authentication as the main app
- Consider rate limiting for cache warming endpoints
- Monitor for unusual request patterns
- The cache warming endpoint is designed to be called by trusted external services

## Performance Impact

- **CPU**: Minimal when cache is warm
- **Memory**: Increases slightly due to cached data
- **Network**: Reduces user-facing request times
- **Database**: Same query load, but spread out over time instead of on-demand

---

For questions or issues, check the application logs or test the endpoints manually using the provided curl commands.
