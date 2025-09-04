import os
from dotenv import load_dotenv
import google.generativeai as genai
from typing import List, Dict, Tuple

# Load .env variables
load_dotenv()

# Configure the API key correctly
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Initialize the model
model = genai.GenerativeModel(model_name="gemini-2.0-flash-lite-preview-02-05")

def generate_summary(text):
    prompt = (
        "Please read the following conversation transcript carefully. "
        "Generate a concise summary that captures the key points discussed during the session. "
        "Do not include the word 'Summary:' "
        "or any extraneous text in your output.\n\n"
        "Conversation Transcript:\n"
        f"{text}"
    )
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def identify_roles_in_transcription(transcription):
    prompt = (
        "You are provided with a transcript of a conversation between a teacher and one or more students. "
        "Your task is to analyze the transcript and annotate each sentence with the correct role label. "
        "For each sentence, prefix it with either 'Teacher:' or 'Student:'. "
        "If there are multiple students, assign each a unique identifier (e.g., Student 1, Student 2, etc.) "
        "based on the context of the conversation. \n\n"
        "Please ensure the output is well-formatted and each line starts with the correct role label. \n\n"
        "Transcript:\n"
        f"{transcription}\n\n"
        "Output format:\n"
        "Teacher: [Teacher's statement]\n"
        "Student 1: [Student's statement]\n"
        "Student 2: [Student's statement]\n"
        "..."
    )

    try:
        response = model.generate_content(prompt)
        return response.text.strip()  # Return the formatted role-annotated conversation
    except Exception as e:
        return f"Error identifying roles: {str(e)}"

def generate_concern_insights_and_recommendations(concerns_data, category_stats, total_sessions):
    """
    Generate NLP-powered insights and recommendations based on student concern patterns
    """
    # Prepare the concern data for analysis
    concern_list = []
    for concern, count in concerns_data[:10]:  # Top 10 concerns
        concern_list.append(f"'{concern}' (mentioned {count} times)")
    
    category_list = []
    for category, data in category_stats.items():
        if data['count'] > 0:
            percentage = round((data['count'] / total_sessions) * 100, 1)
            category_list.append(f"{category}: {data['count']} cases ({percentage}%)")
    
    prompt = f"""
You are an educational data analyst specializing in student welfare and academic support. Analyze the following student concern patterns from consultation sessions and provide actionable insights and recommendations.

CONSULTATION DATA:
- Total Sessions: {total_sessions}
- Sessions with Documented Concerns: {len(concerns_data)}

TOP STUDENT CONCERNS:
{chr(10).join(concern_list)}

CONCERN CATEGORIES:
{chr(10).join(category_list)}

Please provide:

1. KEY INSIGHTS (3-4 insights):
   - Identify the most critical patterns in student concerns
   - Highlight any concerning trends or priority areas
   - Note any interconnections between different concern types
   - Comment on the overall student welfare landscape

2. ACTIONABLE RECOMMENDATIONS (2-3 recommendations) paragraph:
   - Specific interventions for the most common concern categories
   - Proactive measures to address emerging patterns
   - Resource allocation suggestions
   - Support system improvements
   - Preventive strategies

Format your response as:
INSIGHTS:
• [insight 1]
• [insight 2]
• [insight 3]
• [insight 4]

RECOMMENDATIONS:
• [recommendation 1]
• [recommendation 2]
• [recommendation 3]
• [recommendation 4]
• [recommendation 5]

Focus on practical, evidence-based suggestions that can be implemented by educational institutions to improve student support services.
"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error generating insights: {str(e)}"

def categorize_concern_with_sentencing(concern_text):
    """
    Categorization A (Page 1): Generate descriptive category sentences using Gemini
    """
    prompt = f"""
You are an educational data analyst specializing in student welfare. Analyze the following student concern and create a descriptive category sentence that captures the essence of the issue.

Student Concern: "{concern_text}"

