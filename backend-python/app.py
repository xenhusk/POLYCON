from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.consultation_routes import consultation_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(consultation_bp, url_prefix='/consultation')

@app.route('/')
def home():
    return jsonify({"message": "POLYCON Python Backend is Running"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
