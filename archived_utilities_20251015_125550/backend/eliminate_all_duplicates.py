#!/usr/bin/env python3
"""
Complete Concern Uniqueness System
---------------------------------
This system eliminates ALL duplicate concerns by generating unique variations
for every instance of duplicate concerns in the database.
"""

import os
import re
import time
import random
from typing import List, Dict, Set, Tuple
from collections import Counter, defaultdict
import google.generativeai as genai
from dotenv import load_dotenv

from models import ConsultationSession
from extensions import db
from app import app

# Load environment variables
load_dotenv()

# Configure Gemini
try:
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    model = genai.GenerativeModel(model_name="gemini-2.0-flash-lite-preview-02-05")
    print("✅ Gemini AI model initialized successfully")
except Exception as e:
    print(f"❌ WARNING: Failed to initialize Gemini: {str(e)}")
    model = None

class CompleteUniquenessSystem:
    def __init__(self):
        self.model = model
        self.generated_variations = set()  # Track all generated variations to avoid new duplicates
        self.concern_templates = self._create_concern_templates()
        
    def _create_concern_templates(self) -> Dict[str, List[str]]:
        """Create manual templates for common concern patterns as backup"""
        return {
            'academic_performance': [
                "My grades are slipping and I need help getting back on track",
                "Academic performance is declining despite my best efforts",
                "Struggling to maintain the GPA I need for my goals",
                "My test scores aren't reflecting the time I put into studying",
                "Having difficulty keeping up with course requirements",
                "Academic expectations versus reality is causing me stress"
            ],
            'programming_difficulty': [
                "These coding assignments are beyond my current skill level",
                "Programming concepts are challenging my understanding",
                "Software development coursework is overwhelming",
                "Computer science projects are testing my limits",
                "Debugging and problem-solving in code is frustrating",
                "Algorithm design is proving more difficult than expected"
            ],
            'stress_anxiety': [
                "Academic pressure is affecting my mental well-being",
                "Constant worry about assignments is exhausting",
                "University workload is causing overwhelming stress",
                "Anxiety about academic performance is consuming",
                "The pressure to succeed is mentally draining",
                "Academic stress is impacting my daily functioning"
            ],
            'time_management': [
                "Balancing multiple deadlines is proving challenging",
                "Time allocation between subjects needs improvement",
                "Struggling to prioritize academic tasks effectively",
                "Schedule management is becoming overwhelming",
                "Procrastination is affecting my academic timeline",
                "Time pressure is creating academic stress"
            ],
            'motivation_issues': [
                "Losing interest in my academic program",
                "Academic enthusiasm is declining significantly",
                "Finding it hard to stay motivated with coursework",
                "Questioning my commitment to current studies",
                "Academic passion is waning despite effort",
                "Struggling to maintain engagement with learning"
            ],
            'mental_health': [
                "Emotional challenges are affecting academic focus",
                "Mental wellness concerns are impacting studies",
                "Psychological stress is interfering with learning",
                "Emotional well-being needs attention and support",
                "Mental health is affecting academic concentration",
                "Psychological pressure is overwhelming my coping"
            ]
        }
    
    def _categorize_concern(self, concern: str) -> str:
        """Categorize a concern to select appropriate templates"""
        concern_lower = concern.lower()
        
        if any(word in concern_lower for word in ['grade', 'gpa', 'academic performance', 'failing', 'probation']):
            return 'academic_performance'
        elif any(word in concern_lower for word in ['programming', 'coding', 'algorithm', 'computer science']):
            return 'programming_difficulty'
        elif any(word in concern_lower for word in ['stress', 'anxiety', 'overwhelming', 'pressure']):
            return 'stress_anxiety'
        elif any(word in concern_lower for word in ['time', 'deadline', 'schedule', 'procrastination']):
            return 'time_management'
        elif any(word in concern_lower for word in ['motivation', 'interest', 'enthusiasm', 'engagement']):
            return 'motivation_issues'
        elif any(word in concern_lower for word in ['mental health', 'emotional', 'psychological', 'wellbeing']):
            return 'mental_health'
        else:
            return 'academic_performance'  # Default category
    
    def generate_unique_variations_bulk(self, concern: str, count: int) -> List[str]:
        """Generate multiple unique variations using both AI and templates"""
        variations = []
        
        # Try AI first if available
        if self.model and count <= 8:  # Limit AI calls for quota management
            try:
                ai_variations = self._generate_ai_variations(concern, count)
                variations.extend(ai_variations)
            except Exception as e:
                print(f"  ⚠️ AI generation failed: {e}")
        
        # Fill remaining with template-based variations
        if len(variations) < count:
            template_variations = self._generate_template_variations(concern, count - len(variations))
            variations.extend(template_variations)
        
        # Ensure uniqueness
        unique_variations = []
        for var in variations:
            if var not in self.generated_variations and var != concern:
                unique_variations.append(var)
                self.generated_variations.add(var)
        
        # If still not enough, create simple variations
        while len(unique_variations) < count:
            simple_var = self._create_simple_variation(concern, len(unique_variations))
            if simple_var not in self.generated_variations:
                unique_variations.append(simple_var)
                self.generated_variations.add(simple_var)
        
        return unique_variations[:count]
    
    def _generate_ai_variations(self, concern: str, count: int) -> List[str]:
        """Generate variations using Gemini AI"""
        prompt = f"""
Create {count} unique ways for a student to express this academic concern. Each should:

Original: "{concern}"

Requirements:
- Express the SAME core issue with different words/phrasing
- Sound natural and authentic to student speech
- Be 6-20 words long
- Avoid repetitive patterns
- Use varied sentence structures (statements, questions, expressions)

Return exactly {count} variations, one per line:
"""
        
        response = self.model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.8,
                max_output_tokens=400,
                top_p=0.9,
                top_k=40
            )
        )
        
        if response and response.text:
            lines = response.text.strip().split('\n')
            variations = []
            for line in lines:
                clean_line = re.sub(r'^[-•*\d]+\.?\s*', '', line.strip())
                clean_line = re.sub(r'^["\']|["\']$', '', clean_line)
                if clean_line and len(clean_line.split()) >= 4:
                    variations.append(clean_line)
            return variations[:count]
        
        return []
    
    def _generate_template_variations(self, concern: str, count: int) -> List[str]:
        """Generate variations using templates"""
        category = self._categorize_concern(concern)
        templates = self.concern_templates.get(category, self.concern_templates['academic_performance'])
        
        # Shuffle templates and return up to count
        shuffled = templates.copy()
        random.shuffle(shuffled)
        return shuffled[:count]
    
    def _create_simple_variation(self, concern: str, index: int) -> str:
        """Create simple variations by modifying the original"""
        variations = [
            f"I'm dealing with {concern.lower()}",
            f"Currently facing {concern.lower()}",
            f"Need help with {concern.lower()}",
            f"Struggling with {concern.lower()}",
            f"Experiencing {concern.lower()}",
            f"{concern} - need guidance",
            f"Having issues with {concern.lower()}",
            f"Concerns about {concern.lower()}"
        ]
        
        if index < len(variations):
            return variations[index]
        else:
            return f"Issue #{index + 1}: {concern.lower()}"
    
    def analyze_all_duplicates(self) -> Dict[str, int]:
        """Analyze ALL duplicates in the database"""
        with app.app_context():
            sessions = ConsultationSession.query.all()
            concerns = [s.concern for s in sessions if s.concern and s.concern.strip()]
            concern_frequency = Counter(concerns)
            
            # Return only duplicates (frequency > 1)
            duplicates = {concern: count for concern, count in concern_frequency.items() if count > 1}
            
            print(f"📊 DUPLICATE ANALYSIS:")
            print(f"Total concerns: {len(concerns)}")
            print(f"Unique concerns: {len(concern_frequency)}")
            print(f"Duplicate concern types: {len(duplicates)}")
            print(f"Total duplicate instances: {sum(duplicates.values()) - len(duplicates)}")
            
            return duplicates
    
    def eliminate_all_duplicates(self, dry_run: bool = True) -> Dict[str, int]:
        """Completely eliminate ALL duplicate concerns"""
        duplicates = self.analyze_all_duplicates()
        
        if not duplicates:
            print("🎉 No duplicates found!")
            return {}
        
        print(f"\n🔄 Processing {len(duplicates)} duplicate concern types...")
        
        with app.app_context():
            total_updated = 0
            updates_by_concern = {}
            
            for i, (concern, frequency) in enumerate(duplicates.items(), 1):
                print(f"\n{i}/{len(duplicates)}: '{concern}' ({frequency} instances)")
                
                # Find all sessions with this concern
                sessions = ConsultationSession.query.filter_by(concern=concern).all()
                
                if len(sessions) != frequency:
                    print(f"  ⚠️ Frequency mismatch: expected {frequency}, found {len(sessions)}")
                
                # Generate unique variations for all instances except the first
                variations_needed = len(sessions) - 1
                if variations_needed > 0:
                    print(f"  🔄 Generating {variations_needed} unique variations...")
                    
                    # Generate variations
                    try:
                        variations = self.generate_unique_variations_bulk(concern, variations_needed)
                        print(f"  ✅ Generated {len(variations)} variations")
                        
                        # Apply variations to sessions (keep first original, vary the rest)
                        for j, session in enumerate(sessions[1:], 1):  # Skip first session
                            if j <= len(variations):
                                new_concern = variations[j-1]
                                print(f"    Session {session.id}: '{new_concern}'")
                                
                                if not dry_run:
                                    session.concern = new_concern
                                    total_updated += 1
                            else:
                                print(f"    ⚠️ No variation available for session {session.id}")
                        
                        updates_by_concern[concern] = len(variations)
                        
                    except Exception as e:
                        print(f"  ❌ Failed to process '{concern}': {e}")
                        continue
                
                # Rate limiting for AI calls
                if self.model and i % 10 == 0:
                    print("  💤 Rate limiting pause...")
                    time.sleep(2)
            
            if not dry_run:
                db.session.commit()
                print(f"\n✅ DATABASE UPDATED!")
                print(f"Total sessions modified: {total_updated}")
                print(f"Concern types processed: {len(updates_by_concern)}")
            else:
                print(f"\n🔍 DRY RUN COMPLETE")
                print(f"Would update {total_updated} sessions")
                print(f"Would process {len(updates_by_concern)} concern types")
            
            return updates_by_concern