TASK: Create a descriptive category sentence (8-15 words) that:
1. Captures the main theme/issue
2. Is professional and empathetic
3. Can group similar concerns together
4. Uses clear, educational terminology

EXAMPLES of good category sentences:
- "Difficulty managing time and meeting academic deadlines effectively"
- "Struggles with mathematical concepts and problem-solving skills"
- "Challenges in maintaining healthy social relationships with peers"
- "Overwhelming stress from academic workload and performance pressure"
- "Financial constraints affecting educational resources and opportunities"

Respond with ONLY the category sentence, nothing else.
"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini categorization error: {e}")
        return "General academic and personal concerns requiring attention"

def categorize_concern_with_general_terms(concern_text):
    """
    Categorization B (Pages 2-3): Generate 1-2 word general term categories
    """
    prompt = f"""
You are an educational analyst. Categorize this student concern into a short, general term (1-2 words maximum).

Student Concern: "{concern_text}"

Choose the MOST APPROPRIATE category from these 6 options ONLY:
- Academic
- Personal
- Social
- Financial
- Health
- Other

GUIDELINES:
- Academic: Studies, grades, assignments, courses, learning difficulties
- Personal: Mental health, time management, self-esteem, family issues, career concerns
- Social: Relationships, peer interactions, communication, social anxiety
- Financial: Money issues, scholarships, financial aid, work-study concerns
- Health: Physical health, medical issues, wellness, disabilities
- Other: Technology issues, general inquiries, unclear concerns, miscellaneous

Respond with ONLY the category term (1-2 words), nothing else.
"""

    try:
        response = model.generate_content(prompt)
        category = response.text.strip()
        
        # Ensure it's 1-2 words maximum and one of our 6 categories
        words = category.split()
        if len(words) > 2:
            category = ' '.join(words[:2])
        
        # Validate it's one of our 6 categories, default to Other if not
        valid_categories = ["Academic", "Personal", "Social", "Financial", "Health", "Other"]
        if category not in valid_categories:
            category = "Other"
            
        return category
    except Exception as e:
        print(f"Gemini general categorization error: {e}")
        return "Other"

