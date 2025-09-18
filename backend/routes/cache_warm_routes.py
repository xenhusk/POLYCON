"""
Simple cache warming endpoint for concern analytics
This can be called by external cron services like cron-job.org
"""

from flask import Blueprint, jsonify, request
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

cache_warm_bp = Blueprint('cache_warm', __name__)

@cache_warm_bp.route('/warm-analytics-cache', methods=['GET', 'POST'])
def warm_analytics_cache():
    """
    Warm up the concern analytics cache by making internal API calls.
    This endpoint can be called by external cron services.
    """
    try:
        logger.info("🔥 Starting cache warming process...")
        start_time = datetime.now()
        
        # Import here to avoid circular imports
        from routes.hometeacher_routes import get_student_concern_analytics
        from flask import current_app
        
        # Create a mock request context for the analytics call
        with current_app.test_request_context():
            # Call the analytics function directly to warm the cache
            # This bypasses HTTP overhead and directly populates the cache
            result = get_student_concern_analytics()
            
            # Check if the result is successful
            if isinstance(result, tuple) and result[1] == 200:
                data = result[0].get_json()
                categories_count = len(data.get('nlp_categories', {}))
                duration = (datetime.now() - start_time).total_seconds()
                
                logger.info(f"✅ Cache warming completed in {duration:.2f} seconds")
                logger.info(f"   - Categories processed: {categories_count}")
                
                return jsonify({
                    'success': True,
                    'message': 'Analytics cache warmed successfully',
                    'duration_seconds': duration,
                    'categories_processed': categories_count,
                    'timestamp': datetime.now().isoformat()
                })
            else:
                logger.error("❌ Analytics call failed during cache warming")
                return jsonify({
                    'success': False,
                    'error': 'Analytics call failed',
                    'timestamp': datetime.now().isoformat()
                }), 500
                
    except Exception as e:
        logger.error(f"❌ Cache warming error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@cache_warm_bp.route('/cache-status', methods=['GET'])
def cache_status():
    """Get basic cache status information"""
    try:
        # Import the cache from hometeacher_routes
        from routes.hometeacher_routes import concern_analytics_cache
        
        cache_info = {
            'cache_entries': len(concern_analytics_cache.get('data', {})),
            'last_updated': concern_analytics_cache.get('last_updated'),
            'last_session_count': concern_analytics_cache.get('last_session_count'),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(cache_info)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@cache_warm_bp.route('/health', methods=['GET'])
def health_check():
    """Simple health check for external monitoring services"""
    return jsonify({
        'status': 'healthy',
        'service': 'cache-warming',
        'timestamp': datetime.now().isoformat()
    })
