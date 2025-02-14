import os
import google.generativeai as genai

# Configure the API key correctly
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Initialize the model
model = genai.GenerativeModel(model_name="gemini-2.0-flash-lite-preview-02-05")

def generate_summary(text):
    prompt = f"Summarize the following text (No need to say Summary:) and give the overall sentiment of the session[POSITIVE, NEGATIVE, NEUTRAL] at the end of the summary:\n{text}"
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"

def identify_roles_in_transcription(transcription):
    prompt = f"""
    Analyze the following conversation and identify the roles as either "Teacher" or "Student".
    There may be multiple Students in the conversation.
    Each sentence should be prefixed with the identified role.

    Conversation:
    {transcription}

    Format the response as follows:

    Teacher: [Teacher's statement]
    Student: [Student's statement]

    If there are multiple students in the conversation, assign each student a unique identifier (e.g., Student 1, Student 2).

    Ensure the formatting is consistent and structured correctly.
    """

    try:
        response = model.generate_content(prompt)
        return response.text  # AI-generated response with roles assigned
    except Exception as e:
        return f"Error identifying roles: {str(e)}"
