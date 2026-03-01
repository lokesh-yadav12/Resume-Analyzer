from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
from docx import Document
import io
import re
from werkzeug.utils import secure_filename
import os
from ats_scorer import ATSScorer
from skill_extractor import SkillExtractor
from job_matcher import JobMatcher

app = Flask(__name__)
CORS(app)

# Initialize services
ats_scorer = ATSScorer()
skill_extractor = SkillExtractor()
job_matcher = JobMatcher()

# Configuration
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_stream):
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(file_stream)
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text() + '\n'
        return text.strip()
    except Exception as e:
        raise Exception(f'PDF extraction error: {str(e)}')

def extract_text_from_docx(file_stream):
    """Extract text from DOCX file"""
    try:
        doc = Document(file_stream)
        text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    except Exception as e:
        raise Exception(f'DOCX extraction error: {str(e)}')

def extract_text_from_txt(file_stream):
    """Extract text from TXT file"""
    try:
        text = file_stream.read().decode('utf-8')
        return text.strip()
    except Exception as e:
        raise Exception(f'TXT extraction error: {str(e)}')

def clean_text(text):
    """Clean and normalize extracted text"""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s\.,;:!?@#\-\(\)\/]', '', text)
    return text.strip()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Text Extraction Service',
        'version': '1.0.0'
    })

@app.route('/extract-text', methods=['POST'])
def extract_text():
    """Extract text from uploaded resume file"""
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Only PDF, DOCX, and TXT files are allowed.'
            }), 400

        # Get file extension
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()

        # Read file into memory
        file_stream = io.BytesIO(file.read())

        # Extract text based on file type
        if file_ext == 'pdf':
            text = extract_text_from_pdf(file_stream)
        elif file_ext in ['docx', 'doc']:
            text = extract_text_from_docx(file_stream)
        elif file_ext == 'txt':
            text = extract_text_from_txt(file_stream)
        else:
            return jsonify({
                'success': False,
                'error': 'Unsupported file type'
            }), 400

        # Clean the extracted text
        cleaned_text = clean_text(text)

        # Basic statistics
        word_count = len(cleaned_text.split())
        char_count = len(cleaned_text)

        return jsonify({
            'success': True,
            'text': cleaned_text,
            'metadata': {
                'filename': filename,
                'file_type': file_ext,
                'word_count': word_count,
                'char_count': char_count
            }
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/analyze-ats', methods=['POST'])
def analyze_ats():
    """Analyze resume for ATS compatibility"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        job_keywords = data.get('job_keywords', None)
        
        # Calculate ATS score
        ats_score = ats_scorer.calculate_ats_score(text, job_keywords)
        
        return jsonify({
            'success': True,
            'atsScore': ats_score
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/extract-skills', methods=['POST'])
def extract_skills():
    """Extract skills from resume text"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        
        # Extract skills
        skills = skill_extractor.extract_skills(text)
        
        return jsonify({
            'success': True,
            'skills': skills
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/match-jobs', methods=['POST'])
def match_jobs():
    """Match resume with job postings"""
    try:
        data = request.get_json()
        
        if not data or 'resumeSkills' not in data or 'jobs' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required data'
            }), 400
        
        resume_skills = data['resumeSkills']
        jobs = data['jobs']
        filters = data.get('filters', {})
        
        # Match jobs
        matched_jobs = job_matcher.match_jobs(resume_skills, jobs, filters)
        
        return jsonify({
            'success': True,
            'matches': matched_jobs
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({
        'success': False,
        'error': 'File size exceeds 5MB limit'
    }), 413

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
