"""
Enhanced Concern Insights Service
---------------------------------
This service generates insights and recommendations from processed concern category data
using Gemini AI for more meaningful analysis.
"""

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

def generate_enhanced_insights_from_categories(ai_themes, category_stats, total_sessions, sessions_with_concerns):
    """
    Generate enhanced insights and recommendations based on AI themes and category statistics
    instead of raw concerns for better analysis.
    """
    if not model:
        return generate_fallback_insights(ai_themes, category_stats, total_sessions)
    
    # Prepare the data for Gemini analysis
    themes_summary = ""
    if ai_themes:
        themes_summary = "AI-Identified Themes:\\n"
        for i, theme in enumerate(ai_themes, 1):
            theme_name = theme.get('theme', f'Theme {i}')
            description = theme.get('description', 'No description')
            frequency = theme.get('frequency', 'unknown')
            count = theme.get('count', 0)
            keywords = theme.get('keywords', [])
            
            themes_summary += f"\\n{i}. {theme_name} ({frequency} frequency - {count} cases)\\n"
            themes_summary += f"   Description: {description}\\n"
            themes_summary += f"   Keywords: {', '.join(keywords)}\\n"
    
    # Prepare category statistics
    category_summary = "\\nCategory Distribution:\\n"
    for category, stats in category_stats.items():
        count = stats.get('count', 0)
        percentage = stats.get('percentage', 0)
        sample_concerns = stats.get('sample_concerns', [])
        
        category_summary += f"\\n• {category}: {count} sessions ({percentage}%)\\n"
        if sample_concerns:
            category_summary += f"  Examples: {'; '.join(sample_concerns[:2])}\\n"
    
    # Create the prompt for insights
    insights_prompt = f"""
You are an expert educational analyst specializing in student welfare and academic support. Analyze the following student concern data from consultation sessions and provide comprehensive insights.

CONSULTATION SESSION DATA:
- Total Sessions Analyzed: {total_sessions}
- Sessions with Documented Concerns: {sessions_with_concerns}
- Coverage Rate: {round((sessions_with_concerns / max(total_sessions, 1)) * 100, 1)}%

{themes_summary}

{category_summary}

Please provide exactly 2 detailed paragraphs of KEY INSIGHTS:

Paragraph 1: Focus on the most critical patterns and trends you observe in the data. Identify the primary concern areas, their interconnections, and what they reveal about student welfare.

Paragraph 2: Analyze the implications of these patterns for the educational institution. Discuss the underlying causes, potential risks if unaddressed, and the broader impact on student success and well-being.

Format as exactly 2 paragraphs with no headers, bullets, or numbering.
"""

    # Create the prompt for recommendations
    recommendations_prompt = f"""
You are an expert educational consultant. Based on the student concern analysis data below, provide actionable recommendations for institutional improvement.

CONSULTATION SESSION DATA:
- Total Sessions Analyzed: {total_sessions}
- Sessions with Documented Concerns: {sessions_with_concerns}
- Coverage Rate: {round((sessions_with_concerns / max(total_sessions, 1)) * 100, 1)}%

{themes_summary}

{category_summary}

Please provide exactly 2 detailed paragraphs of ACTIONABLE RECOMMENDATIONS:

Paragraph 1: Provide specific, immediate interventions and support programs that should be implemented to address the most pressing concern categories. Include resource allocation suggestions and implementation strategies.

Paragraph 2: Outline long-term systemic improvements and preventive measures. Focus on structural changes, policy recommendations, and sustainable solutions that will improve overall student welfare and academic success.

Format as exactly 2 paragraphs with no headers, bullets, or numbering.
"""

    try:
        # Generate insights
        insights_response = model.generate_content(insights_prompt)
        insights_text = insights_response.text.strip()
        
        # Split into paragraphs and clean up
        insights_paragraphs = [p.strip() for p in insights_text.split('\\n\\n') if p.strip()]
        # Ensure we have exactly 2 paragraphs
        if len(insights_paragraphs) > 2:
            insights_paragraphs = insights_paragraphs[:2]
        elif len(insights_paragraphs) < 2:
            # If we don't have 2 paragraphs, split the first one or add a fallback
            if len(insights_paragraphs) == 1:
                # Try to split long paragraph in half
                para = insights_paragraphs[0]
                if len(para) > 300:
                    mid_point = len(para) // 2
                    split_point = para.find('. ', mid_point)
                    if split_point > 0:
                        insights_paragraphs = [para[:split_point + 1], para[split_point + 2:]]
                    else:
                        insights_paragraphs.append("The data suggests a need for comprehensive student support programs to address the identified concerns.")
                else:
                    insights_paragraphs.append("Further analysis and targeted interventions are recommended based on these findings.")
        
        # Generate recommendations
        recommendations_response = model.generate_content(recommendations_prompt)
        recommendations_text = recommendations_response.text.strip()
        
        # Split into paragraphs and clean up
        recommendations_paragraphs = [p.strip() for p in recommendations_text.split('\\n\\n') if p.strip()]
        # Ensure we have exactly 2 paragraphs
        if len(recommendations_paragraphs) > 2:
            recommendations_paragraphs = recommendations_paragraphs[:2]
        elif len(recommendations_paragraphs) < 2:
            if len(recommendations_paragraphs) == 1:
                # Try to split long paragraph in half
                para = recommendations_paragraphs[0]
                if len(para) > 300:
                    mid_point = len(para) // 2
                    split_point = para.find('. ', mid_point)
                    if split_point > 0:
                        recommendations_paragraphs = [para[:split_point + 1], para[split_point + 2:]]
                    else:
                        recommendations_paragraphs.append("Long-term monitoring and evaluation of implemented interventions should be established to ensure effectiveness.")
                else:
                    recommendations_paragraphs.append("Continuous assessment and improvement of student support services is essential for sustained positive outcomes.")
        
        return {
            'insights': insights_paragraphs,
            'recommendations': recommendations_paragraphs,
            'ai_generated': True
        }
        
    except Exception as e:
        print(f"Error generating enhanced insights: {str(e)}")
        return generate_fallback_insights(ai_themes, category_stats, total_sessions)

