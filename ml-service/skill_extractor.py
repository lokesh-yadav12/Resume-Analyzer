import re
from typing import Dict, List, Set

class SkillExtractor:
    """Extract and categorize skills from resume text"""
    
    def __init__(self):
        # Comprehensive skills database
        self.technical_skills = {
            'programming': [
                'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift',
                'kotlin', 'go', 'rust', 'typescript', 'scala', 'r', 'matlab', 'perl'
            ],
            'web': [
                'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express',
                'django', 'flask', 'spring', 'asp.net', 'jquery', 'bootstrap',
                'tailwind', 'sass', 'webpack', 'next.js', 'nuxt.js', 'gatsby'
            ],
            'mobile': [
                'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic',
                'swift', 'kotlin', 'objective-c'
            ],
            'database': [
                'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra',
                'oracle', 'sqlite', 'dynamodb', 'elasticsearch', 'neo4j'
            ],
            'cloud': [
                'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
                'jenkins', 'gitlab', 'github actions', 'circleci', 'heroku'
            ],
            'data_science': [
                'machine learning', 'deep learning', 'tensorflow', 'pytorch',
                'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
                'jupyter', 'data analysis', 'statistics', 'nlp', 'computer vision'
            ],
            'tools': [
                'git', 'jira', 'confluence', 'slack', 'trello', 'asana',
                'postman', 'swagger', 'figma', 'sketch', 'adobe xd'
            ]
        }
        
        self.soft_skills = [
            'leadership', 'communication', 'teamwork', 'problem solving',
            'critical thinking', 'time management', 'adaptability', 'creativity',
            'collaboration', 'project management', 'analytical', 'detail-oriented',
            'self-motivated', 'organized', 'multitasking', 'presentation',
            'negotiation', 'conflict resolution', 'decision making', 'mentoring'
        ]
        
        self.certifications = [
            'aws certified', 'azure certified', 'google cloud certified',
            'pmp', 'scrum master', 'cissp', 'comptia', 'cisco', 'oracle certified',
            'microsoft certified', 'cfa', 'cpa', 'six sigma', 'itil'
        ]
    
    def extract_skills(self, text: str) -> Dict:
        """Extract all skills from resume text"""
        text_lower = text.lower()
        
        # Extract technical skills
        technical = self._extract_technical_skills(text_lower)
        
        # Extract soft skills
        soft = self._extract_soft_skills(text_lower, text)
        
        # Extract certifications
        certifications = self._extract_certifications(text)
        
        return {
            'technical': technical,
            'soft': soft,
            'certifications': certifications
        }
    
    def _extract_technical_skills(self, text: str) -> List[Dict]:
        """Extract technical skills with categorization"""
        found_skills = []
        seen_skills = set()
        
        for category, skills in self.technical_skills.items():
            for skill in skills:
                # Use word boundaries for better matching
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text, re.IGNORECASE):
                    if skill not in seen_skills:
                        seen_skills.add(skill)
                        
                        # Estimate proficiency based on context
                        proficiency = self._estimate_proficiency(text, skill)
                        
                        # Estimate years of experience
                        years = self._estimate_years(text, skill)
                        
                        found_skills.append({
                            'name': skill.title(),
                            'category': category.replace('_', ' ').title(),
                            'proficiency': proficiency,
                            'yearsExperience': years
                        })
        
        return found_skills
    
    def _extract_soft_skills(self, text_lower: str, original_text: str) -> List[Dict]:
        """Extract soft skills with evidence"""
        found_skills = []
        
        for skill in self.soft_skills:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                # Find context/evidence
                evidence = self._find_evidence(original_text, skill)
                
                found_skills.append({
                    'name': skill.title(),
                    'evidence': evidence
                })
        
        return found_skills
    
    def _extract_certifications(self, text: str) -> List[Dict]:
        """Extract certifications"""
        found_certs = []
        
        for cert in self.certifications:
            pattern = r'\b' + re.escape(cert) + r'\b'
            matches = re.finditer(pattern, text, re.IGNORECASE)
            
            for match in matches:
                # Try to find date information nearby
                context = text[max(0, match.start()-50):min(len(text), match.end()+50)]
                date = self._extract_date(context)
                
                found_certs.append({
                    'name': cert.title(),
                    'issuer': self._guess_issuer(cert),
                    'dateObtained': date,
                    'expirationDate': None
                })
                break  # Only add once
        
        return found_certs
    
    def _estimate_proficiency(self, text: str, skill: str) -> str:
        """Estimate proficiency level based on context"""
        context_words = {
            'expert': ['expert', 'advanced', 'senior', 'lead', 'architect'],
            'advanced': ['proficient', 'experienced', 'strong', 'extensive'],
            'intermediate': ['intermediate', 'working knowledge', 'familiar'],
            'beginner': ['basic', 'beginner', 'learning', 'exposure']
        }
        
        # Find skill context
        pattern = r'.{0,50}\b' + re.escape(skill) + r'\b.{0,50}'
        matches = re.finditer(pattern, text, re.IGNORECASE)
        
        for match in matches:
            context = match.group().lower()
            
            for level, keywords in context_words.items():
                if any(keyword in context for keyword in keywords):
                    return level.title()
        
        # Default to intermediate if no context found
        return 'Intermediate'
    
    def _estimate_years(self, text: str, skill: str) -> int:
        """Estimate years of experience with a skill"""
        # Look for patterns like "5 years of Python" or "Python (3 years)"
        pattern = r'(\d+)\s*(?:years?|yrs?).*?' + re.escape(skill)
        matches = re.findall(pattern, text, re.IGNORECASE)
        
        if matches:
            return int(matches[0])
        
        # Alternative pattern
        pattern2 = re.escape(skill) + r'.*?(\d+)\s*(?:years?|yrs?)'
        matches2 = re.findall(pattern2, text, re.IGNORECASE)
        
        if matches2:
            return int(matches2[0])
        
        # Default estimation based on proficiency
        return 2  # Default to 2 years
    
    def _find_evidence(self, text: str, skill: str) -> List[str]:
        """Find evidence/context for soft skills"""
        evidence = []
        
        # Find sentences containing the skill
        sentences = re.split(r'[.!?]+', text)
        
        for sentence in sentences:
            if skill.lower() in sentence.lower():
                cleaned = sentence.strip()
                if cleaned and len(cleaned) > 20:
                    evidence.append(cleaned[:200])  # Limit length
                    if len(evidence) >= 2:  # Max 2 pieces of evidence
                        break
        
        return evidence
    
    def _extract_date(self, text: str) -> str:
        """Extract date from text"""
        # Look for year patterns
        year_pattern = r'\b(19|20)\d{2}\b'
        matches = re.findall(year_pattern, text)
        
        if matches:
            return matches[0]
        
        return None
    
    def _guess_issuer(self, cert: str) -> str:
        """Guess certification issuer"""
        issuers = {
            'aws': 'Amazon Web Services',
            'azure': 'Microsoft',
            'google cloud': 'Google',
            'pmp': 'Project Management Institute',
            'scrum': 'Scrum Alliance',
            'cissp': 'ISC2',
            'comptia': 'CompTIA',
            'cisco': 'Cisco',
            'oracle': 'Oracle',
            'microsoft': 'Microsoft'
        }
        
        for key, issuer in issuers.items():
            if key in cert.lower():
                return issuer
        
        return 'Unknown'
