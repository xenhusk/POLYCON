"""
Concern Optimization Service - Text normalization and clustering for efficient Gemini API usage
"""

import re
import string
from collections import defaultdict, Counter
from difflib import SequenceMatcher
import numpy as np
from typing import List, Dict, Tuple, Set
from models import ConcernCategory
from extensions import db

class ConcernOptimizer:
    def __init__(self):
        self.stopwords = {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its', 
            'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with', 'i', 'am', 'my', 'me', 'this', 'have', 'had', 
            'but', 'not', 'or', 'can', 'do', 'so', 'we', 'you', 'your', 'our', 'they', 'them', 'their', 'been', 
            'were', 'what', 'when', 'where', 'who', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 
            'most', 'other', 'some', 'such', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'now'
        }
        
        # Keep important academic and emotional words
        self.important_words = {'am', 'me', 'my', 'i', 'not', 'can', 'do', 'stress', 'anxiety', 'difficult', 'hard'}
    
    def normalize_concern(self, concern_text: str) -> str:
        """
        Normalize concern text to reduce duplicates and improve clustering
        """
        if not concern_text:
            return ""
        
        # Convert to lowercase
        text = concern_text.lower().strip()
        
        # Remove extra whitespace and normalize punctuation
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Tokenize and filter
        words = []
        for word in text.split():
            # Keep meaningful words
            if (len(word) > 2 and 
                (word not in self.stopwords or word in self.important_words) and
                word.isalpha()):
                words.append(word)
        
        # Sort words to handle different word orders
        # "time management" vs "managing time" -> "management time"
        return ' '.join(sorted(words))
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two normalized texts"""
        return SequenceMatcher(None, text1, text2).ratio()
    
    def cluster_similar_concerns(self, concerns: List[str], similarity_threshold: float = 0.7) -> Dict[str, List[str]]:
        """
        Group similar concerns together to reduce API calls
        Returns: {representative_concern: [list_of_similar_concerns]}
        """
        if not concerns:
            return {}
        
        # Normalize all concerns
        normalized_concerns = [(concern, self.normalize_concern(concern)) for concern in concerns]
        
        clusters = {}
        used_concerns = set()
        
        for i, (original1, normalized1) in enumerate(normalized_concerns):
            if original1 in used_concerns:
                continue
                
            # Start a new cluster with this concern as representative
            cluster_concerns = [original1]
            used_concerns.add(original1)
            
            # Find similar concerns
            for j, (original2, normalized2) in enumerate(normalized_concerns[i+1:], start=i+1):
                if original2 in used_concerns:
                    continue
                    
                # Check similarity
                similarity = self.calculate_similarity(normalized1, normalized2)
                if similarity >= similarity_threshold:
                    cluster_concerns.append(original2)
                    used_concerns.add(original2)
            
            # Use the shortest concern as representative (usually clearest)
            representative = min(cluster_concerns, key=len)
            clusters[representative] = cluster_concerns
        
        return clusters
    
    def get_cached_categories(self, concerns: List[str]) -> Tuple[Dict[str, str], Dict[str, str], List[str]]:
        """
        Check database cache for existing categorizations
        Returns: (sentencing_cache, general_cache, uncached_concerns)
        """
        sentencing_cache = {}
        general_cache = {}
        uncached_concerns = []
        
        try:
            # Import here to avoid circular imports
            from models import ConcernCategory
            
            for concern in concerns:
                normalized = self.normalize_concern(concern)
                try:
                    cached = ConcernCategory.query.filter_by(normalized_concern=normalized).first()
                    
                    if cached:
                        if cached.sentencing_category:
                            sentencing_cache[concern] = cached.sentencing_category
                        if cached.general_category:
                            general_cache[concern] = cached.general_category
                            
                        # Update frequency count
                        cached.frequency_count += 1
                        cached.updated_at = db.text("(now() AT TIME ZONE 'UTC')")
                    else:
                        uncached_concerns.append(concern)
                except Exception as db_error:
                    print(f"Database error for concern '{concern}': {db_error}")
                    uncached_concerns.append(concern)
            
            # Commit frequency updates
            if sentencing_cache or general_cache:
                try:
                    from extensions import db
                    db.session.commit()
                except Exception as commit_error:
                    print(f"Error committing frequency updates: {commit_error}")
                    from extensions import db
                    db.session.rollback()
        
        except Exception as e:
            print(f"Cache lookup failed (table might not exist): {e}")
            # If cache lookup fails entirely, treat all concerns as uncached
            uncached_concerns = concerns.copy()
        
        return sentencing_cache, general_cache, uncached_concerns
    
    def cache_categories(self, concern_categories: Dict[str, Tuple[str, str]]):
        """
        Cache new categorizations to database
        concern_categories: {concern: (sentencing_category, general_category)}
        """
        try:
            # Import here to avoid circular imports
            from models import ConcernCategory
            from extensions import db
            
            for concern, (sentencing_cat, general_cat) in concern_categories.items():
                normalized = self.normalize_concern(concern)
                
                try:
                    # Check if already exists
                    existing = ConcernCategory.query.filter_by(normalized_concern=normalized).first()
                    
                    if existing:
                        # Update existing
                        if sentencing_cat and not existing.sentencing_category:
                            existing.sentencing_category = sentencing_cat
                        if general_cat and not existing.general_category:
                            existing.general_category = general_cat
                        existing.frequency_count += 1
                        existing.updated_at = db.text("(now() AT TIME ZONE 'UTC')")
                    else:
                        # Create new
                        new_category = ConcernCategory(
                            normalized_concern=normalized,
                            original_concern=concern,
                            sentencing_category=sentencing_cat,
                            general_category=general_cat,
                            frequency_count=1
                        )
                        db.session.add(new_category)
                except Exception as item_error:
                    print(f"Error processing concern '{concern}': {item_error}")
                    continue
            
            try:
                db.session.commit()
                print(f"Cached {len(concern_categories)} new concern categorizations")
            except Exception as commit_error:
                print(f"Error caching concern categories: {commit_error}")
                db.session.rollback()
                
        except Exception as e:
            print(f"Cache save failed (table might not exist): {e}")
            # If caching fails, just continue without caching
    
    def get_optimization_stats(self) -> Dict:
        """Get statistics about optimization performance"""
        try:
            # Import here to avoid circular imports
            from models import ConcernCategory
            
            total_cached = ConcernCategory.query.count()
            most_frequent = ConcernCategory.query.order_by(ConcernCategory.frequency_count.desc()).limit(10).all()
            
            return {
                'total_cached_concerns': total_cached,
                'most_frequent_concerns': [
                    {
                        'concern': item.original_concern,
                        'normalized': item.normalized_concern,
                        'frequency': item.frequency_count,
                        'sentencing_category': item.sentencing_category,
                        'general_category': item.general_category
                    }
                    for item in most_frequent
                ]
            }
        except Exception as e:
            print(f"Error getting optimization stats: {e}")
            return {
                'total_cached_concerns': 0,
                'most_frequent_concerns': [],
                'error': f'Database table might not exist: {e}'
            }

# Global instance
concern_optimizer = ConcernOptimizer()
