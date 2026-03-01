from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import logging
from werkzeug.utils import secure_filename
from services.text_extractor import TextExtractor
from services.skill_extractor import SkillExtractor
from services.ats_scorer import ATSScorer
from services.job_matcher import JobMatcher
from utils.preprocessing import preprocess_text
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize services
text_extractor = TextExtractor()
skill_extractor = SkillExtractor()
ats_scorer = ATSScorer()
job_matcher = JobMatcher()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Career Boost AI ML Service',
        'version': '1.0.0',
        'timestamp': time.time()
    })

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    """Main endpoint for resume analysis"""
    start_time = time.time()
    
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        resume_id = request.form.get('resume_id')
        
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
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time()))
        temp_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, temp_filename)
        file.save(file_path)
        
        try:
            # Extract text from file
            logger.info(f"Extracting text from {filename}")
            extracted_text = text_extractor.extract_text(file_path, file.mimetype)
            
            if not extracted_text or len(extracted_text.strip()) < 50:
                return jsonify({
                    'success': False,
                    'error': 'Could not extract sufficient text from the file. Please ensure the file contains readable text.'
                }), 400
            
            # Preprocess text
            processed_text = preprocess_text(extracted_text)
            
            # Extract skills
            logger.info("Extracting skills")
            skills_analysis = skill_extractor.extract_skills(processed_text)
            
            # Calculate ATS score
            logger.info("Calculating ATS score")
            ats_analysis = ats_scorer.calculate_ats_score(processed_text)
            
            # Extract additional information
            logger.info("Extracting additional information")
            additional_info = extract_additional_info(processed_text)
            
            # Combine all analysis results
            analysis = {
                'atsScore': ats_analysis,
                'skills': skills_analysis,
                'experience': additional_info['experience'],
                'education': additional_info['education'],
                'contactInfo': additional_info['contact_info'],
                'keywords': additional_info['keywords'],
                'wordCount': len(processed_text.split()),
                'readabilityScore': calculate_readability_score(processed_text),
                'detectedIndustries': additional_info['industries'],
                'detectedRoles': additional_info['roles'],
                'experienceLevel': determine_experience_level(additional_info['experience'])
            }
            
            processing_time = int((time.time() - start_time) * 1000)  # milliseconds
            
            logger.info(f"Analysis completed in {processing_time}ms")
            
            return jsonify({
                'success': True,
                'extracted_text': extracted_text,
                'analysis': analysis,
                'processing_time': processing_time,
                'resume_id': resume_id
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
                
    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'success': False,
            'error': 'Internal server error during analysis'
        }), 500

@app.route('/extract-text', methods=['POST'])
def extract_text_only():
    """Extract text from file without full analysis"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'Invalid file type'
            }), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time()))
        temp_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, temp_filename)
        file.save(file_path)
        
        try:
            extracted_text = text_extractor.extract_text(file_path, file.mimetype)
            
            return jsonify({
                'success': True,
                'extracted_text': extracted_text,
                'word_count': len(extracted_text.split())
            })
            
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
                
    except Exception as e:
        logger.error(f"Error extracting text: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to extract text'
        }), 500

@app.route('/extract-skills', methods=['POST'])
def extract_skills_only():
    """Extract skills from provided text"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        processed_text = preprocess_text(text)
        skills_analysis = skill_extractor.extract_skills(processed_text)
        
        return jsonify({
            'success': True,
            'skills': skills_analysis
        })
        
    except Exception as e:
        logger.error(f"Error extracting skills: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to extract skills'
        }), 500

