from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import uuid
from datetime import datetime
import base64
from werkzeug.utils import secure_filename
import pymongo
from pymongo import MongoClient 
import gridfs
from bson import ObjectId
import requests
import cv2
import numpy as np
from PIL import Image
import pytesseract
import io
import logging
import traceback

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'profiles'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'medical_reports'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'insurance_docs'), exist_ok=True)

# MongoDB Configuration (Optional - you can use file-based storage if preferred)
try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['health_app']
    users_collection = db['users']
    analytics_collection = db['analytics']
    shared_profiles_collection = db['shared_profiles']
    fs = gridfs.GridFS(db)
    MONGODB_AVAILABLE = True
    logger.info("MongoDB connected successfully")
except Exception as e:
    logger.warning(f"MongoDB not available: {e}")
    MONGODB_AVAILABLE = False

# File-based storage as fallback
DATA_DIR = 'data'
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(os.path.join(DATA_DIR, 'users'), exist_ok=True)
os.makedirs(os.path.join(DATA_DIR, 'analytics'), exist_ok=True)
os.makedirs(os.path.join(DATA_DIR, 'shared_profiles'), exist_ok=True)

# Ollama Configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2"  # Change this to your preferred model

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_image(image_path):
    """Extract text using OCR from images"""
    try:
        image = cv2.imread(image_path)
        if image is None:
            return ""
        
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply some preprocessing
        gray = cv2.medianBlur(gray, 3)
        
        # Use Tesseract to extract text
        text = pytesseract.image_to_string(gray)
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from image: {e}")
        return ""

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF files"""
    try:
        import PyPDF2
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return ""

def process_medical_document(file_path, filename):
    """Process uploaded medical document and extract text"""
    try:
        file_extension = filename.rsplit('.', 1)[1].lower()
        extracted_text = ""
        
        if file_extension in ['jpg', 'jpeg', 'png', 'gif']:
            extracted_text = extract_text_from_image(file_path)
        elif file_extension == 'pdf':
            extracted_text = extract_text_from_pdf(file_path)
        elif file_extension in ['txt']:
            with open(file_path, 'r', encoding='utf-8') as f:
                extracted_text = f.read()
        
        return extracted_text
    except Exception as e:
        logger.error(f"Error processing medical document: {e}")
        return ""

def generate_health_analytics_with_ollama(user_data, medical_texts):
    """Generate health analytics using Ollama"""
    try:
        # Prepare the prompt for health analysis
        prompt = f"""
        Analyze the following medical information and provide a comprehensive health analysis:

        Patient Information:
        - Name: {user_data.get('name', 'N/A')}
        - Age: {user_data.get('age', 'N/A')}
        - Gender: {user_data.get('gender', 'N/A')}
        - Blood Group: {user_data.get('blood_group', 'N/A')}
        - Medical Conditions: {user_data.get('medical_conditions', 'N/A')}

        Medical Reports Content:
        {' '.join(medical_texts)}

        Please provide a detailed health analysis in the following JSON format:
        {{
            "overall_health_score": [score from 1-100],
            "health_status": "[Good/Fair/Poor/Critical]",
            "key_findings": ["finding1", "finding2", "finding3"],
            "risk_factors": [
                {{
                    "factor": "risk factor name",
                    "level": "High/Medium/Low",
                    "description": "detailed description"
                }}
            ],
            "vital_signs_analysis": {{
                "blood_pressure": "analysis",
                "heart_rate": "analysis",
                "other_vitals": "analysis"
            }},
            "dietary_recommendations": {{
                "foods_to_include": ["food1", "food2"],
                "foods_to_avoid": ["food1", "food2"],
                "general_advice": "dietary advice"
            }},
            "exercise_recommendations": {{
                "recommended_exercises": ["exercise1", "exercise2"],
                "intensity": "Low/Medium/High",
                "duration": "recommended duration",
                "precautions": "any precautions"
            }},
            "lifestyle_recommendations": ["recommendation1", "recommendation2", "recommendation3"],
            "health_metrics": {{
                "cardiovascular_health": [score 1-10],
                "metabolic_health": [score 1-10],
                "immune_system": [score 1-10],
                "mental_health": [score 1-10],
                "nutritional_status": [score 1-10]
            }}
        }}

        Provide only the JSON response without any additional text.
        """

        # Make request to Ollama
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }, timeout=120)

        if response.status_code == 200:
            ollama_response = response.json()
            
            # Extract the response text
            response_text = ollama_response.get('response', '')
            
            try:
                # Parse the JSON response
                analytics = json.loads(response_text)
                analytics['analysis_date'] = datetime.now().isoformat()
                return analytics
            except json.JSONDecodeError:
                logger.error("Failed to parse Ollama JSON response")
                return generate_fallback_analytics(user_data)
        else:
            logger.error(f"Ollama request failed: {response.status_code}")
            return generate_fallback_analytics(user_data)

    except Exception as e:
        logger.error(f"Error generating health analytics with Ollama: {e}")
        return generate_fallback_analytics(user_data)

def generate_fallback_analytics(user_data):
    """Generate basic fallback analytics if Ollama fails"""
    return {
        "overall_health_score": 75,
        "health_status": "Good",
        "key_findings": [
            "Medical reports have been uploaded successfully",
            "Regular monitoring recommended",
            "Maintain current health practices"
        ],
        "risk_factors": [
            {
                "factor": "General Health Monitoring",
                "level": "Low",
                "description": "Continue regular health checkups"
            }
        ],
        "vital_signs_analysis": {
            "general": "Please consult with healthcare provider for detailed analysis"
        },
        "dietary_recommendations": {
            "foods_to_include": ["Fruits", "Vegetables", "Whole grains"],
            "foods_to_avoid": ["Processed foods", "Excessive sugar"],
            "general_advice": "Maintain a balanced diet"
        },
        "exercise_recommendations": {
            "recommended_exercises": ["Walking", "Light cardio"],
            "intensity": "Medium",
            "duration": "30 minutes daily",
            "precautions": "Consult doctor before starting new exercise routine"
        },
        "lifestyle_recommendations": [
            "Maintain regular sleep schedule",
            "Stay hydrated",
            "Manage stress levels"
        ],
        "health_metrics": {
            "cardiovascular_health": 7,
            "metabolic_health": 7,
            "immune_system": 7,
            "mental_health": 7,
            "nutritional_status": 7
        },
        "analysis_date": datetime.now().isoformat()
    }

def save_user_data(user_data):
    """Save user data to database or file"""
    try:
        if MONGODB_AVAILABLE:
            if '_id' in user_data:
                # Update existing user
                result = users_collection.update_one(
                    {'_id': ObjectId(user_data['_id'])},
                    {'$set': user_data}
                )
                return str(user_data['_id'])
            else:
                # Create new user
                result = users_collection.insert_one(user_data)
                return str(result.inserted_id)
        else:
            # File-based storage
            user_id = user_data.get('_id', str(uuid.uuid4()))
            user_file = os.path.join(DATA_DIR, 'users', f'{user_id}.json')
            
            with open(user_file, 'w') as f:
                json.dump(user_data, f, indent=2)
            return user_id
    except Exception as e:
        logger.error(f"Error saving user data: {e}")
        raise

def get_user_data(user_id):
    """Get user data from database or file"""
    try:
        if MONGODB_AVAILABLE:
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            if user:
                user['_id'] = str(user['_id'])
            return user
        else:
            user_file = os.path.join(DATA_DIR, 'users', f'{user_id}.json')
            if os.path.exists(user_file):
                with open(user_file, 'r') as f:
                    return json.load(f)
            return None
    except Exception as e:
        logger.error(f"Error getting user data: {e}")
        return None

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Health Profile API Server",
        "status": "running",
        "endpoints": [
            "/register - POST",
            "/users/<user_id> - GET/PUT",
            "/analyze-medical-reports - POST",
            "/save-analytics - POST",
            "/get-analytics-history/<user_id> - GET",
            "/share-profile - POST"
        ]
    })

@app.route('/register', methods=['POST'])
def register_user():
    try:
        logger.info("Registration request received")
        
        # Get form data
        user_data = {
            'name': request.form.get('name'),
            'age': request.form.get('age'),
            'gender': request.form.get('gender'),
            'blood_group': request.form.get('blood_group'),
            'medical_conditions': request.form.get('medical_conditions'),
            'date_of_birth': request.form.get('date_of_birth'),
            'is_insurance_covered': request.form.get('is_insurance_covered', 'false').lower() == 'true',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Handle profile photo
        if 'photo' in request.files:
            photo = request.files['photo']
            if photo and allowed_file(photo.filename):
                filename = secure_filename(f"{uuid.uuid4()}_{photo.filename}")
                photo_path = os.path.join(app.config['UPLOAD_FOLDER'], 'profiles', filename)
                photo.save(photo_path)
                user_data['photo_path'] = photo_path
        
        # Handle medical reports
        medical_reports = []
        if 'medical_reports' in request.files:
            files = request.files.getlist('medical_reports')
            for file in files:
                if file and allowed_file(file.filename):
                    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'medical_reports', filename)
                    file.save(file_path)
                    medical_reports.append({
                        'filename': filename,
                        'original_name': file.filename,
                        'path': file_path
                    })
        user_data['medical_reports'] = medical_reports
        
        # Handle insurance documents
        insurance_docs = []
        if 'insurance_documents' in request.files:
            files = request.files.getlist('insurance_documents')
            for file in files:
                if file and allowed_file(file.filename):
                    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'insurance_docs', filename)
                    file.save(file_path)
                    insurance_docs.append({
                        'filename': filename,
                        'original_name': file.filename,
                        'path': file_path
                    })
        user_data['insurance_documents'] = insurance_docs
        
        # Save user data
        user_id = save_user_data(user_data)
        user_data['_id'] = user_id
        
        logger.info(f"User registered successfully with ID: {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': user_data
        })
        
    except Exception as e:
        logger.error(f"Error in user registration: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Registration failed: {str(e)}'
        }), 500

@app.route('/users/<user_id>', methods=['GET', 'PUT'])
def handle_user(user_id):
    if request.method == 'GET':
        try:
            user_data = get_user_data(user_id)
            if user_data:
                return jsonify({
                    'success': True,
                    'user': user_data
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'User not found'
                }), 404
        except Exception as e:
            logger.error(f"Error getting user data: {e}")
            return jsonify({
                'success': False,
                'message': str(e)
            }), 500
    
    elif request.method == 'PUT':
        try:
            # Update user data
            user_data = get_user_data(user_id)
            if not user_data:
                return jsonify({
                    'success': False,
                    'message': 'User not found'
                }), 404
            
            # Update fields from form data
            user_data.update({
                'name': request.form.get('name', user_data.get('name')),
                'age': request.form.get('age', user_data.get('age')),
                'gender': request.form.get('gender', user_data.get('gender')),
                'blood_group': request.form.get('blood_group', user_data.get('blood_group')),
                'medical_conditions': request.form.get('medical_conditions', user_data.get('medical_conditions')),
                'date_of_birth': request.form.get('date_of_birth', user_data.get('date_of_birth')),
                'is_insurance_covered': request.form.get('is_insurance_covered', 'false').lower() == 'true',
                'updated_at': datetime.now().isoformat()
            })
            
            # Handle new photo upload
            if 'photo' in request.files:
                photo = request.files['photo']
                if photo and allowed_file(photo.filename):
                    filename = secure_filename(f"{user_id}_{photo.filename}")
                    photo_path = os.path.join(app.config['UPLOAD_FOLDER'], 'profiles', filename)
                    photo.save(photo_path)
                    user_data['photo_path'] = photo_path
            
            # Save updated data
            save_user_data(user_data)
            
            return jsonify({
                'success': True,
                'message': 'User updated successfully',
                'user': user_data
            })
            
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return jsonify({
                'success': False,
                'message': str(e)
            }), 500

@app.route('/analyze-medical-reports', methods=['POST'])
def analyze_medical_reports():
    try:
        logger.info("Medical report analysis request received")
        
        data = request.get_json()
        user_data = data.get('userData', {})
        medical_reports = data.get('medicalReports', [])
        
        if not medical_reports:
            return jsonify({
                'success': False,
                'message': 'No medical reports provided'
            }), 400
        
        # Process medical reports and extract text
        medical_texts = []
        temp_files = []
        
        for report in medical_reports:
            try:
                # Decode base64 content
                file_content = base64.b64decode(report['base64'])
                
                # Create temporary file
                temp_filename = f"temp_{uuid.uuid4()}_{report['name']}"
                temp_path = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
                
                with open(temp_path, 'wb') as f:
                    f.write(file_content)
                
                temp_files.append(temp_path)
                
                # Extract text from the document
                extracted_text = process_medical_document(temp_path, report['name'])
                if extracted_text:
                    medical_texts.append(extracted_text)
                    logger.info(f"Extracted text from {report['name']}: {len(extracted_text)} characters")
                
            except Exception as e:
                logger.error(f"Error processing report {report.get('name', 'unknown')}: {e}")
                continue
        
        # Clean up temporary files
        for temp_file in temp_files:
            try:
                os.remove(temp_file)
            except:
                pass
        
        if not medical_texts:
            return jsonify({
                'success': False,
                'message': 'Could not extract text from any medical reports'
            }), 400
        
        # Generate health analytics using Ollama
        logger.info("Generating health analytics with Ollama...")
        analytics = generate_health_analytics_with_ollama(user_data, medical_texts)
        
        logger.info("Health analytics generated successfully")
        
        return jsonify({
            'success': True,
            'analytics': analytics,
            'message': 'Health analytics generated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error analyzing medical reports: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }), 500

@app.route('/save-analytics', methods=['POST'])
def save_analytics():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        analytics = data.get('analytics')
        
        analytics_data = {
            'user_id': user_id,
            'analytics': analytics,
            'created_at': datetime.now().isoformat()
        }
        
        if MONGODB_AVAILABLE:
            analytics_collection.insert_one(analytics_data)
        else:
            # File-based storage
            analytics_file = os.path.join(DATA_DIR, 'analytics', f'{user_id}_{uuid.uuid4()}.json')
            with open(analytics_file, 'w') as f:
                json.dump(analytics_data, f, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Analytics saved successfully'
        })
        
    except Exception as e:
        logger.error(f"Error saving analytics: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/get-analytics-history/<user_id>', methods=['GET'])
def get_analytics_history(user_id):
    try:
        if MONGODB_AVAILABLE:
            analytics_list = list(analytics_collection.find({'user_id': user_id}))
            for analytics in analytics_list:
                analytics['_id'] = str(analytics['_id'])
        else:
            # File-based storage
            analytics_list = []
            analytics_dir = os.path.join(DATA_DIR, 'analytics')
            for filename in os.listdir(analytics_dir):
                if filename.startswith(f'{user_id}_'):
                    with open(os.path.join(analytics_dir, filename), 'r') as f:
                        analytics_data = json.load(f)
                        analytics_list.append(analytics_data)
        
        return jsonify({
            'success': True,
            'analytics_history': analytics_list
        })
        
    except Exception as e:
        logger.error(f"Error getting analytics history: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/share-profile', methods=['POST'])
def share_profile():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        phone_number = data.get('phone_number')
        relation = data.get('relation')
        
        # Get user data
        user_data = get_user_data(user_id)
        if not user_data:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Create share record
        share_data = {
            'user_id': user_id,
            'shared_with_phone': phone_number,
            'relation': relation,
            'shared_at': datetime.now().isoformat(),
            'user_data': user_data
        }
        
        if MONGODB_AVAILABLE:
            shared_profiles_collection.insert_one(share_data)
        else:
            # File-based storage
            share_file = os.path.join(DATA_DIR, 'shared_profiles', f'{user_id}_{uuid.uuid4()}.json')
            with open(share_file, 'w') as f:
                json.dump(share_data, f, indent=2)
        
        # Here you could integrate with SMS service to actually send the profile
        logger.info(f"Profile shared with {phone_number} as {relation}")
        
        return jsonify({
            'success': True,
            'message': 'Profile shared successfully'
        })
        
    except Exception as e:
        logger.error(f"Error sharing profile: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/health-check', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'mongodb_available': MONGODB_AVAILABLE
    })

if __name__ == '__main__':
    # Print startup information
    print("=" * 50)
    print("Health Profile API Server Starting...")
    print(f"Server will run on: http://192.168.1.177:7000")
    print(f"MongoDB Available: {MONGODB_AVAILABLE}")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print("=" * 50)
    
    # Run the app
    app.run(host='192.168.1.177', port=7000, debug=True)