def batch_categorize_concerns_sentencing(concerns_list, batch_size=15):
    """
    OPTIMIZED: Batch process concerns for Page 1 categorization with larger batches and caching
    """
    if not concerns_list:
        return {}
    
    # Import here to avoid circular imports
    from services.concern_optimizer import concern_optimizer
    
    print(f"DEBUG: Starting optimized sentencing categorization for {len(concerns_list)} concerns")
    
    # Step 1: Check cache for existing categorizations
    sentencing_cache, _, uncached_concerns = concern_optimizer.get_cached_categories(concerns_list)
    
    # Step 2: TEMPORARILY DISABLE clustering to debug categorization issues
    if uncached_concerns:
        # clusters = concern_optimizer.cluster_similar_concerns(uncached_concerns, similarity_threshold=0.75)
        # representatives = list(clusters.keys())
        # print(f"DEBUG: Clustered {len(uncached_concerns)} uncached concerns into {len(representatives)} representatives")
        
        # Use each concern as its own representative (no clustering)
        clusters = {concern: [concern] for concern in uncached_concerns}
        representatives = uncached_concerns
        print(f"DEBUG: DISABLED clustering - processing {len(representatives)} concerns directly")
    else:
        representatives = []
        clusters = {}
    
    # Step 3: Process representatives in larger batches
    new_categorizations = {}
    
    for i in range(0, len(representatives), batch_size):
        batch = representatives[i:i + batch_size]
        
        # Create batch prompt
        concerns_text = ""
        for idx, concern in enumerate(batch):
            concerns_text += f"{idx + 1}. \"{concern}\"\n"
        
        prompt = f"""
You are an educational data analyst specializing in student welfare. For each student concern below, create a descriptive category sentence that captures the essence of each issue.

CONCERNS:
{concerns_text}

TASK: Create descriptive category sentences (8-15 words each) that:
1. Capture the main theme/issue
2. Are professional and empathetic
3. Can group similar concerns together
4. Use clear, educational terminology

FORMAT your response exactly like this:
1. [Descriptive category sentence for concern 1]
2. [Descriptive category sentence for concern 2]
3. [Descriptive category sentence for concern 3]

EXAMPLES of good category sentences:
- "Difficulty managing time and meeting academic deadlines effectively"
- "Struggles with mathematical concepts and problem-solving skills"
- "Challenges in maintaining healthy social relationships with peers"
- "Overwhelming stress from academic workload and performance pressure"
- "Financial constraints affecting educational resources and opportunities"

Respond with numbered descriptive sentences only.
"""

        try:
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            print(f"DEBUG: Gemini response for batch of {len(batch)}:")
            print(f"Response: {response_text[:200]}...")
            
            lines = response_text.split('\n')
            
            # Extract numbered responses and match them correctly
            valid_responses = []
            for line in lines:
                line = line.strip()
                if line and '. ' in line and line[0].isdigit():
                    try:
                        num_str = line.split('.')[0]
                        line_num = int(num_str)
                        category = line.split('. ', 1)[1].strip()
                        valid_responses.append((line_num, category))
                    except (ValueError, IndexError):
                        continue
            
            print(f"DEBUG: Found {len(valid_responses)} valid categorizations for {len(batch)} concerns")
            
            # Match responses to concerns by line number
            for line_num, category in valid_responses:
                if 1 <= line_num <= len(batch):
                    representative = batch[line_num - 1]  # Convert to 0-based index
                    category_clean = category.strip()
                    
                    print(f"DEBUG: Mapping concern '{representative[:50]}...' to category '{category_clean}'")
                    
                    # DETAILED DEBUG: Show actual mapping
                    if len(representative) > 10:  # Only debug meaningful concerns
                        print(f"    FULL CONCERN: '{representative}'")
                        print(f"    ASSIGNED CATEGORY: '{category_clean}'")
                        print(f"    MATCH QUALITY: {'GOOD' if any(word in representative.lower() for word in category_clean.lower().split()[:3]) else 'QUESTIONABLE'}")
                        print()
                    
                    # Apply to all concerns in this cluster
                    if representative in clusters:
                        for concern in clusters[representative]:
                            new_categorizations[concern] = category_clean
                    else:
                        new_categorizations[representative] = category_clean
            
            # Handle any unmapped concerns with fallback
            for idx, representative in enumerate(batch):
                if representative not in new_categorizations and not any(representative in clusters.get(rep, []) for rep in new_categorizations.keys()):
                    fallback_category = "General academic and personal concerns requiring attention"
                    print(f"DEBUG: Using fallback category for unmapped concern: '{representative[:50]}...'")
                    
                    if representative in clusters:
                        for concern in clusters[representative]:
                            if concern not in new_categorizations:
                                new_categorizations[concern] = fallback_category
                    else:
                        new_categorizations[representative] = fallback_category
                    
        except Exception as e:
            print(f"Batch categorization error: {e}")
            # Fallback for this batch
            for representative in batch:
                fallback_category = "General academic and personal concerns requiring attention"
                if representative in clusters:
                    for concern in clusters[representative]:
                        new_categorizations[concern] = fallback_category
                else:
                    new_categorizations[representative] = fallback_category
    
    # Step 4: Combine cached and new results
    final_results = {**sentencing_cache}
    final_results.update(new_categorizations)
    
    # Step 5: Cache new categorizations (only sentencing, general=None)
    if new_categorizations:
        cache_data = {concern: (category, None) for concern, category in new_categorizations.items()}
        concern_optimizer.cache_categories(cache_data)
    
    print(f"DEBUG: Sentencing categorization complete. Cache hits: {len(sentencing_cache)}, New API calls: {len(new_categorizations)}")
    
    return final_results

