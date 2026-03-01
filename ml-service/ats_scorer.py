import re
from typing import Dict, List, Tuple

class ATSScorer:
    """ATS (Applicant Tracking System) Scoring Algorithm"""
    
    def __init__(self):
        self.common_keywords = [
            'experience', 'skills', 'education', 'project', 'achievement',
            'responsibility', 'managed', 'developed', 'implemented', 'created',
            'designed', 'led', 'coordinated', 'analyzed', 'improved', 'increased',
            'decreased', 'reduced', 'optimized', 'streamlined', 'collaborated'
        ]
        
        self.contact_patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            'linkedin': r'linkedin\.com/in/[\w-]+',
            'github': r'github\.com/[\w-]+',
            'website': r'https?://[\w.-]+\.[a-z]{2,}'
        }
        
        self.section_headers = [
            'experience', 'education', 'skills', 'projects', 'certifications',
            'summary', 'objective', 'achievements', 'awards', 'publications'
        ]
    
    def calculate_ats_score(self, text: str, job_keywords: List[str] = None) -> Dict:
        """Calculate comprehensive ATS score"""
        text_lower = text.lower()
        
        # Calculate individual scores
        keyword_score = self._calculate_keyword_score(text_lower, job_keywords)
        contact_score = self._calculate_contact_score(text)
        structure_score = self._calculate_structure_score(text_lower)
        formatting_score = self._calculate_formatting_score(text)
        quantifiable_score = self._calculate_quantifiable_score(text)
        
        # Calculate total score
        total_score = (
            keyword_score +
            contact_score +
            structure_score +
            formatting_score +
            quantifiable_score
        )
        
        # Generate grade
        grade = self._calculate_grade(total_score)
        
        # Generate suggestions
        suggestions = self._generate_suggestions(
            keyword_score, contact_score, structure_score,
            formatting_score, quantifiable_score, text
        )
        
        return {
            'totalScore': round(total_score, 1),
            'breakdown': {
                'keywordMatch': round(keyword_score, 1),
                'contactInfo': round(contact_score, 1),
                'structure': round(structure_score, 1),
                'formatting': round(formatting_score, 1),
                'quantifiable': round(quantifiable_score, 1)
            },
            'grade': grade,
            'suggestions': suggestions
        }
    
    def _calculate_keyword_score(self, text: str, job_keywords: List[str] = None) -> float:
        """Calculate keyword density score (0-40 points)"""
        keywords = job_keywords if job_keywords else self.common_keywords
        
        # Count keyword occurrences
        keyword_count = sum(1 for keyword in keywords if keyword in text)
        keyword_ratio = keyword_count / len(keywords)
        
        # Calculate score (max 40 points)
        score = min(40, keyword_ratio * 40 * 1.5)
        
        return score
    
    def _calculate_contact_score(self, text: str) -> float:
        """Calculate contact information completeness (0-15 points)"""
        score = 0
        max_score = 15
        points_per_contact = max_score / len(self.contact_patterns)
        
        for contact_type, pattern in self.contact_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                score += points_per_contact
        
        return min(max_score, score)
    
    def _calculate_structure_score(self, text: str) -> float:
        """Calculate section structure score (0-20 points)"""
        score = 0
        max_score = 20
        
        # Check for section headers
        sections_found = sum(1 for header in self.section_headers if header in text)
        section_ratio = sections_found / len(self.section_headers)
        score += section_ratio * 15
        
        # Check for proper organization (paragraphs, bullet points)
        lines = text.split('\n')
        non_empty_lines = [line for line in lines if line.strip()]
        
        if len(non_empty_lines) > 10:
            score += 5
        
        return min(max_score, score)
    
    def _calculate_formatting_score(self, text: str) -> float:
        """Calculate formatting quality (0-15 points)"""
        score = 0
        max_score = 15
        
        # Check text length (not too short, not too long)
        word_count = len(text.split())
        if 300 <= word_count <= 1500:
            score += 5
        elif 200 <= word_count < 300 or 1500 < word_count <= 2000:
            score += 3
        
        # Check for proper capitalization
        sentences = re.split(r'[.!?]+', text)
        capitalized = sum(1 for s in sentences if s.strip() and s.strip()[0].isupper())
        if capitalized / max(len(sentences), 1) > 0.7:
            score += 5
        
        # Check for consistent formatting
        if not re.search(r'[^\x00-\x7F]+', text):  # ASCII characters only
            score += 5
        
        return min(max_score, score)
    
    def _calculate_quantifiable_score(self, text: str) -> float:
        """Calculate quantifiable achievements score (0-10 points)"""
        score = 0
        max_score = 10
        
        # Look for numbers and percentages
        numbers = re.findall(r'\d+', text)
        percentages = re.findall(r'\d+%', text)
        
        # Award points for quantifiable metrics
        if len(numbers) >= 5:
            score += 5
        elif len(numbers) >= 3:
            score += 3
        
        if len(percentages) >= 2:
            score += 5
        elif len(percentages) >= 1:
            score += 2
        
        return min(max_score, score)
    
    def _calculate_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return 'A+'
        elif score >= 85:
            return 'A'
        elif score >= 75:
            return 'B'
        elif score >= 65:
            return 'C'
        elif score >= 50:
            return 'D'
        else:
            return 'F'
    
    def _generate_suggestions(
        self, keyword_score: float, contact_score: float,
        structure_score: float, formatting_score: float,
        quantifiable_score: float, text: str
    ) -> List[Dict]:
        """Generate improvement suggestions"""
        suggestions = []
        
        if keyword_score < 25:
            suggestions.append({
                'category': 'Keywords',
                'message': 'Add more relevant keywords from job descriptions to improve ATS matching',
                'priority': 'high'
            })
        
        if contact_score < 10:
            suggestions.append({
                'category': 'Contact Information',
                'message': 'Include complete contact information: email, phone, LinkedIn, and GitHub profiles',
                'priority': 'high'
            })
        
        if structure_score < 12:
            suggestions.append({
                'category': 'Structure',
                'message': 'Organize your resume with clear section headers (Experience, Education, Skills, etc.)',
                'priority': 'high'
            })
        
        if formatting_score < 10:
            suggestions.append({
                'category': 'Formatting',
                'message': 'Improve formatting consistency and ensure proper capitalization',
                'priority': 'medium'
            })
        
        if quantifiable_score < 5:
            suggestions.append({
                'category': 'Achievements',
                'message': 'Add quantifiable achievements with specific numbers and percentages',
                'priority': 'high'
            })
        
        # Additional suggestions based on content analysis
        if 'summary' not in text.lower() and 'objective' not in text.lower():
            suggestions.append({
                'category': 'Summary',
                'message': 'Add a professional summary or objective statement at the top',
                'priority': 'medium'
            })
        
        if len(text.split()) < 300:
            suggestions.append({
                'category': 'Content',
                'message': 'Expand your resume with more details about your experience and achievements',
                'priority': 'medium'
            })
        
        return suggestions
