import os
import json
import re
import time
from groq import Groq
from database.sqlite_db import update_article_intelligence

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_article_package(article, user_type):
    """
    Generates BOTH a summary and a video script in ONE call to avoid rate limits.
    """
    prompt = f"""
You are a senior news anchor and business analyst. 

Context: 
Article Title: {article.get('title')}
Article Text: {article.get('text')}

User Type: {user_type}

Task:
Generate two specific pieces of content for this article:
1. "summary": A detailed 6-10 sentence business summary focused on What Happened, Why, and the Impact.
2. "video_script": A high-energy, authoritative 30-45 second AI Video Script for a news anchor targeting a {user_type}.

Return your response in EXACT JSON format with these keys:
"summary": "the summary text...",
"video_script": "the anchor script text..."
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        res_data = json.loads(response.choices[0].message.content)
        return res_data.get("summary"), res_data.get("video_script")
    except Exception as e:
        return "Summary generation skipped.", "Video script unavailable."

def output_agent(state):
    """
    Finalize the intelligence package for the dashboard.
    For token economy, we no longer generate per-article deep summaries here.
    Summaries are now generated on-demand when 'Read More' is clicked.
    """
    print(f"\n[🎬 OUTPUT AGENT]: Reporting final dashboard intelligence...")
    
    articles = state.get("ranked_articles", [])
    briefing = state.get("daily_briefing", "")
    
    # We still want to ensure those articles are available in deep memory
    # but they should have been persisted in the Entity Node already.
    final_output = articles[:10]  # Show top 10 ranked articles

    state["final_output"] = final_output
    print("[🎬 OUTPUT AGENT]: Deep Memory Sync COMPLETE.")
    return state