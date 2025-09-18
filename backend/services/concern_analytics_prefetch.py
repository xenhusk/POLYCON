"""
Concern Analytics Prefetch Service
Automatically generates and caches concern analytics data for faster loading.
"""

import threading
import time
import logging
import os
import requests
from datetime import datetime, timedelta
from typing import Dict, Any
from flask import current_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConcernAnalyticsPrefetcher:
    """
    Background service that periodically prefetches concern analytics data
    to ensure fast loading when users access the analytics.
    """
    
    def __init__(self, app=None, prefetch_interval_minutes: int = 30):
        """
        Initialize the prefetch service.
        
        Args:
            app: Flask application instance
            prefetch_interval_minutes: How often to refresh the cache (in minutes)
        """
        self.app = app
        self.prefetch_interval = prefetch_interval_minutes * 60  # Convert to seconds
        self.running = False
        self.prefetch_thread = None
        self.last_prefetch = None
        self.base_url = None
        
        logger.info(f"ConcernAnalyticsPrefetcher initialized with {prefetch_interval_minutes} minute intervals")

    def start(self):
        """Start the prefetch service in a background thread."""
        if self.running:
            logger.warning("Concern analytics prefetcher is already running")
            return

        self.running = True
        self.prefetch_thread = threading.Thread(
            target=self._prefetch_loop,
            daemon=True,  # Allow main process to exit
            name="ConcernAnalyticsPrefetcher"
        )
        self.prefetch_thread.start()
        logger.info("✅ Concern analytics prefetcher started successfully")

    def stop(self):
        """Stop the prefetch service."""
        if not self.running:
            logger.warning("Concern analytics prefetcher is not running")
            return

        logger.info("🛑 Stopping concern analytics prefetcher...")
        self.running = False
        
        if self.prefetch_thread and self.prefetch_thread.is_alive():
            self.prefetch_thread.join(timeout=5)
            logger.info("✅ Concern analytics prefetcher stopped successfully")

    def _get_base_url(self):
        """Get the base URL for API calls."""
        if self.base_url:
            return self.base_url
            
        # Try to determine the base URL
        if os.getenv('RENDER'):
            # Production on Render
            self.base_url = os.getenv('RENDER_EXTERNAL_URL', 'https://polycon.onrender.com')
        else:
            # Local development
            port = os.getenv('PORT', '5001')
            self.base_url = f'http://localhost:{port}'
            
        logger.info(f"Using base URL: {self.base_url}")
        return self.base_url

    def _prefetch_loop(self):
        """Main prefetch loop that runs in background thread."""
        logger.info(f"🚀 Concern analytics prefetch loop STARTING - refreshing every {self.prefetch_interval/60} minutes")
        
        # Initial delay to let the app fully start
        time.sleep(10)
        
        loop_count = 0
        while self.running:
            try:
                loop_count += 1
                logger.info(f"🔄 Prefetch loop iteration #{loop_count}")
                
                # Prefetch the most common analytics queries
                self._prefetch_common_analytics()
                
                self.last_prefetch = datetime.utcnow()
                logger.info(f"✅ Prefetch completed at {self.last_prefetch}")
                
            except Exception as e:
                logger.error(f"❌ Error in prefetch loop: {e}")
            
            # Wait for the next interval
            time.sleep(self.prefetch_interval)

    def _prefetch_common_analytics(self):
        """Prefetch the most commonly requested analytics combinations."""
        base_url = self._get_base_url()
        analytics_url = f"{base_url}/hometeacher/student_concern_analytics"
        
        # Common query combinations to prefetch
        prefetch_queries = [
            # Global analytics (most common)
            {},
            # Current semester analytics
            self._get_current_semester_params(),
            # Department-wise analytics (if we can determine common departments)
            *self._get_department_queries()
        ]
        
        for i, params in enumerate(prefetch_queries):
            try:
                logger.info(f"Prefetching query {i+1}/{len(prefetch_queries)}: {params}")
                
                response = requests.get(
                    analytics_url, 
                    params=params,
                    timeout=60,  # Allow time for complex analytics
                    headers={'User-Agent': 'ConcernAnalyticsPrefetcher/1.0'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    categories_count = len(data.get('nlp_categories', {}))
                    logger.info(f"✅ Successfully prefetched analytics with {categories_count} categories")
                else:
                    logger.warning(f"⚠️ Prefetch request failed with status {response.status_code}")
                    
            except requests.exceptions.Timeout:
                logger.warning(f"⏰ Prefetch request {i+1} timed out")
            except Exception as e:
                logger.error(f"❌ Error prefetching query {i+1}: {e}")
            
            # Small delay between requests to avoid overwhelming the server
            time.sleep(2)

    def _get_current_semester_params(self) -> Dict[str, Any]:
        """Get parameters for current semester analytics."""
        # This could be enhanced to automatically detect current semester
        # For now, return empty dict (will use default current semester logic)
        return {}

    def _get_department_queries(self) -> list:
        """Get common department queries to prefetch."""
        # This could be enhanced to dynamically get active departments
        # For now, return a few common department IDs if known
        department_queries = []
        
        # Add queries for specific departments if needed
        # department_queries.append({'department_id': '1'})
        # department_queries.append({'department_id': '2'})
        
        return department_queries

    def get_status(self) -> Dict[str, Any]:
        """Get current status of the prefetch service."""
        return {
            'running': self.running,
            'last_prefetch': self.last_prefetch.isoformat() if self.last_prefetch else None,
            'interval_minutes': self.prefetch_interval / 60,
            'thread_alive': self.prefetch_thread.is_alive() if self.prefetch_thread else False,
            'base_url': self.base_url
        }

    def force_prefetch(self):
        """Force an immediate prefetch (useful for testing or manual refresh)."""
        if not self.running:
            logger.warning("Cannot force prefetch - service is not running")
            return False
            
        try:
            logger.info("🔄 Forcing immediate prefetch...")
            self._prefetch_common_analytics()
            self.last_prefetch = datetime.utcnow()
            logger.info("✅ Forced prefetch completed")
            return True
        except Exception as e:
            logger.error(f"❌ Error in forced prefetch: {e}")
            return False


# Global instance
_prefetcher_instance = None

def initialize_concern_analytics_prefetcher(app, prefetch_interval_minutes: int = 30):
    """Initialize and start the concern analytics prefetcher."""
    global _prefetcher_instance
    
    if _prefetcher_instance is not None:
        logger.warning("Concern analytics prefetcher already initialized")
        return _prefetcher_instance
    
    _prefetcher_instance = ConcernAnalyticsPrefetcher(app, prefetch_interval_minutes)
    _prefetcher_instance.start()
    
    return _prefetcher_instance

def get_prefetcher():
    """Get the global prefetcher instance."""
    return _prefetcher_instance

def get_prefetcher_status():
    """Get the status of the prefetcher service."""
    if _prefetcher_instance is None:
        return {
            'running': False,
            'error': 'Prefetcher not initialized'
        }
    
    return _prefetcher_instance.get_status()
