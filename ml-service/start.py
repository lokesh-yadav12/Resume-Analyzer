#!/usr/bin/env python3
"""
Development startup script for Career Boost AI ML Service
"""

import os
import sys
import subprocess
import logging

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import spacy
        import fitz
        import docx
        import sklearn
        import sentence_transformers
        print("✓ All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def download_spacy_model():
    """Download spaCy model if not already present"""
    try:
        import spacy
        spacy.load("en_core_web_sm")
        print("✓ spaCy model is available")
    except OSError:
        print("Downloading spaCy model...")
        subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        print("✓ spaCy model downloaded")

def create_directories():
    """Create necessary directories"""
    directories = ['uploads', 'logs']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    print("✓ Directories created")

def main():
    """Main startup function"""
    print("Starting Career Boost AI ML Service...")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Download spaCy model
    download_spacy_model()
    
    # Create directories
    create_directories()
    
    # Set environment variables
    os.environ.setdefault('FLASK_APP', 'app.main')
    os.environ.setdefault('FLASK_ENV', 'development')
    
    print("=" * 50)
    print("ML Service is ready!")
    print("Starting Flask development server...")
    print("API will be available at: http://localhost:8000")
    print("Health check: http://localhost:8000/health")
    print("=" * 50)
    
    # Start the Flask app
    from app.main import app
    app.run(host='0.0.0.0', port=8000, debug=True)

if __name__ == '__main__':
    main()