import re
import string

def preprocess_text(text):
    """
    Preprocess resume text for analysis
    
    Args:
        text (str): Raw resume text
        
    Returns:
        str: Cleaned and preprocessed text
    """
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep important punctuation
    text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\[\]\/\@\#\$\%\&\*\+\=]', ' ', text)
    
    # Normalize common resume formatting
    text = normalize_resume_formatting(text)
    
    # Remove excessive punctuation
    text = re.sub(r'[\.]{3,}', '...', text)
    text = re.sub(r'[\-]{3,}', '---', text)
    
    # Clean up spacing
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def normalize_resume_formatting(text):
    """Normalize common resume formatting patterns"""
    
    # Normalize bullet points
    bullet_patterns = [
        r'[•●▪▸→]',  # Various bullet symbols
        r'^\s*[\*\-\+]\s+',  # Asterisk, dash, plus bullets
        r'^\s*\d+[\.\)]\s+',  # Numbered lists
    ]
    
    for pattern in bullet_patterns:
        text = re.sub(pattern, '• ', text, flags=re.MULTILINE)
    
    # Normalize section headers (make them consistent)
    section_patterns = {
        r'(?i)work\s+experience|professional\s+experience|employment\s+history': 'EXPERIENCE',
        r'(?i)education|academic\s+background': 'EDUCATION',
        r'(?i)skills|technical\s+skills|core\s+competencies': 'SKILLS',
        r'(?i)projects|portfolio': 'PROJECTS',
        r'(?i)certifications?|licenses?': 'CERTIFICATIONS',
        r'(?i)achievements?|accomplishments?': 'ACHIEVEMENTS'
    }
    
    for pattern, replacement in section_patterns.items():
        text = re.sub(pattern, replacement, text)
    
    return text

def extract_sections(text):
    """
    Extract different sections from resume text
    
    Returns:
        dict: Dictionary with section names as keys and content as values
    """
    sections = {}
    
    # Define section patterns
    section_patterns = {
        'contact': r'(?i)(?:contact|personal)\s+(?:information|details)',
        'summary': r'(?i)(?:summary|profile|objective|about)',
        'experience': r'(?i)(?:experience|employment|work\s+history)',
        'education': r'(?i)education',
        'skills': r'(?i)skills',
        'projects': r'(?i)projects',
        'certifications': r'(?i)certifications?',
        'achievements': r'(?i)(?:achievements?|accomplishments?|awards?)'
    }
    
    # Split text into potential sections
    lines = text.split('\n')
    current_section = 'other'
    section_content = {section: [] for section in section_patterns.keys()}
    section_content['other'] = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if line is a section header
        found_section = None
        for section_name, pattern in section_patterns.items():
            if re.match(pattern, line):
                found_section = section_name
                break
        
        if found_section:
            current_section = found_section
        else:
            section_content[current_section].append(line)
    
    # Convert lists to strings
    for section_name in section_content:
        sections[section_name] = '\n'.join(section_content[section_name])
    
    return sections

def clean_extracted_text(text):
    """Clean text extracted from PDFs/DOCX that might have OCR artifacts"""
    
    # Fix common OCR errors
    ocr_fixes = {
        r'\bl\b': 'I',  # lowercase l to uppercase I
        r'\b0\b': 'O',  # zero to O in words
        r'rn': 'm',     # rn to m
        r'vv': 'w',     # double v to w
    }
    
    for pattern, replacement in ocr_fixes.items():
        text = re.sub(pattern, replacement, text)
    
    # Remove artifacts from table extraction
    text = re.sub(r'\|+', ' ', text)  # Remove table separators
    text = re.sub(r'_{3,}', ' ', text)  # Remove underlines
    
    # Fix spacing issues
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)  # Add space between camelCase
    text = re.sub(r'(\d)([A-Za-z])', r'\1 \2', text)  # Add space between number and letter
    text = re.sub(r'([A-Za-z])(\d)', r'\1 \2', text)  # Add space between letter and number
    
    return text