def generate_fallback_insights(ai_themes, category_stats, total_sessions):
    """Fallback insights when Gemini fails"""
    insights = []
    recommendations = []
    
    # Generate basic insights from the data
    if ai_themes:
        top_theme = ai_themes[0]
        insights.append(f"Analysis reveals that {top_theme.get('theme', 'student concerns')} represents the primary area of concern, with {top_theme.get('description', 'various issues affecting student welfare')}. This pattern indicates a need for targeted interventions in this area.")
    
    if category_stats:
        top_categories = sorted(category_stats.items(), key=lambda x: x[1].get('count', 0), reverse=True)[:2]
        if top_categories:
            cat1_name, cat1_data = top_categories[0]
            insights.append(f"The data shows {cat1_name} as the most prevalent concern category with {cat1_data.get('count', 0)} cases ({cat1_data.get('percentage', 0)}% of total), suggesting this area requires immediate attention and resource allocation.")
    
    # Generate basic recommendations
    if ai_themes and len(ai_themes) > 0:
        high_freq_themes = [theme for theme in ai_themes if theme.get('frequency') == 'high']
        if high_freq_themes:
            recommendations.append("Immediate implementation of specialized support programs targeting high-frequency concern areas is recommended, including counseling services, academic support workshops, and peer mentoring programs.")
    
    recommendations.append("Establishing a comprehensive student welfare monitoring system with regular assessment and feedback mechanisms will help in early identification and prevention of emerging concerns.")
    
    # Ensure we have exactly 2 paragraphs for each
    while len(insights) < 2:
        insights.append("Continued monitoring and analysis of student concerns will provide valuable insights for improving institutional support services.")
    
    while len(recommendations) < 2:
        recommendations.append("Long-term strategic planning should incorporate findings from student concern analysis to develop sustainable support systems and preventive measures.")
    
    return {
        'insights': insights[:2],
        'recommendations': recommendations[:2],
        'ai_generated': False
    }
