import os
import google.generativeai as genai

# Configure the API key correctly
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Initialize the model
model = genai.GenerativeModel(model_name="gemini-2.0-flash-lite-preview-02-05")

def generate_summary(text):
    prompt = (
        "Please read the following conversation transcript carefully. "
        "Generate a concise summary that captures the key points discussed during the session. "
        "At the end of the summary, on a new line, state the overall sentiment of the session "
        "as one of the following: POSITIVE, NEGATIVE, or NEUTRAL. Do not include the word 'Summary:' "
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
