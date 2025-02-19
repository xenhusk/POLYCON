from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from datetime import datetime, timedelta

homeadmin_routes_bp = Blueprint('homeadmin_routes', __name__)