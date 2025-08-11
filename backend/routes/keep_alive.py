"""
Keep-alive endpoint for tracking ping activity
"""

from flask import Blueprint, jsonify
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Create blueprint for keep-alive functionality
keep_alive_bp = Blueprint('keep_alive', __name__)

@keep_alive_bp.route('/ping', methods=['GET'])
def ping():
    """
    Simple ping endpoint to keep the server alive
    """
    timestamp = datetime.utcnow().isoformat()
    logger.info(f"🏓 Keep-alive ping received at {timestamp}")
    
    return jsonify({
        'status': 'alive',
        'timestamp': timestamp,
        'message': 'Polycon server is running'
    })

@keep_alive_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint with more detailed info
    """
    timestamp = datetime.utcnow().isoformat()
    logger.info(f"🔍 Health check requested at {timestamp}")
    
    return jsonify({
        'status': 'healthy',
        'timestamp': timestamp,
        'service': 'polycon',
        'version': '1.0',
        'uptime': 'running'
    })
