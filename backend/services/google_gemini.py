import os
from dotenv import load_dotenv
import google.generativeai as genai

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

2. ACTIONABLE RECOMMENDATIONS (4-5 recommendations):
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