def batch_categorize_concerns_general(concerns_list, batch_size=15):
    """
    OPTIMIZED: Batch process concerns for Pages 2-3 categorization with larger batches and caching
    """
    if not concerns_list:
        return {}
    
    # Import here to avoid circular imports
    from services.concern_optimizer import concern_optimizer
    
    print(f"DEBUG: Starting optimized general categorization for {len(concerns_list)} concerns")
    
    # Step 1: Check cache for existing categorizations
    _, general_cache, uncached_concerns = concern_optimizer.get_cached_categories(concerns_list)
    
    # Step 2: Cluster similar uncached concerns to reduce API calls
    if uncached_concerns:
        clusters = concern_optimizer.cluster_similar_concerns(uncached_concerns, similarity_threshold=0.8)
        representatives = list(clusters.keys())
        print(f"DEBUG: Clustered {len(uncached_concerns)} uncached concerns into {len(representatives)} representatives")
    else:
        representatives = []
        clusters = {}
    
    # Step 3: Process representatives in larger batches
    new_categorizations = {}
    
    for i in range(0, len(representatives), batch_size):
        batch = representatives[i:i + batch_size]
        
        concerns_text = ""
        for idx, concern in enumerate(batch):
            concerns_text += f"{idx + 1}. \"{concern}\"\n"
        
        prompt = f"""
Categorize each student concern into short general terms (1-2 words maximum).

CONCERNS:
{concerns_text}

CATEGORIES TO CHOOSE FROM (ONLY USE THESE 6):
- Academic
- Personal
- Social
- Financial
- Health
- Other

GUIDELINES:
- Academic: Studies, grades, assignments, courses, learning difficulties
- Personal: Mental health, time management, self-esteem, family issues, career concerns
- Social: Relationships, peer interactions, communication, social anxiety
- Financial: Money issues, scholarships, financial aid, work-study concerns
- Health: Physical health, medical issues, wellness, disabilities
- Other: Technology issues, general inquiries, unclear concerns, miscellaneous

FORMAT your response exactly like this:
1. [Category]
2. [Category]
3. [Category]
etc.

EXAMPLE:
1. Academic
2. Personal
3. Social
"""

        try:
            response = model.generate_content(prompt)
            lines = response.text.strip().split('\n')
            
            for idx, line in enumerate(lines):
                if idx < len(batch) and '. ' in line:
                    category = line.split('. ', 1)[1] if '. ' in line else line
                    # Ensure 1-2 words
                    words = category.strip().split()
                    if len(words) > 2:
                        category = ' '.join(words[:2])
                    
                    representative = batch[idx]
                    category_clean = category.strip()
                    
                    # Apply to all concerns in this cluster
                    if representative in clusters:
                        for concern in clusters[representative]:
                            new_categorizations[concern] = category_clean
                    else:
                        new_categorizations[representative] = category_clean
                        
                elif idx < len(batch):
                    representative = batch[idx]
                    if representative in clusters:
                        for concern in clusters[representative]:
                            new_categorizations[concern] = "Other"
                    else:
                        new_categorizations[representative] = "Other"
                    
        except Exception as e:
            print(f"Batch general categorization error: {e}")
            for representative in batch:
                if representative in clusters:
                    for concern in clusters[representative]:
                        new_categorizations[concern] = "Other"
                else:
                    new_categorizations[representative] = "Other"
    
    # Step 4: Combine cached and new results
    final_results = {**general_cache}
    final_results.update(new_categorizations)
    
    # Step 5: Cache new categorizations (sentencing=None, general=category)
    if new_categorizations:
        cache_data = {concern: (None, category) for concern, category in new_categorizations.items()}
        concern_optimizer.cache_categories(cache_data)
    
    print(f"DEBUG: General categorization complete. Cache hits: {len(general_cache)}, New API calls: {len(new_categorizations)}")
    
    return final_results
