import os
import json
import re
import time
from groq import Groq
from backend.database.sqlite_db import update_article_intelligence

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
    print(f"\n[🎬 OUTPUT AGENT]: Finalizing intelligence packages (Persisting to Deep Memory)...")
    
    articles = state.get("ranked_articles", [])
    user_type = state.get("user_type", "general")
    final_output = []

    for i, article in enumerate(articles[:5]):
        print(f"  🧠 [ARCHIVE]: Saving Intelligence for: {article.get('title')[:40]}...")
        
        # 1. Generate core content
        summary, script = generate_article_package(article, user_type)
        article["summary"] = summary
        article["video_script"] = script
        
        # 2. Update Article metadata in SQLite Database (Persistent Storage)
        article_id = article.get("link", article.get("id"))
        update_article_intelligence(
            article_id=article_id,
            analysis=article.get("analysis", {}),
            summary=summary,
            video_script=script
        )
        
        final_output.append(article)
        time.sleep(0.5)

    state["final_output"] = final_output
    print("[🎬 OUTPUT AGENT]: Deep Memory Sync COMPLETE.")
    return state