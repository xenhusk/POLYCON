import os
import google.generativeai as genai

# Configure the API key correctly
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize the model
model = genai.GenerativeModel(model_name="gemini-1.5-flash")

def generate_summary(text):
    prompt = f"Summarize the following text:\n{text}"
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"