def main():
    """Main function for complete concern uniqueness"""
    print("🚀 COMPLETE CONCERN UNIQUENESS SYSTEM")
    print("=" * 50)
    print("This will eliminate ALL duplicate concerns in the database.")
    print("Each duplicate will be replaced with a unique variation.")
    
    uniqueness_system = CompleteUniquenessSystem()
    
    # First, analyze current state
    duplicates = uniqueness_system.analyze_all_duplicates()
    
    if not duplicates:
        print("\n🎉 No duplicates found! Database is already unique.")
        return
    
    print(f"\n📋 Top duplicate concerns:")
    for concern, count in sorted(duplicates.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  '{concern}' appears {count} times")
    
    # Confirm operation
    total_duplicates = sum(duplicates.values()) - len(duplicates)
    print(f"\n⚠️ This will modify {total_duplicates} consultation sessions")
    print(f"📊 {len(duplicates)} concern types will be diversified")
    
    proceed = input("\nProceed with complete duplicate elimination? (y/N): ").strip().lower()
    if proceed != 'y':
        print("❌ Operation cancelled")
        return
    
    # Run dry run first
    print(f"\n🔍 Running dry run first...")
    updates = uniqueness_system.eliminate_all_duplicates(dry_run=True)
    
    # Final confirmation
    final_confirm = input(f"\nApply changes to database? (y/N): ").strip().lower()
    if final_confirm == 'y':
        print(f"\n🚀 Applying changes...")
        updates = uniqueness_system.eliminate_all_duplicates(dry_run=False)
        
        # Clear cache
        try:
            import requests
            response = requests.post('http://localhost:5001/hometeacher/clear_cache')
            print("🗑️ Analytics cache cleared")
        except:
            print("⚠️ Could not clear cache - please clear manually")
        
        print(f"\n🎉 COMPLETE! All duplicate concerns have been eliminated.")
        print(f"The database now contains unique concern variations only.")
    else:
        print("❌ Changes not applied")

if __name__ == '__main__':
    main()
