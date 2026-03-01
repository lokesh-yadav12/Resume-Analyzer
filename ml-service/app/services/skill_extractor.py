import re
import json
import os
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class SkillExtractor:
    """Service for extracting and categorizing skills from resume text"""
    
    def __init__(self):
        self.skills_database = self._load_skills_database()
        self.soft_skills_patterns = self._load_soft_skills_patterns()
        self.certification_patterns = self._load_certification_patterns()
    
    def extract_skills(self, text):
        """
        Extract technical skills, soft skills, and certifications from text
        
        Args:
            text (str): Resume text content
            
        Returns:
            dict: Categorized skills with confidence scores
        """
        try:
            text_lower = text.lower()
            
            # Extract technical skills
            technical_skills = self._extract_technical_skills(text_lower)
            
            # Extract soft skills
            soft_skills = self._extract_soft_skills(text_lower)
            
            # Extract certifications
            certifications = self._extract_certifications(text)
            
            return {
                'technical': technical_skills,
                'soft': soft_skills,
                'certifications': certifications
            }
            
        except Exception as e:
            logger.error(f"Error extracting skills: {str(e)}")
            raise Exception(f"Skill extraction failed: {str(e)}")
    
    def _extract_technical_skills(self, text):
        """Extract technical skills from text"""
        found_skills = []
        
        for category, skills in self.skills_database.items():
            for skill_data in skills:
                skill_name = skill_data['name']
                aliases = skill_data.get('aliases', [])
                
                # Check main skill name and aliases
                all_names = [skill_name] + aliases
                
                for name in all_names:
                    # Use word boundaries for exact matches
                    pattern = r'\b' + re.escape(name.lower()) + r'\b'
                    matches = re.findall(pattern, text)
                    
                    if matches:
                        # Calculate confidence based on frequency and context
                        frequency = len(matches)
                        confidence = min(frequency / 3, 1.0)  # Max confidence at 3+ mentions
                        
                        # Estimate years of experience
                        years_exp = self._estimate_experience_years(text, name.lower())
                        
                        # Determine proficiency level
                        proficiency = self._determine_proficiency(text, name.lower(), years_exp)
                        
                        found_skills.append({
                            'name': skill_name,
                            'category': category,
                            'proficiency': proficiency,
                            'yearsExperience': years_exp,
                            'confidence': round(confidence, 2)
                        })
                        break  # Don't double-count the same skill
        
        # Remove duplicates and sort by confidence
        unique_skills = {}
        for skill in found_skills:
            key = skill['name'].lower()
            if key not in unique_skills or skill['confidence'] > unique_skills[key]['confidence']:
                unique_skills[key] = skill
        
        return sorted(unique_skills.values(), key=lambda x: x['confidence'], reverse=True)
    
    def _extract_soft_skills(self, text):
        """Extract soft skills from text"""
        found_skills = []
        
        for skill_name, patterns in self.soft_skills_patterns.items():
            evidence = []
            total_matches = 0
            
            for pattern in patterns:
                matches = re.findall(pattern, text)
                if matches:
                    total_matches += len(matches)
                    # Collect context around matches
                    for match in matches[:2]:  # Limit evidence examples
                        context = self._get_context(text, match)
                        if context:
                            evidence.append(context)
            
            if total_matches > 0:
                confidence = min(total_matches / 2, 1.0)
                
                found_skills.append({
                    'name': skill_name,
                    'evidence': evidence,
                    'confidence': round(confidence, 2)
                })
        
        return sorted(found_skills, key=lambda x: x['confidence'], reverse=True)
    
    def _extract_certifications(self, text):
        """Extract certifications from text"""
        found_certs = []
        
        for cert_data in self.certification_patterns:
            name = cert_data['name']
            patterns = cert_data['patterns']
            issuer = cert_data.get('issuer', '')
            
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    # Try to extract date information
                    date_info = self._extract_cert_dates(text, name)
                    
                    found_certs.append({
                        'name': name,
                        'issuer': issuer,
                        'dateObtained': date_info.get('obtained'),
                        'expirationDate': date_info.get('expires'),
                        'credentialId': None,  # Could be enhanced to extract IDs
                        'verificationUrl': None
                    })
                    break  # Don't double-count
        
        return found_certs
    
    def _estimate_experience_years(self, text, skill_name):
        """Estimate years of experience with a specific skill"""
        # Look for patterns like "5 years of Python", "Python (3 years)", etc.
        patterns = [
            rf'{re.escape(skill_name)}.*?(\d+)\+?\s*years?',
            rf'(\d+)\+?\s*years?.*?{re.escape(skill_name)}',
            rf'{re.escape(skill_name)}\s*\((\d+)\+?\s*years?\)',
            rf'(\d+)\+?\s*years?\s*(?:of\s*)?{re.escape(skill_name)}'
        ]
        
        years = []
        for pattern in patterns:
            matches = re.findall(pattern, text)
            years.extend([int(match) for match in matches if match.isdigit()])
        
        if years:
            return max(years)  # Take the highest mentioned years
        
        # If no explicit years mentioned, estimate based on context
        # Look for seniority indicators
        if any(word in text for word in ['senior', 'lead', 'principal', 'architect']):
            return 5
        elif any(word in text for word in ['experienced', 'proficient', 'expert']):
            return 3
        elif any(word in text for word in ['junior', 'entry', 'beginner']):
            return 1
        
        return 2  # Default assumption
    
    def _determine_proficiency(self, text, skill_name, years_exp):
        """Determine proficiency level based on context and experience"""
        # Look for explicit proficiency indicators
        proficiency_indicators = {
            'Expert': ['expert', 'advanced', 'mastery', 'specialist', 'architect'],
            'Advanced': ['advanced', 'senior', 'lead', 'proficient', 'experienced'],
            'Intermediate': ['intermediate', 'competent', 'solid', 'good'],
            'Beginner': ['beginner', 'basic', 'entry', 'junior', 'learning']
        }
        
        # Check for explicit mentions
        skill_context = self._get_skill_context(text, skill_name)
        
        for level, indicators in proficiency_indicators.items():
            if any(indicator in skill_context for indicator in indicators):
                return level
        
        # Estimate based on years of experience
        if years_exp >= 5:
            return 'Advanced'
        elif years_exp >= 3:
            return 'Intermediate'
        elif years_exp >= 1:
            return 'Intermediate'
        else:
            return 'Beginner'
    
    def _get_skill_context(self, text, skill_name):
        """Get surrounding context for a skill mention"""
        # Find the skill and get surrounding words
        pattern = rf'.{{0,50}}{re.escape(skill_name)}.{{0,50}}'
        matches = re.findall(pattern, text)
        return ' '.join(matches).lower()
    
    def _get_context(self, text, match):
        """Get context around a match for evidence"""
        # Find the position and extract surrounding text
        start = max(0, text.find(match) - 30)
        end = min(len(text), text.find(match) + len(match) + 30)
        context = text[start:end].strip()
        
        # Clean up the context
        context = re.sub(r'\s+', ' ', context)
        return context if len(context) > 10 else None
    
    def _extract_cert_dates(self, text, cert_name):
        """Extract certification dates from text"""
        # Look for date patterns near certification mentions
        date_patterns = [
            r'(\d{4})',  # Year only
            r'(\d{1,2}/\d{4})',  # Month/Year
            r'(\d{1,2}/\d{1,2}/\d{4})',  # Full date
        ]
        
        # This is a simplified implementation
        # In production, you'd use more sophisticated date extraction
        return {
            'obtained': None,
            'expires': None
        }
    
    def _load_skills_database(self):
        """Load technical skills database"""
        # In production, this would load from a file or database
        return {
            'Programming': [
                {'name': 'Python', 'aliases': ['python3', 'py']},
                {'name': 'JavaScript', 'aliases': ['js', 'node.js', 'nodejs']},
                {'name': 'Java', 'aliases': []},
                {'name': 'C++', 'aliases': ['cpp', 'c plus plus']},
                {'name': 'C#', 'aliases': ['csharp', 'c sharp']},
                {'name': 'PHP', 'aliases': []},
                {'name': 'Ruby', 'aliases': []},
                {'name': 'Go', 'aliases': ['golang']},
                {'name': 'Rust', 'aliases': []},
                {'name': 'Swift', 'aliases': []},
                {'name': 'Kotlin', 'aliases': []},
                {'name': 'TypeScript', 'aliases': ['ts']},
                {'name': 'R', 'aliases': []},
                {'name': 'MATLAB', 'aliases': []},
                {'name': 'Scala', 'aliases': []},
            ],
            'Framework': [
                {'name': 'React', 'aliases': ['reactjs', 'react.js']},
                {'name': 'Angular', 'aliases': ['angularjs']},
                {'name': 'Vue.js', 'aliases': ['vue', 'vuejs']},
                {'name': 'Django', 'aliases': []},
                {'name': 'Flask', 'aliases': []},
                {'name': 'Express.js', 'aliases': ['express', 'expressjs']},
                {'name': 'Spring', 'aliases': ['spring boot', 'springframework']},
                {'name': 'Laravel', 'aliases': []},
                {'name': 'Ruby on Rails', 'aliases': ['rails', 'ror']},
                {'name': 'ASP.NET', 'aliases': ['asp.net core', 'dotnet']},
            ],
            'Database': [
                {'name': 'MySQL', 'aliases': []},
                {'name': 'PostgreSQL', 'aliases': ['postgres']},
                {'name': 'MongoDB', 'aliases': ['mongo']},
                {'name': 'Redis', 'aliases': []},
                {'name': 'SQLite', 'aliases': []},
                {'name': 'Oracle', 'aliases': ['oracle db']},
                {'name': 'SQL Server', 'aliases': ['mssql', 'microsoft sql server']},
                {'name': 'Elasticsearch', 'aliases': ['elastic search']},
            ],
            'Cloud': [
                {'name': 'AWS', 'aliases': ['amazon web services']},
                {'name': 'Azure', 'aliases': ['microsoft azure']},
                {'name': 'Google Cloud', 'aliases': ['gcp', 'google cloud platform']},
                {'name': 'Docker', 'aliases': []},
                {'name': 'Kubernetes', 'aliases': ['k8s']},
                {'name': 'Terraform', 'aliases': []},
            ],
            'Tool': [
                {'name': 'Git', 'aliases': ['github', 'gitlab', 'bitbucket']},
                {'name': 'Jenkins', 'aliases': []},
                {'name': 'JIRA', 'aliases': []},
                {'name': 'Confluence', 'aliases': []},
                {'name': 'Slack', 'aliases': []},
                {'name': 'Figma', 'aliases': []},
                {'name': 'Adobe Creative Suite', 'aliases': ['photoshop', 'illustrator']},
            ]
        }
    
    def _load_soft_skills_patterns(self):
        """Load soft skills detection patterns"""
        return {
            'Leadership': [
                r'lead\w*\s+(?:team|project|initiative)',
                r'manage\w*\s+(?:team|people|staff)',
                r'mentor\w*',
                r'coach\w*',
                r'supervise\w*'
            ],
            'Communication': [
                r'present\w*\s+(?:to|findings|results)',
                r'communicat\w*\s+(?:with|across|effectively)',
                r'collaborate\w*',
                r'liaison',
                r'stakeholder\s+management'
            ],
            'Problem Solving': [
                r'problem[\s-]solv\w*',
                r'troubleshoot\w*',
                r'debug\w*',
                r'analyz\w*\s+(?:issues|problems)',
                r'resolve\w*\s+(?:issues|conflicts)'
            ],
            'Project Management': [
                r'project\s+management',
                r'agile',
                r'scrum',
                r'kanban',
                r'waterfall',
                r'manage\w*\s+(?:projects|timelines|deliverables)'
            ],
            'Teamwork': [
                r'team\s+(?:player|work|collaboration)',
                r'cross[\s-]functional',
                r'collaborate\w*',
                r'work\w*\s+(?:closely|together)'
            ]
        }
    
    def _load_certification_patterns(self):
        """Load certification detection patterns"""
        return [
            {
                'name': 'AWS Certified Solutions Architect',
                'issuer': 'Amazon Web Services',
                'patterns': [r'aws\s+(?:certified\s+)?solutions?\s+architect', r'aws\s+csa']
            },
            {
                'name': 'PMP',
                'issuer': 'Project Management Institute',
                'patterns': [r'\bpmp\b', r'project\s+management\s+professional']
            },
            {
                'name': 'Certified Scrum Master',
                'issuer': 'Scrum Alliance',
                'patterns': [r'certified\s+scrum\s+master', r'\bcsm\b']
            },
            {
                'name': 'Google Cloud Professional',
                'issuer': 'Google',
                'patterns': [r'google\s+cloud\s+(?:certified\s+)?professional', r'gcp\s+professional']
            },
            {
                'name': 'Microsoft Azure Fundamentals',
                'issuer': 'Microsoft',
                'patterns': [r'azure\s+fundamentals', r'az-900']
            }
        ]