# Career Boost AI - ML Service

This is the machine learning service for Career Boost AI that handles resume text extraction, analysis, and processing.

## Features

- **Text Extraction**: Extract text from PDF, DOCX, and TXT files
- **Resume Analysis**: Comprehensive analysis including ATS scoring, skill extraction, and experience parsing
- **Job Matching**: Match resumes with job descriptions using semantic similarity
- **RESTful API**: Clean API endpoints for integration with the main backend

## Technology Stack

- **Flask**: Web framework for API endpoints
- **PyMuPDF**: PDF text extraction
- **python-docx**: DOCX text extraction
- **spaCy**: Natural language processing
- **Sentence Transformers**: Semantic embeddings for job matching
- **scikit-learn**: Machine learning algorithms

## Installation

### Prerequisites

- Python 3.11+
- pip

### Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Download spaCy model**:
   ```bash
   python -m spacy download en_core_web_sm
   ```

3. **Create necessary directories**:
   ```bash
   mkdir uploads logs
   ```

## Running the Service

### Development

```bash
python start.py
```

This will start the Flask development server on `http://localhost:8000`.

### Production

```bash
gunicorn --bind 0.0.0.0:8000 --workers 2 --timeout 120 app.main:app
```

### Docker

```bash
# Build the image
docker build -t career-boost-ml .

# Run the container
docker run -p 8000:8000 career-boost-ml
```

## API Endpoints

### Health Check
```
GET /health
```

### Resume Analysis
```
POST /analyze
Content-Type: multipart/form-data

Parameters:
- file: Resume file (PDF, DOCX, or TXT)
- resume_id: Optional resume ID for tracking
```

### Text Extraction Only
```
POST /extract-text
Content-Type: multipart/form-data

Parameters:
- file: Resume file
```

### Skills Extraction
```
POST /extract-skills
Content-Type: application/json

Body:
{
  "text": "Resume text content"
}
```

### ATS Score Calculation
```
POST /calculate-ats
Content-Type: application/json

Body:
{
  "text": "Resume text content",
  "job_keywords": ["optional", "job", "keywords"]
}
```

### Job Matching
```
POST /match-jobs
Content-Type: application/json

Body:
{
  "resume_text": "Resume text content",
  "job_descriptions": ["Job description 1", "Job description 2"],
  "filters": {}
}
```

## File Support

### Supported Formats
- **PDF**: Uses PyMuPDF for text extraction with OCR fallback
- **DOCX**: Uses python-docx for comprehensive text extraction including tables and headers
- **TXT**: Plain text files with multiple encoding support

### File Limits
- Maximum file size: 5MB
- Supported MIME types:
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `text/plain`

## Configuration

### Environment Variables

- `FLASK_ENV`: Set to `development` or `production`
- `PORT`: Port number (default: 8000)
- `MAX_CONTENT_LENGTH`: Maximum file size in bytes

### Logging

The service uses Python's built-in logging module. Logs are output to stdout in development and can be configured for production use.

## Error Handling

The service includes comprehensive error handling for:
- Invalid file types
- Corrupted files
- Text extraction failures
- Processing timeouts
- Memory limitations

## Performance Considerations

- **Memory Usage**: Large PDF files may require significant memory for processing
- **Processing Time**: Complex documents may take 10-30 seconds to process
- **Concurrency**: Use multiple workers in production for better throughput
- **Caching**: Consider implementing Redis caching for frequently processed documents

## Development

### Project Structure
```
ml-service/
├── app/
│   ├── main.py              # Flask application and API endpoints
│   ├── services/            # Core ML services
│   │   ├── text_extractor.py    # Text extraction from files
│   │   ├── skill_extractor.py   # Skill identification and categorization
│   │   ├── ats_scorer.py        # ATS compatibility scoring
│   │   └── job_matcher.py       # Job matching algorithms
│   └── utils/               # Utility functions
│       └── preprocessing.py     # Text preprocessing and cleaning
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
├── start.py               # Development startup script
└── README.md              # This file
```

### Adding New Features

1. **New Analysis Types**: Add new services in the `services/` directory
2. **New File Types**: Extend the `TextExtractor` class with new extraction methods
3. **New Endpoints**: Add new routes in `main.py`

### Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test file upload
curl -X POST -F "file=@sample_resume.pdf" http://localhost:8000/analyze
```

## Troubleshooting

### Common Issues

1. **spaCy model not found**: Run `python -m spacy download en_core_web_sm`
2. **Memory errors with large PDFs**: Increase available memory or implement file size limits
3. **Encoding errors with text files**: The service tries multiple encodings automatically
4. **Timeout errors**: Increase the timeout in gunicorn configuration

### Logs

Check the application logs for detailed error information:
```bash
# In development
python start.py

# In production with gunicorn
gunicorn --log-level info app.main:app
```

## Contributing

1. Follow PEP 8 style guidelines
2. Add type hints where appropriate
3. Include docstrings for new functions
4. Test with various file formats
5. Update this README for new features