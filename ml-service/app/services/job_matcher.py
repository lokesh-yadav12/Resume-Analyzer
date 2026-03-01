import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import logging
import json
import re
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)

class JobMatcher:
    """Service for matching resumes with job descriptions using semantic similarity"""
    
    def __init__(self):
        try:
            # Load pre-trained sentence transformer model
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Job matcher initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize job matcher: {str(e)}")
            self.model = None
    
    def match_jobs(self, resume_text: str, job_descriptions: List[Dict], filters: Dict = None) -> List[Dict]:
        """
        Match resume with job descriptions using semantic similarity
        
        Args:
            resume_text (str): The resume text content
            job_descriptions (List[Dict]): List of job dictionaries with description and metadata
            filters (Dict): Optional filters for job matching
            
        Returns:
            List[Dict]: Sorted list of job matches with scores
        """
        try:
            if not self.model:
                raise Exception("Job matcher model not initialized")
            
            if not resume_text or not job_descriptions:
                return []
            
            # Preprocess resume text
            processed_resume = self._preprocess_text(resume_text)
            
            # Generate resume embedding
            resume_embedding = self.model.encode([processed_resume])
            
            # Process each job and calculate similarity
            job_matches = []
            
            for job in job_descriptions:
                try:
                    # Preprocess job description
                    job_text = self._extract_job_text(job)
                    processed_job = self._preprocess_text(job_text)
                    
                    # Generate job embedding
                    job_embedding = self.model.encode([processed_job])
                    
                    # Calculate cosine similarity
                    similarity = cosine_similarity(resume_embedding, job_embedding)[0][0]
                    
                    # Apply filters and boosts
                    final_score = self._apply_filters_and_boosts(
                        similarity, job, resume_text, filters
                    )
                    
                    # Generate match explanation
                    explanation = self._generate_match_explanation(
                        resume_text, job, similarity, final_score
                    )
                    
                    job_match = {
                        'job_id': job.get('_id') or job.get('id'),
                        'title': job.get('title', ''),
                        'company': job.get('company', {}).get('name', ''),
                        'location': self._format_location(job.get('details', {}).get('location', {})),
                        'work_mode': job.get('details', {}).get('workMode', ''),
                        'salary_range': self._format_salary_range(job.get('details', {}).get('salaryRange', {})),
                        'similarity_score': round(similarity * 100, 2),
                        'final_score': round(final_score * 100, 2),
                        'explanation': explanation,
                        'matched_skills': self._find_matched_skills(resume_text, job),
                        'missing_skills': self._find_missing_skills(resume_text, job),
                        'experience_match': self._check_experience_match(resume_text, job),
                        'posted_date': job.get('postedDate'),
                        'application_deadline': job.get('applicationDeadline'),
                        'external_url': job.get('externalUrl')
                    }
                    
                    job_matches.append(job_match)
                    
                except Exception as e:
                    logger.error(f"Error processing job {job.get('title', 'Unknown')}: {str(e)}")
                    continue
            
            # Sort by final score (descending)
            job_matches.sort(key=lambda x: x['final_score'], reverse=True)
            
            # Return top matches (default 20)
            max_results = filters.get('limit', 20) if filters else 20
            return job_matches[:max_results]
            
        except Exception as e:
            logger.error(f"Error in job matching: {str(e)}")
            raise Exception(f"Job matching failed: {str(e)}")
    
    def _preprocess_text(self, text: str) -> str:
        """Preprocess text for better embedding generation"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep important ones
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)]', ' ', text)
        
        # Remove very short words (less than 2 characters)
        words = text.split()
        words = [word for word in words if len(word) >= 2]
        
        return ' '.join(words).strip()
    
    def _extract_job_text(self, job: Dict) -> str:
        """Extract relevant text from job dictionary for embedding"""
        text_parts = []
        
        # Job title (high importance)
        if job.get('title'):
            text_parts.append(job['title'] * 2)  # Duplicate for emphasis
        
        # Company name
        if job.get('company', {}).get('name'):
            text_parts.append(job['company']['name'])
        
        # Job description
        if job.get('description'):
            text_parts.append(job['description'])
        
        # Required skills
        requirements = job.get('requirements', {})
        if requirements.get('skills'):
            skills = [skill.get('name', '') for skill in requirements['skills'] if skill.get('required', True)]
            text_parts.append(' '.join(skills))
        
        # Industry
        if job.get('company', {}).get('industry'):
            text_parts.append(job['company']['industry'])
        
        return ' '.join(text_parts)
    
    def _apply_filters_and_boosts(self, base_similarity: float, job: Dict, resume_text: str, filters: Dict = None) -> float:
        """Apply filters and boost scores based on various factors"""
        score = base_similarity
        
        if not filters:
            filters = {}
        
        # Skill matching boost
        skill_boost = self._calculate_skill_boost(resume_text, job)
        score += skill_boost * 0.2  # 20% weight for skill matching
        
        # Experience level matching
        exp_boost = self._calculate_experience_boost(resume_text, job, filters)
        score += exp_boost * 0.15  # 15% weight for experience
        
        # Location preference boost
        location_boost = self._calculate_location_boost(job, filters)
        score += location_boost * 0.1  # 10% weight for location
        
        # Work mode preference boost
        work_mode_boost = self._calculate_work_mode_boost(job, filters)
        score += work_mode_boost * 0.1  # 10% weight for work mode
        
        # Salary range boost
        salary_boost = self._calculate_salary_boost(job, filters)
        score += salary_boost * 0.05  # 5% weight for salary
        
        # Recency boost (newer jobs get slight boost)
        recency_boost = self._calculate_recency_boost(job)
        score += recency_boost * 0.05  # 5% weight for recency
        
        # Quality boost (verified/featured jobs)
        quality_boost = self._calculate_quality_boost(job)
        score += quality_boost * 0.05  # 5% weight for quality
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _calculate_skill_boost(self, resume_text: str, job: Dict) -> float:
        """Calculate boost based on skill matching"""
        job_skills = job.get('requirements', {}).get('skills', [])
        if not job_skills:
            return 0.0
        
        resume_lower = resume_text.lower()
        matched_skills = 0
        total_required_skills = 0
        
        for skill in job_skills:
            skill_name = skill.get('name', '').lower()
            if skill_name:
                if skill.get('required', True):
                    total_required_skills += 1
                    if skill_name in resume_lower:
                        matched_skills += 1
                elif skill_name in resume_lower:
                    matched_skills += 0.5  # Preferred skills count as half
        
        if total_required_skills == 0:
            return 0.0
        
        return matched_skills / total_required_skills
    
    def _calculate_experience_boost(self, resume_text: str, job: Dict, filters: Dict) -> float:
        """Calculate boost based on experience level matching"""
        job_exp = job.get('requirements', {}).get('experience', {})
        job_min_exp = job_exp.get('min', 0)
        job_max_exp = job_exp.get('max', 50)
        
        # Try to extract years of experience from resume
        user_exp = self._extract_years_experience(resume_text)
        
        # Use filter preference if available
        if filters.get('experience_years'):
            user_exp = max(user_exp, filters['experience_years'])
        
        if job_min_exp <= user_exp <= job_max_exp:
            return 1.0  # Perfect match
        elif user_exp >= job_min_exp:
            return 0.8  # Overqualified but still good
        else:
            # Underqualified
            if job_min_exp > 0:
                return max(user_exp / job_min_exp, 0.0)
            return 0.5
    
    def _calculate_location_boost(self, job: Dict, filters: Dict) -> float:
        """Calculate boost based on location preference"""
        if not filters.get('location'):
            return 0.5  # Neutral if no preference
        
        job_location = job.get('details', {}).get('location', {})
        work_mode = job.get('details', {}).get('workMode', '')
        
        # Remote jobs always match
        if work_mode.lower() == 'remote':
            return 1.0
        
        user_location = filters['location'].lower()
        job_city = job_location.get('city', '').lower()
        job_state = job_location.get('state', '').lower()
        
        if user_location in job_city or user_location in job_state:
            return 1.0
        
        return 0.0
    
    def _calculate_work_mode_boost(self, job: Dict, filters: Dict) -> float:
        """Calculate boost based on work mode preference"""
        if not filters.get('work_mode'):
            return 0.5  # Neutral if no preference
        
        job_work_mode = job.get('details', {}).get('workMode', '').lower()
        user_preference = filters['work_mode'].lower()
        
        if user_preference == job_work_mode:
            return 1.0
        elif job_work_mode == 'remote':  # Remote is generally flexible
            return 0.8
        elif user_preference == 'any':
            return 0.7
        
        return 0.2
    
    def _calculate_salary_boost(self, job: Dict, filters: Dict) -> float:
        """Calculate boost based on salary expectations"""
        if not filters.get('salary_min'):
            return 0.5  # Neutral if no expectation
        
        salary_range = job.get('details', {}).get('salaryRange', {})
        job_max_salary = salary_range.get('max')
        
        if not job_max_salary:
            return 0.3  # Slight penalty for no salary info
        
        user_min_salary = filters['salary_min']
        
        if job_max_salary >= user_min_salary:
            # Calculate how much above minimum
            excess_ratio = (job_max_salary - user_min_salary) / user_min_salary
            return min(1.0, 0.7 + excess_ratio * 0.3)
        
        return 0.0  # Below expectations
    
    def _calculate_recency_boost(self, job: Dict) -> float:
        """Calculate boost based on how recently the job was posted"""
        from datetime import datetime, timedelta
        
        posted_date = job.get('postedDate')
        if not posted_date:
            return 0.0
        
        try:
            if isinstance(posted_date, str):
                posted_date = datetime.fromisoformat(posted_date.replace('Z', '+00:00'))
            
            days_ago = (datetime.now() - posted_date.replace(tzinfo=None)).days
            
            if days_ago <= 7:
                return 1.0  # Very recent
            elif days_ago <= 30:
                return 0.7  # Recent
            elif days_ago <= 60:
                return 0.4  # Somewhat old
            else:
                return 0.1  # Old
                
        except Exception:
            return 0.0
    
    def _calculate_quality_boost(self, job: Dict) -> float:
        """Calculate boost based on job quality indicators"""
        boost = 0.0
        
        # Verified jobs
        if job.get('verified'):
            boost += 0.3
        
        # Featured jobs
        if job.get('isFeatured'):
            boost += 0.2
        
        # Quality score
        quality_score = job.get('qualityScore', 50)
        boost += (quality_score / 100) * 0.5
        
        return min(boost, 1.0)
    
    def _extract_years_experience(self, resume_text: str) -> int:
        """Extract years of experience from resume text"""
        # Look for patterns like "5 years", "2+ years", etc.
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)',
            r'(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)',
            r'experience.*?(\d+)\+?\s*years?',
        ]
        
        years = []
        resume_lower = resume_text.lower()
        
        for pattern in patterns:
            matches = re.findall(pattern, resume_lower)
            years.extend([int(match) for match in matches])
        
        return max(years) if years else 0
    
    def _find_matched_skills(self, resume_text: str, job: Dict) -> List[str]:
        """Find skills that match between resume and job requirements"""
        job_skills = job.get('requirements', {}).get('skills', [])
        resume_lower = resume_text.lower()
        matched = []
        
        for skill in job_skills:
            skill_name = skill.get('name', '')
            if skill_name.lower() in resume_lower:
                matched.append(skill_name)
        
        return matched
    
    def _find_missing_skills(self, resume_text: str, job: Dict) -> List[Dict]:
        """Find required skills that are missing from the resume"""
        job_skills = job.get('requirements', {}).get('skills', [])
        resume_lower = resume_text.lower()
        missing = []
        
        for skill in job_skills:
            skill_name = skill.get('name', '')
            if skill.get('required', True) and skill_name.lower() not in resume_lower:
                missing.append({
                    'name': skill_name,
                    'level': skill.get('level', 'Intermediate'),
                    'category': skill.get('category', 'Other')
                })
        
        return missing
    
    def _check_experience_match(self, resume_text: str, job: Dict) -> Dict:
        """Check if experience level matches job requirements"""
        job_exp = job.get('requirements', {}).get('experience', {})
        user_exp = self._extract_years_experience(resume_text)
        
        job_min = job_exp.get('min', 0)
        job_max = job_exp.get('max', 50)
        job_level = job_exp.get('level', 'Mid')
        
        match_status = 'unknown'
        if job_min <= user_exp <= job_max:
            match_status = 'perfect'
        elif user_exp > job_max:
            match_status = 'overqualified'
        elif user_exp < job_min:
            match_status = 'underqualified'
        
        return {
            'user_years': user_exp,
            'required_min': job_min,
            'required_max': job_max,
            'required_level': job_level,
            'match_status': match_status
        }
    
    def _format_location(self, location: Dict) -> str:
        """Format location dictionary to string"""
        if not location:
            return ''
        
        parts = []
        if location.get('city'):
            parts.append(location['city'])
        if location.get('state'):
            parts.append(location['state'])
        if location.get('country') and location['country'] != 'United States':
            parts.append(location['country'])
        
        return ', '.join(parts)
    
    def _format_salary_range(self, salary_range: Dict) -> str:
        """Format salary range dictionary to string"""
        if not salary_range:
            return ''
        
        min_sal = salary_range.get('min')
        max_sal = salary_range.get('max')
        currency = salary_range.get('currency', 'USD')
        
        if min_sal and max_sal:
            return f"{currency} {min_sal:,} - {max_sal:,}"
        elif min_sal:
            return f"{currency} {min_sal:,}+"
        elif max_sal:
            return f"Up to {currency} {max_sal:,}"
        
        return ''
    
    def _generate_match_explanation(self, resume_text: str, job: Dict, similarity: float, final_score: float) -> str:
        """Generate human-readable explanation for the match"""
        explanations = []
        
        # Similarity explanation
        if similarity >= 0.8:
            explanations.append("Excellent content match")
        elif similarity >= 0.6:
            explanations.append("Good content alignment")
        elif similarity >= 0.4:
            explanations.append("Moderate content match")
        else:
            explanations.append("Limited content overlap")
        
        # Skill match explanation
        matched_skills = self._find_matched_skills(resume_text, job)
        missing_skills = self._find_missing_skills(resume_text, job)
        
        if len(matched_skills) > len(missing_skills):
            explanations.append("Strong skill match")
        elif len(matched_skills) == len(missing_skills):
            explanations.append("Partial skill match")
        else:
            explanations.append("Some skill gaps")
        
        # Experience explanation
        exp_match = self._check_experience_match(resume_text, job)
        if exp_match['match_status'] == 'perfect':
            explanations.append("Experience level fits")
        elif exp_match['match_status'] == 'overqualified':
            explanations.append("Highly experienced")
        elif exp_match['match_status'] == 'underqualified':
            explanations.append("May need more experience")
        
        return "; ".join(explanations)