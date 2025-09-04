"""
Concern Theme Extraction Service
--------------------------------
This service extracts the top 3 theme concerns from a set of student concerns
using both text preprocessing and Gemini AI.

The approach:
1. Normalize concerns through text preprocessing
2. Use an optimized approach to batch process concerns
3. Send to Gemini AI to extract just 3 key themes
"""

import re
import time
from collections import Counter
from typing import List, Dict, Any
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
try:
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    model = genai.GenerativeModel(model_name="gemini-2.0-flash-lite-preview-02-05")
except Exception as e:
    print(f"WARNING: Failed to initialize Gemini: {str(e)}")
    model = None

def normalize_concern(concern: str) -> str:
    """Normalize a concern by removing special characters, stop words, and keeping only meaningful words."""
    if not concern:
        return ""
    
    # Convert to lowercase
    normalized = concern.lower()
    
    # Remove special characters but keep spaces and alphanumeric characters
    normalized = re.sub(r'[^\w\s]', '', normalized)
    
    # Define stop words to remove (common words that don't add meaning)
    stop_words = {
        'i', 'im', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 
        'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 
        'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 
        'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 
        'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 
        'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 
        'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 
        'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 
        'with', 'through', 'during', 'before', 'after', 'above', 'below', 
        'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 
        'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 
        'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 
        'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 
        'can', 'will', 'just', 'should', 'now'
    }
    
    # Split into words and remove stop words
    words = normalized.split()
    meaningful_words = [word for word in words if word not in stop_words and len(word) > 1]
    
    # Join back with spaces
    normalized = ' '.join(meaningful_words)
    
    # Remove extra spaces (just in case)
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    
    return normalized

def batch_normalize_concerns(concerns: List[str]) -> List[str]:
    """Normalize a batch of concerns efficiently."""
    return [normalize_concern(concern) for concern in concerns]

def extract_themes_with_gemini(normalized_concerns: List[str], 
                               concern_frequency: Dict[str, int]) -> List[Dict[str, Any]]:
    """
    Extract the top 3 themes from concerns using Gemini AI
    """
    if not model:
        print("WARNING: Gemini model not available, using fallback approach")
        return extract_themes_fallback(normalized_concerns, concern_frequency)
    
    # Prepare the input for Gemini
    # Sort concerns by frequency for better results
    sorted_concerns = sorted(
        [(concern, concern_frequency.get(concern, 1)) 
         for concern in normalized_concerns if concern],
        key=lambda x: x[1], 
        reverse=True
    )
    
    # Take top 50 concerns for processing (to avoid token limits)
    top_concerns = sorted_concerns[:50]
    
    # Format the concerns for the prompt
    formatted_concerns = "\\n".join([
        f"- {concern} (mentioned {count} times)" 
        for concern, count in top_concerns
    ])
    
    # Create the prompt for Gemini
    prompt = f"""
You are an education data analyst. Based on the student concerns below, identify exactly 3 major themes.

Student Concerns:
{formatted_concerns}

For each theme:
1. Provide a concise title (maximum 5 words)
2. Include a brief description (1-2 sentences)
3. List 3-5 related keywords

IMPORTANT: Return EXACTLY 3 themes in this JSON format:
```json
[
  {{
    "theme": "Theme 1 Title",
    "description": "Brief description of theme 1",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "frequency": "high|medium|low"
  }},
  {{
    "theme": "Theme 2 Title",
    "description": "Brief description of theme 2",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "frequency": "high|medium|low"
  }},
  {{
    "theme": "Theme 3 Title",
    "description": "Brief description of theme 3",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "frequency": "high|medium|low"
  }}
]
```
Return ONLY the JSON with no additional text.
"""
    
    try:
        start_time = time.time()
        response = model.generate_content(prompt)
        processing_time = time.time() - start_time
        
        # Extract JSON from response
        response_text = response.text
        json_text = response_text
        
        # If response has markdown code blocks, extract the JSON
        if "```json" in response_text:
            json_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            json_text = response_text.split("```")[1].strip()
            
        import json
        try:
            themes = json.loads(json_text)
            
            # Add processing metadata
            for theme in themes:
                theme['ai_generated'] = True
                theme['processing_time'] = round(processing_time, 2)
                
            return themes
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {str(e)}")
            print(f"Response was: {response_text[:500]}...")
            return extract_themes_fallback(normalized_concerns, concern_frequency)
            
    except Exception as e:
        print(f"Error with Gemini: {str(e)}")
        return extract_themes_fallback(normalized_concerns, concern_frequency)

def extract_themes_fallback(normalized_concerns: List[str], 
                           concern_frequency: Dict[str, int]) -> List[Dict[str, Any]]:
    """Fallback method to extract themes when Gemini fails"""
    # Use keyword matching as fallback
    academic_keywords = ["assignment", "exam", "grade", "course", "class", "professor", "lecture", "study"]
    stress_keywords = ["stress", "anxiety", "mental", "health", "pressure", "overwhelm", "burnout"]
    time_keywords = ["time", "deadline", "schedule", "balance", "manage", "organization", "prioritize"]
    
    # Count keyword occurrences
    keyword_counts = {
        "Academic Concerns": 0,
        "Stress and Mental Health": 0,
        "Time Management": 0
    }
    
    for concern in normalized_concerns:
        for keyword in academic_keywords:
            if keyword in concern:
                keyword_counts["Academic Concerns"] += 1
                break
                
        for keyword in stress_keywords:
            if keyword in concern:
                keyword_counts["Stress and Mental Health"] += 1
                break
                
        for keyword in time_keywords:
            if keyword in concern:
                keyword_counts["Time Management"] += 1
                break
    
    # Create fallback themes
    themes = [
        {
            "theme": "Academic Concerns",
            "description": "Issues related to coursework, grades, and academic performance",
            "keywords": ["coursework", "grades", "exams", "assignments", "academic performance"],
            "frequency": "high" if keyword_counts["Academic Concerns"] > len(normalized_concerns) * 0.3 else "medium",
            "ai_generated": False
        },
        {
            "theme": "Stress and Mental Health",
            "description": "Concerns about stress, anxiety and maintaining mental wellbeing",
            "keywords": ["stress", "anxiety", "mental health", "pressure", "burnout"],
            "frequency": "high" if keyword_counts["Stress and Mental Health"] > len(normalized_concerns) * 0.2 else "medium",
            "ai_generated": False
        },
        {
            "theme": "Time Management",
            "description": "Difficulties with scheduling, meeting deadlines, and balancing workload",
            "keywords": ["time", "deadlines", "schedule", "balance", "organization"],
            "frequency": "high" if keyword_counts["Time Management"] > len(normalized_concerns) * 0.2 else "medium",
            "ai_generated": False
        }
    ]
    
    return themes
