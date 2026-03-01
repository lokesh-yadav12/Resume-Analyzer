import re
from collections import Counter
import logging

logger = logging.getLogger(__name__)

class ATSScorer:
    """Service for calculating ATS (Applicant Tracking System) compatibility scores"""
    
    def __init__(self):
        self.max_scores = {
            'keyword_match': 40,
            'contact_info': 15,
            'structure': 20,
            'formatting': 15,
            'quantifiable': 10
        }
        
        # Common professional keywords for default scoring
        self.default_keywords = [
            'experience', 'skills', 'management', 'development', 'project',
            'team', 'leadership', 'analysis', 'communication', 'problem-solving',
            'technical', 'software', 'data', 'customer', 'business', 'results',
            'achieved', 'implemented', 'designed', 'created', 'improved',
            'collaborated', 'responsible', 'managed', 'led', 'developed'
        ]
    
    def calculate_ats_score(self, resume_text, job_keywords=None):
        """
        Calculate comprehensive ATS score for resume
        
        Args:
            resume_text (str): The resume text content
            job_keywords (list): Optional list of job-specific keywords
            
        Returns:
            dict: ATS score breakdown and recommendations
        """
        try:
            if not resume_text or len(resume_text.strip()) < 50:
                raise ValueError("Resume text is too short for analysis")
            
            # Calculate individual score components
            keyword_score = self._calculate_keyword_score(resume_text, job_keywords)
            contact_score = self._calculate_contact_score(resume_text)
            structure_score = self._calculate_structure_score(resume_text)
            formatting_score = self._calculate_formatting_score(resume_text)
            quantifiable_score = self._calculate_quantifiable_score(resume_text)
            
            # Calculate total score
            total_score = (
                keyword_score + contact_score + structure_score + 
                formatting_score + quantifiable_score
            )
            
            # Generate grade
            grade = self._get_grade(total_score)
            
            # Generate suggestions
            suggestions = self._generate_suggestions({
                'keyword_match': keyword_score,
                'contact_info': contact_score,
                'structure': structure_score,
                'formatting': formatting_score,
                'quantifiable': quantifiable_score
            })
            
            return {
                'totalScore': round(total_score, 2),
                'breakdown': {
                    'keywordMatch': round(keyword_score, 2),
                    'contactInfo': contact_score,
                    'structure': round(structure_score, 2),
                    'formatting': formatting_score,
                    'quantifiable': round(quantifiable_score, 2)
                },
                'grade': grade,
                'suggestions': suggestions
            }
            
        except Exception as e:
            logger.error(f"Error calculating ATS score: {str(e)}")
            raise Exception(f"ATS score calculation failed: {str(e)}")
    
    def _calculate_keyword_score(self, text, job_keywords=None):
        """Calculate keyword density and relevance score (0-40 points)"""
        keywords_to_check = job_keywords if job_keywords else self.default_keywords
        
        text_lower = text.lower()
        matched_keywords = []
        total_keyword_frequency = 0
        
        for keyword in keywords_to_check:
            keyword_lower = keyword.lower()
            if keyword_lower in text_lower:
                # Count frequency of keyword
                frequency = text_lower.count(keyword_lower)
                matched_keywords.append((keyword, frequency))
                total_keyword_frequency += frequency
        
        if not keywords_to_check:
            return 30  # Default score if no keywords to match against
        
        # Calculate base score based on percentage of matched keywords
        match_percentage = len(matched_keywords) / len(keywords_to_check)
        base_score = match_percentage * 25
        
        # Bonus for keyword frequency (up to 15 points)
        frequency_bonus = min(total_keyword_frequency / len(keywords_to_check) * 3, 15)
        
        total_score = base_score + frequency_bonus
        return min(total_score, self.max_scores['keyword_match'])
    
    def _calculate_contact_score(self, text):
        """Calculate contact information completeness score (0-15 points)"""
        score = 0
        
        # Email (5 points)
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        if re.search(email_pattern, text):
            score += 5
        
        # Phone (5 points)
        phone_patterns = [
            r'\b\d{10}\b',  # 10 digits
            r'\(\d{3}\)\s*\d{3}-\d{4}',  # (123) 456-7890
            r'\d{3}[-.\s]\d{3}[-.\s]\d{4}',  # 123-456-7890
            r'\+\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'  # International formats
        ]
        
        for pattern in phone_patterns:
            if re.search(pattern, text):
                score += 5
                break
        
        # LinkedIn (3 points) or GitHub (2 points)
        linkedin_pattern = r'linkedin\.com/in/[\w\-]+'
        github_pattern = r'github\.com/[\w\-]+'
        
        if re.search(linkedin_pattern, text.lower()):
            score += 3
        elif re.search(github_pattern, text.lower()):
            score += 2
        
        # Location/Address (2 points)
        location_patterns = [
            r'\b\w+,\s*[A-Z]{2}\b',  # City, ST
            r'\b\d{5}(-\d{4})?\b',   # ZIP code
            r'\b[A-Z][a-z]+,\s*[A-Z][a-z]+\b'  # City, State
        ]
        
        for pattern in location_patterns:
            if re.search(pattern, text):
                score += 2
                break
        
        return min(score, self.max_scores['contact_info'])
    
    def _calculate_structure_score(self, text):
        """Calculate resume structure score (0-20 points)"""
        score = 0
        text_lower = text.lower()
        
        # Check for essential sections (12 points total)
        sections = {
            'experience': ['experience', 'work history', 'employment', 'professional experience', 'career'],
            'education': ['education', 'academic', 'degree', 'university', 'college', 'school'],
            'skills': ['skills', 'technical skills', 'competencies', 'expertise', 'technologies'],
            'summary': ['summary', 'profile', 'objective', 'about', 'overview']
        }
        
        found_sections = 0
        for section_name, keywords in sections.items():
            for keyword in keywords:
                if keyword in text_lower:
                    found_sections += 1
                    break
        
        # Score based on number of sections found (3 points each)
        section_score = found_sections * 3
        score += min(section_score, 12)
        
        # Bonus for good organization indicators (8 points total)
        
        # Headers in all caps or title case (3 points)
        if re.search(r'^[A-Z\s]{3,}$', text, re.MULTILINE):
            score += 3
        
        # Bullet points usage (3 points)
        if re.search(r'[•●▪▸→\-\*]\s', text):
            score += 3
        
        # Consistent date formatting (2 points)
        date_patterns = [
            r'\d{4}\s*[-–]\s*\d{4}',  # 2020-2024
            r'\d{1,2}/\d{4}\s*[-–]\s*\d{1,2}/\d{4}',  # 01/2020-12/2024
            r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}'  # Jan 2020
        ]
        
        for pattern in date_patterns:
            if len(re.findall(pattern, text)) >= 2:  # At least 2 date ranges
                score += 2
                break
        
        return min(score, self.max_scores['structure'])
    
    def _calculate_formatting_score(self, text):
        """Calculate formatting quality score (0-15 points)"""
        score = 0
        
        # Word count check (6 points)
        word_count = len(text.split())
        if 400 <= word_count <= 800:  # Optimal range
            score += 6
        elif 300 <= word_count < 400 or 800 < word_count <= 1000:  # Good range
            score += 4
        elif 200 <= word_count < 300 or 1000 < word_count <= 1200:  # Acceptable range
            score += 2
        
        # Line length and readability (4 points)
        lines = text.split('\n')
        non_empty_lines = [line.strip() for line in lines if line.strip()]
        
        if len(non_empty_lines) >= 15:  # Sufficient content structure
            score += 2
        
        # Check for reasonable line lengths (not too long)
        reasonable_lines = sum(1 for line in non_empty_lines if len(line) <= 100)
        if reasonable_lines / len(non_empty_lines) >= 0.8:  # 80% of lines are reasonable length
            score += 2
        
        # Consistent formatting indicators (5 points)
        
        # Bullet points usage (2 points)
        if re.search(r'[•●▪▸→\-\*]\s', text):
            score += 2
        
        # No excessive capitalization (1 point)
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text) if text else 0
        if caps_ratio <= 0.15:  # Less than 15% caps
            score += 1
        
        # Proper spacing (2 points)
        if not re.search(r'\s{3,}', text):  # No excessive spacing
            score += 1
        
        if not re.search(r'\n\s*\n\s*\n', text):  # No excessive line breaks
            score += 1
        
        return min(score, self.max_scores['formatting'])
    
    def _calculate_quantifiable_score(self, text):
        """Calculate quantifiable achievements score (0-10 points)"""
        # Enhanced patterns for quantifiable achievements
        patterns = [
            r'\d+%',  # Percentages: 25%, 150%
            r'\$\d+[,\d]*(?:\.\d{2})?[KMB]?',  # Dollar amounts: $50K, $1.2M, $500
            r'\d+\+',  # Numbers with plus: 50+, 100+
            r'increase[d]?\s+(?:by\s+)?\d+',  # Increased by X
            r'improve[d]?\s+(?:by\s+)?\d+',  # Improved by X
            r'reduce[d]?\s+(?:by\s+)?\d+',  # Reduced by X
            r'grew?\s+(?:by\s+)?\d+',  # Grew by X
            r'save[d]?\s+(?:by\s+)?\$?\d+',  # Saved X or $X
            r'manage[d]?\s+(?:a\s+team\s+of\s+)?\d+',  # Managed X people
            r'\d+\s*(?:people|team|members|employees|staff)',  # X people/team
            r'\d+\s*(?:projects?|clients?|customers?)',  # X projects/clients
            r'\d+\s*(?:years?|months?)\s+(?:of\s+)?experience',  # X years experience
            r'(?:over|more than|up to)\s+\d+',  # Over X, more than X
            r'\d+x\s+(?:faster|better|more)',  # 2x faster
            r'top\s+\d+%',  # Top 10%
            r'rank(?:ed)?\s+#?\d+',  # Ranked #1
        ]
        
        quantifiable_matches = []
        text_lower = text.lower()
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower)
            quantifiable_matches.extend(matches)
        
        # Remove duplicates and count unique quantifiable achievements
        unique_matches = len(set(quantifiable_matches))
        
        # Score calculation (more generous scoring)
        if unique_matches >= 8:
            score = 10
        elif unique_matches >= 6:
            score = 8
        elif unique_matches >= 4:
            score = 6
        elif unique_matches >= 2:
            score = 4
        elif unique_matches >= 1:
            score = 2
        else:
            score = 0
        
        return min(score, self.max_scores['quantifiable'])
    
    def _get_grade(self, score):
        """Convert numerical score to letter grade"""
        if score >= 90:
            return 'A+'
        elif score >= 85:
            return 'A'
        elif score >= 75:
            return 'B'
        elif score >= 65:
            return 'C'
        else:
            return 'D'
    
    def _generate_suggestions(self, breakdown):
        """Generate improvement suggestions based on score breakdown"""
        suggestions = []
        max_scores = self.max_scores
        
        # Keyword suggestions
        if breakdown['keyword_match'] < max_scores['keyword_match'] * 0.7:
            suggestions.append("Include more relevant keywords from job descriptions. Use industry-specific terms and action verbs like 'developed', 'implemented', 'managed'.")
        
        # Contact information suggestions
        if breakdown['contact_info'] < max_scores['contact_info']:
            missing_items = []
            if breakdown['contact_info'] < 5:
                missing_items.append("professional email address")
            if breakdown['contact_info'] < 10:
                missing_items.append("phone number")
            if breakdown['contact_info'] < 13:
                missing_items.append("LinkedIn profile URL")
            if breakdown['contact_info'] < 15:
                missing_items.append("location (city, state)")
            
            if missing_items:
                suggestions.append(f"Add missing contact information: {', '.join(missing_items)}.")
        
        # Structure suggestions
        if breakdown['structure'] < max_scores['structure'] * 0.75:
            suggestions.append("Improve resume structure by adding clear section headers (EXPERIENCE, EDUCATION, SKILLS) and using bullet points for better readability.")
        
        # Formatting suggestions
        if breakdown['formatting'] < max_scores['formatting'] * 0.7:
            word_count = breakdown.get('word_count', 0)
            format_tips = []
            
            if word_count < 300:
                format_tips.append("expand content to 400-800 words")
            elif word_count > 1000:
                format_tips.append("condense content to 400-800 words")
            
            format_tips.append("use consistent bullet points")
            format_tips.append("maintain proper spacing")
            
            suggestions.append(f"Enhance formatting: {', '.join(format_tips)}.")
        
        # Quantifiable achievements suggestions
        if breakdown['quantifiable'] < max_scores['quantifiable'] * 0.6:
            suggestions.append("Add specific, measurable achievements with numbers, percentages, or dollar amounts. For example: 'Increased sales by 25%' or 'Managed team of 8 developers'.")
        
        # Priority-based suggestions
        if len(suggestions) == 0:
            if breakdown['keyword_match'] + breakdown['contact_info'] + breakdown['structure'] + breakdown['formatting'] + breakdown['quantifiable'] >= 85:
                suggestions.append("Excellent! Your resume is well-optimized for ATS systems. Consider minor tweaks based on specific job requirements.")
            else:
                suggestions.append("Good foundation! Focus on adding more quantifiable achievements and relevant keywords for better ATS compatibility.")
        
        # Limit suggestions and add priority guidance
        if len(suggestions) > 3:
            suggestions = suggestions[:3]
            suggestions.append("Focus on implementing these top improvements first for maximum impact.")
        
        return suggestions$', text, re.MULTILINE):  # All caps headers
            score += 2
        
        if re.search(r'[•●▪▸→-]\s', text):  # Bullet points
            score += 3
        
        return min(score, self.max_scores['structure'])
    
    def _calculate_formatting_score(self, text):
        """Calculate formatting quality score (0-15 points)"""
        score = 0
        
        # Word count check (optimal range: 300-800 words)
        word_count = len(text.split())
        if 300 <= word_count <= 800:
            score += 8
        elif 200 <= word_count < 300 or 800 < word_count <= 1000:
            score += 5
        else:
            score += 2
        
        # Bullet points usage
        if re.search(r'[•●▪▸→-]\s', text):
            score += 4
        
        # Consistent formatting indicators
        lines = text.split('\n')
        non_empty_lines = [line for line in lines if line.strip()]
        
        if len(non_empty_lines) > 10:  # Sufficient content structure
            score += 3
        
        return min(score, self.max_scores['formatting'])
    
    def _calculate_quantifiable_score(self, text):
        """Calculate quantifiable achievements score (0-10 points)"""
        # Look for numbers, percentages, dollar amounts, and achievement indicators
        patterns = [
            r'\d+%',  # Percentages
            r'\$\d+',  # Dollar amounts
            r'\d+\+',  # Numbers with plus
            r'increase[d]?.*?\d+',  # Increased by X
            r'improve[d]?.*?\d+',  # Improved by X
            r'reduce[d]?.*?\d+',  # Reduced by X
            r'grew.*?\d+',  # Grew by X
            r'save[d]?.*?\d+',  # Saved X
            r'manage[d]?.*?\d+',  # Managed X people/projects
            r'\d+\s*(people|team|members|projects|clients)'  # Managed X people
        ]
        
        quantifiable_count = 0
        text_lower = text.lower()
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower)
            quantifiable_count += len(matches)
        
        # Score based on number of quantifiable achievements
        score = min((quantifiable_count / 5) * 10, self.max_scores['quantifiable'])
        
        return round(score, 2)
    
    def _get_grade(self, score):
        """Convert numerical score to letter grade"""
        if score >= 90:
            return 'A+'
        elif score >= 80:
            return 'A'
        elif score >= 70:
            return 'B'
        elif score >= 60:
            return 'C'
        else:
            return 'D'
    
    def _generate_suggestions(self, breakdown):
        """Generate improvement suggestions based on score breakdown"""
        suggestions = []
        
        if breakdown['keyword_match'] < 30:
            suggestions.append("Add more relevant keywords from job descriptions to improve keyword matching")
        
        if breakdown['contact_info'] < 15:
            missing = []
            if breakdown['contact_info'] < 5:
                missing.append("email address")
            if breakdown['contact_info'] < 10:
                missing.append("phone number")
            if breakdown['contact_info'] < 15:
                missing.append("LinkedIn profile")
            
            if missing:
                suggestions.append(f"Include missing contact information: {', '.join(missing)}")
        
        if breakdown['structure'] < 15:
            suggestions.append("Add clear sections for Experience, Education, Skills, and Projects with proper headings")
        
        if breakdown['formatting'] < 10:
            suggestions.append("Improve formatting by using bullet points and keeping resume concise (300-600 words)")
        
        if breakdown['quantifiable'] < 7:
            suggestions.append("Add measurable achievements with specific numbers, percentages, or dollar amounts")
        
        # General suggestions
        if len(suggestions) == 0:
            suggestions.append("Great job! Your resume is well-optimized for ATS systems")
        elif len(suggestions) > 3:
            suggestions.append("Focus on the top 2-3 improvements for maximum impact")
        
        return suggestions