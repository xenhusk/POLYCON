#!/usr/bin/env python3
"""
Analyze consultation session concerns for duplicates and patterns
"""

from models import ConsultationSession
from extensions import db
from app import app
from collections import Counter

def analyze_concerns():
    with app.app_context():
        sessions = ConsultationSession.query.limit(100).all()
        concerns = [s.concern for s in sessions if s.concern and s.concern.strip()]
        
        print('=== CONCERN ANALYSIS ===')
        print(f'Total sessions analyzed: {len(sessions)}')
        print(f'Sessions with concerns: {len(concerns)}')
        
        print('\nSample concerns:')
        for i, concern in enumerate(concerns[:15], 1):
            print(f'{i:2d}. "{concern}"')
        
        # Check for duplicates
        concern_counts = Counter(concerns)
        print(f'\nDUPLICATE ANALYSIS:')
        print(f'Total concerns: {len(concerns)}')
        print(f'Unique concerns: {len(concern_counts)}')
        print(f'Duplication rate: {((len(concerns) - len(concern_counts)) / len(concerns) * 100):.1f}%')
        
        print(f'\nMost common concerns:')
        for concern, count in concern_counts.most_common(10):
            if count > 1:
                print(f'  "{concern}" appears {count} times')
        
        # Analyze patterns
        print(f'\nPATTERN ANALYSIS:')
        short_concerns = [c for c in concerns if len(c.split()) <= 3]
        long_concerns = [c for c in concerns if len(c.split()) > 10]
        
        print(f'Short concerns (≤3 words): {len(short_concerns)}')
        print(f'Long concerns (>10 words): {len(long_concerns)}')
        
        # Find similar concerns
        similar_groups = {}
        for concern in concerns:
            # Group by first few words
            key = ' '.join(concern.split()[:3]).lower()
            if key not in similar_groups:
                similar_groups[key] = []
            similar_groups[key].append(concern)
        
        print(f'\nSIMILAR CONCERN GROUPS:')
        for key, group in similar_groups.items():
            if len(group) > 1 and len(set(group)) > 1:  # Multiple similar but not identical
                print(f'  Group "{key}": {len(group)} variations')
                for concern in set(group)[:3]:  # Show first 3 unique variations
                    print(f'    - "{concern}"')

if __name__ == '__main__':
    analyze_concerns()