@app.route('/calculate-ats', methods=['POST'])
def calculate_ats_only():
    """Calculate ATS score for provided text"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        job_keywords = data.get('job_keywords', [])
        
        processed_text = preprocess_text(text)
        ats_analysis = ats_scorer.calculate_ats_score(processed_text, job_keywords)
        
        return jsonify({
            'success': True,
            'ats_score': ats_analysis
        })
        
    except Exception as e:
        logger.error(f"Error calculating ATS score: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to calculate ATS score'
        }), 500

@app.route('/match-jobs', methods=['POST'])
def match_jobs():
    """Match resume with job descriptions"""
    try:
        data = request.get_json()
        
        if not data or 'resume_text' not in data:
            return jsonify({
                'success': False,
                'error': 'No resume text provided'
            }), 400
        
        resume_text = data['resume_text']
        job_descriptions = data.get('job_descriptions', [])
        filters = data.get('filters', {})
        
        matches = job_matcher.match_jobs(resume_text, job_descriptions, filters)
        
        return jsonify({
            'success': True,
            'matches': matches
        })
        
    except Exception as e:
        logger.error(f"Error matching jobs: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to match jobs'
        }), 500

def extract_additional_info(text):
    """Extract additional information from resume text"""
    import re
    from collections import Counter
    
    # Extract contact information
    contact_info = {}
    
    # Email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    if emails:
        contact_info['email'] = emails[0]
    
    # Phone
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, text)
    if phones:
        contact_info['phone'] = ''.join(phones[0]) if isinstance(phones[0], tuple) else phones[0]
    
    # LinkedIn
    linkedin_pattern = r'linkedin\.com/in/[\w\-]+'
    linkedin_matches = re.findall(linkedin_pattern, text.lower())
    if linkedin_matches:
        contact_info['linkedinUrl'] = f"https://{linkedin_matches[0]}"
    
    # GitHub
    github_pattern = r'github\.com/[\w\-]+'
    github_matches = re.findall(github_pattern, text.lower())
    if github_matches:
        contact_info['githubUrl'] = f"https://{github_matches[0]}"
    
    # Extract experience information
    experience = {
        'totalYears': estimate_total_experience(text),
        'positions': extract_positions(text),
        'industries': []
    }
    
    # Extract education information
    education = extract_education(text)
    
    # Extract keywords
    keywords = extract_keywords(text)
    
    # Detect industries
    industries = detect_industries(text)
    
    # Detect roles
    roles = detect_roles(text)
    
    return {
        'contact_info': contact_info,
        'experience': experience,
        'education': education,
        'keywords': keywords,
        'industries': industries,
        'roles': roles
    }

def estimate_total_experience(text):
    """Estimate total years of experience from text"""
    import re
    
    # Look for patterns like "5 years", "2+ years", etc.
    year_patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)',
        r'(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)',
        r'experience.*?(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*in'
    ]
    
    years = []
    for pattern in year_patterns:
        matches = re.findall(pattern, text.lower())
        years.extend([int(match) for match in matches])
    
    # Also look for date ranges
    date_pattern = r'(\d{4})\s*[-–]\s*(\d{4}|present|current)'
    date_matches = re.findall(date_pattern, text.lower())
    
    total_from_dates = 0
    current_year = 2024
    
    for start, end in date_matches:
        start_year = int(start)
        end_year = current_year if end.lower() in ['present', 'current'] else int(end)
        if end_year > start_year:
            total_from_dates += end_year - start_year
    
    # Return the maximum of explicit mentions or calculated from dates
    return max(max(years) if years else 0, total_from_dates)

def extract_positions(text):
    """Extract job positions from text"""
    # This is a simplified implementation
    # In production, you'd use more sophisticated NLP
    positions = []
    
    # Look for common job title patterns
    title_patterns = [
        r'(software engineer|developer|programmer|analyst|manager|director|lead|senior|junior)',
        r'(consultant|specialist|coordinator|administrator|executive|officer)'
    ]
    
    for pattern in title_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            positions.append({
                'title': match.title(),
                'company': '',
                'duration': '',
                'responsibilities': [],
                'achievements': []
            })
    
    return positions[:5]  # Limit to 5 positions

def extract_education(text):
    """Extract education information from text"""
    education = []
    
    # Look for degree patterns
    degree_patterns = [
        r'(bachelor|master|phd|doctorate|associate).*?(degree|of|in)\s+([a-zA-Z\s]+)',
        r'(b\.?s\.?|m\.?s\.?|m\.?a\.?|ph\.?d\.?|b\.?a\.?)\s+(?:in\s+)?([a-zA-Z\s]+)',
        r'(diploma|certificate)\s+(?:in\s+)?([a-zA-Z\s]+)'
    ]
    
    for pattern in degree_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if len(match) >= 2:
                education.append({
                    'degree': match[0].title(),
                    'field': match[-1].strip().title(),
                    'institution': '',
                    'graduationYear': None
                })
    
    return education[:3]  # Limit to 3 education entries

def extract_keywords(text):
    """Extract important keywords from text"""
    from collections import Counter
    import re
    
    # Remove common stop words and extract meaningful terms
    stop_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'}
    
    # Extract words (3+ characters)
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
    words = [word for word in words if word not in stop_words]
    
    # Count frequency
    word_counts = Counter(words)
    
    # Return top keywords
    keywords = []
    for word, count in word_counts.most_common(20):
        keywords.append({
            'word': word,
            'frequency': count,
            'relevance': min(count / len(words) * 100, 1.0)
        })
    
    return keywords

def detect_industries(text):
    """Detect industries mentioned in text"""
    industries = [
        'technology', 'software', 'healthcare', 'finance', 'education',
        'retail', 'manufacturing', 'consulting', 'marketing', 'sales'
    ]
    
    detected = []
    text_lower = text.lower()
    
    for industry in industries:
        if industry in text_lower:
            # Simple confidence based on frequency
            count = text_lower.count(industry)
            confidence = min(count / 10, 1.0)
            detected.append({
                'name': industry.title(),
                'confidence': confidence
            })
    
    return sorted(detected, key=lambda x: x['confidence'], reverse=True)[:5]

def detect_roles(text):
    """Detect job roles mentioned in text"""
    roles = [
        'software engineer', 'data scientist', 'product manager', 'designer',
        'analyst', 'consultant', 'developer', 'manager', 'director'
    ]
    
    detected = []
    text_lower = text.lower()
    
    for role in roles:
        if role in text_lower:
            count = text_lower.count(role)
            confidence = min(count / 5, 1.0)
            detected.append({
                'title': role.title(),
                'confidence': confidence
            })
    
    return sorted(detected, key=lambda x: x['confidence'], reverse=True)[:5]

def calculate_readability_score(text):
    """Calculate a simple readability score"""
    import re
    
    # Count sentences, words, and syllables (simplified)
    sentences = len(re.findall(r'[.!?]+', text))
    words = len(text.split())
    
    if sentences == 0 or words == 0:
        return 0
    
    # Simplified readability score (0-100)
    avg_sentence_length = words / sentences
    
    # Ideal sentence length is around 15-20 words
    if avg_sentence_length <= 20:
        score = 100 - (abs(avg_sentence_length - 15) * 2)
    else:
        score = max(100 - (avg_sentence_length - 20) * 3, 0)
    
    return min(max(score, 0), 100)

def determine_experience_level(experience_data):
    """Determine experience level based on experience data"""
    total_years = experience_data.get('totalYears', 0)
    
    if total_years < 2:
        return 'Entry'
    elif total_years < 5:
        return 'Mid'
    elif total_years < 10:
        return 'Senior'
    else:
        return 'Executive'

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Career Boost AI ML Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)