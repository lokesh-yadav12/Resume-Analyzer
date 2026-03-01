from typing import List, Dict
import re

class JobMatcher:
    """Match resumes with job postings"""
    
    def __init__(self):
        self.skill_weights = {
            'exact_match': 1.0,
            'partial_match': 0.7,
            'related_match': 0.5
        }
    
    def match_jobs(self, resume_skills: List[str], jobs: List[Dict], filters: Dict = None) -> List[Dict]:
        """Match resume with jobs and calculate match percentages"""
        matched_jobs = []
        
        for job in jobs:
            # Calculate match score
            match_score = self._calculate_match_score(resume_skills, job)
            
            # Apply filters
            if filters and not self._passes_filters(job, filters):
                continue
            
            matched_jobs.append({
                **job,
                'matchPercentage': round(match_score, 1),
                'matchedSkills': self._get_matched_skills(resume_skills, job),
                'missingSkills': self._get_missing_skills(resume_skills, job)
            })
        
        # Sort by match percentage
        matched_jobs.sort(key=lambda x: x['matchPercentage'], reverse=True)
        
        return matched_jobs
    
    def _calculate_match_score(self, resume_skills: List[str], job: Dict) -> float:
        """Calculate match score between resume and job"""
        job_requirements = job.get('requirements', {})
        required_skills = job_requirements.get('skills', [])
        
        if not required_skills:
            return 50.0  # Default score if no skills specified
        
        # Normalize skills to lowercase
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        required_skills_lower = [skill.lower() for skill in required_skills]
        
        # Calculate skill matches
        exact_matches = 0
        partial_matches = 0
        
        for req_skill in required_skills_lower:
            if req_skill in resume_skills_lower:
                exact_matches += 1
            elif any(req_skill in resume_skill or resume_skill in req_skill 
                    for resume_skill in resume_skills_lower):
                partial_matches += 1
        
        # Calculate base score from skills
        total_required = len(required_skills)
        skill_score = (
            (exact_matches * self.skill_weights['exact_match']) +
            (partial_matches * self.skill_weights['partial_match'])
        ) / total_required * 70  # Skills worth 70% of total score
        
        # Add bonus points for experience match
        experience_score = self._calculate_experience_match(job_requirements)
        
        # Add bonus for location match
        location_score = 10  # Default location bonus
        
        total_score = min(100, skill_score + experience_score + location_score)
        
        return total_score
    
    def _calculate_experience_match(self, requirements: Dict) -> float:
        """Calculate experience match score"""
        # Simplified - in real implementation, compare with resume experience
        return 15.0  # Default experience score
    
    def _get_matched_skills(self, resume_skills: List[str], job: Dict) -> List[str]:
        """Get list of matched skills"""
        job_requirements = job.get('requirements', {})
        required_skills = job_requirements.get('skills', [])
        
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        matched = []
        
        for req_skill in required_skills:
            if req_skill.lower() in resume_skills_lower:
                matched.append(req_skill)
        
        return matched
    
    def _get_missing_skills(self, resume_skills: List[str], job: Dict) -> List[str]:
        """Get list of missing skills"""
        job_requirements = job.get('requirements', {})
        required_skills = job_requirements.get('skills', [])
        
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        missing = []
        
        for req_skill in required_skills:
            if req_skill.lower() not in resume_skills_lower:
                missing.append(req_skill)
        
        return missing
    
    def _passes_filters(self, job: Dict, filters: Dict) -> bool:
        """Check if job passes all filters"""
        # Location filter
        if filters.get('location'):
            job_location = job.get('details', {}).get('location', '').lower()
            filter_location = filters['location'].lower()
            if filter_location not in job_location and job_location != 'remote':
                return False
        
        # Salary filter
        if filters.get('minSalary'):
            job_salary = job.get('details', {}).get('salaryRange', {}).get('min', 0)
            if job_salary < filters['minSalary']:
                return False
        
        # Experience filter
        if filters.get('experienceLevel'):
            job_exp = job.get('requirements', {}).get('experience', {})
            # Simplified experience matching
            pass
        
        # Work mode filter
        if filters.get('workMode'):
            job_mode = job.get('details', {}).get('workMode', '').lower()
            if filters['workMode'].lower() != job_mode:
                return False
        
        return True
