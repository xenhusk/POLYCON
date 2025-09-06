"""
Routes for managing the concern analytics prefetch service
"""

from flask import Blueprint, jsonify, request
from services.concern_analytics_prefetch import get_prefetcher, get_prefetcher_status

prefetch_bp = Blueprint('prefetch', __name__)

@prefetch_bp.route('/status', methods=['GET'])
def get_status():
    """Get current prefetch service status"""
    status = get_prefetcher_status()
    return jsonify(status)

@prefetch_bp.route('/force', methods=['POST'])
def force_prefetch():
    """Force an immediate prefetch of concern analytics"""
    prefetcher = get_prefetcher()
    
    if prefetcher is None:
        return jsonify({
            'success': False,
            'error': 'Prefetch service not initialized'
        }), 500
    
    success = prefetcher.force_prefetch()
    
    if success:
        return jsonify({
            'success': True,
            'message': 'Forced prefetch completed successfully'
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Failed to complete forced prefetch'
        }), 500

@prefetch_bp.route('/start', methods=['POST'])
def start_prefetch():
    """Start the prefetch service"""
    prefetcher = get_prefetcher()
    
    if prefetcher is None:
        return jsonify({
            'success': False,
            'error': 'Prefetch service not initialized'
        }), 500
    
    try:
        prefetcher.start()
        return jsonify({
            'success': True,
            'message': 'Prefetch service started'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to start prefetch service: {str(e)}'
        }), 500

@prefetch_bp.route('/stop', methods=['POST'])
def stop_prefetch():
    """Stop the prefetch service"""
    prefetcher = get_prefetcher()
    
    if prefetcher is None:
        return jsonify({
            'success': False,
            'error': 'Prefetch service not initialized'
        }), 500
    
    try:
        prefetcher.stop()
        return jsonify({
            'success': True,
            'message': 'Prefetch service stopped'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to stop prefetch service: {str(e)}'
        }), 500
