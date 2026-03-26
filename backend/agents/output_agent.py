import os
import json
import re
import time
from groq import Groq

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

Rules:
- Professional tone.
- No meta-commentary.
- No markdown inside strings.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        # Groq returns a specialized response for JSON mode
        res_data = json.loads(response.choices[0].message.content)
        return res_data.get("summary"), res_data.get("video_script")
    
    except Exception as e:
        print(f"  ⚠️ Warning: Intelligence extraction failed for an article. Root cause: {e}")
        return "Summary generation skipped due to rate limit constraints.", "Video script generated manually is required."

def output_agent(state):
    print(f"\n[🎬 OUTPUT AGENT]: Finalizing intelligence packages (Combined Single-Call mode to avoid Rate Limits)...")
    
    articles = state.get("ranked_articles", [])
    user_type = state.get("user_type", "general")
    final_output = []

    # Limit to top 5 articles
    for i, article in enumerate(articles[:5]):
        print(f"  📝 [LOG]: Synthesizing Package (Summary + Script) for Article {i+1}: {article.get('title')[:30]}...")
        
        # 1. Combined call saves 50% on API requests and tokens
        summary, script = generate_article_package(article, user_type)
        
        article["summary"] = summary
        article["video_script"] = script
        
        # Metadata for future video team's integration
        article["video_status"] = "pending_synthesis"
        article["video_url"] = None

        final_output.append(article)
        
        # Short sleep to prevent TPM (Tokens per Minute) spikes
        time.sleep(0.5)

    state["final_output"] = final_output
    print("[🎬 OUTPUT AGENT]: Processing complete. System fully operational.")

    return state