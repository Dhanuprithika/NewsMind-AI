import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_video_script(content_type, content, persona="general", user_interests=None):
    """
    The video intelligence layer: Transforms news briefings into production-ready 16:9 landscape news explainers.
    """
    
    is_reel = content_type == 'reel'
    target_duration = 60 if is_reel else 120
    video_type = "news_explainer" if is_reel else "intelligence_briefing"
    
    prompt = f"""
You are the video intelligence layer for a premium, AI-native news intelligence platform.
Your task is to convert a synthesized news briefing into a production-ready 16:9 LANDSCAPE news explainer video plan.

GOAL
Generate a {target_duration}-second {video_type.replace('_', ' ')} for the following content.

CONTENT TO TRANSFORM:
{content}

AUDIENCE PERSONALIZATION
- User Persona: {persona}
- Sector Interests: {user_interests or "General"}

VIDEO STYLE
- Format: Professional 16:9 LANDSCAPE (NOT vertical)
- Premium, Bloomberg-style, editorial
- Newsroom explainer format
- Intelligence-first storytelling

SCRIPT RULES
- Use authoritative, spoken narration (sharp, clear, no filler).
- Every scene must move the story forward.
- Captions must be visually professional (2 to 4 words only).

SCENE RULES
- For 60s explainer: 6 to 8 scenes (6-10s each).
- For 120s briefing: 10 to 14 scenes (7-12s each).

VISUAL RULES
- Search prompts must be concrete for 16:9 LANDSCAPE media retrieval.
- Rule of Thirds design: Visuals must have room for clean text overlays on the margins.
- Examples: panoramic city skylines, wide trading floors, factory lines, macro charts on safe backgrounds.
- If no suitable stock footage likely exists, specify visual_type = "motion_graphic" or "headline_card".

JSON SCHEMA (STRICT):
{{
  "video_type": "{video_type}",
  "target_duration_seconds": {target_duration},
  "audience_profile": {{
    "persona": "{persona}",
    "interests": {json.dumps(user_interests or [])},
    "tone_preference": "professional"
  }},
  "hook_line": "...",
  "video_summary": "...",
  "full_voiceover_script": "...",
  "scenes": [
    {{
      "scene_number": 1,
      "duration_seconds": 8,
      "scene_goal": "...",
      "caption_text": "...",
      "emotional_tone": "...",
      "voiceover_line": "...",
      "visual_type": "...",
      "visual_concept": "...",
      "visual_search_prompt": "...",
      "on_screen_layout": "lower_third or side_safe",
      "transition_style": "fade or smooth_cut"
    }}
  ]
}}

HARD CONSTRAINTS:
- Return valid JSON only.
- No markdown, no explanations.
- Orientation: 16:9 LANDSCAPE ONLY.
- Captions <= 4 words.
- Total duration {target_duration} ± 5 seconds.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error in video intelligence layer: {e}")
        # Fallback
        try:
           response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.7
            )
           return json.loads(response.choices[0].message.content)
        except:
            return {"error": "Intelligence signal lost. Connection timeout."}

if __name__ == "__main__":
    test_summary = "Oil prices surged 5% today as tensions in the Middle East escalated, raising fears of supply disruptions. Analysts warn that continued volatility could impact global inflation targets."
    print(json.dumps(generate_video_script('reel', test_summary), indent=2))
