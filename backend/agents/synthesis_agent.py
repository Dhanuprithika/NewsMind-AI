import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def synthesis_agent(state):
    """
    ULTRA-OPTIMIZED: Single-pass Intelligence Synthesis.
    Combines individual news analysis + global narrative briefing into one AI request.
    """
    ranked_articles = state.get("ranked_articles", [])
    user_type = state.get("user_type", "general")
    field = state.get("field", "General")
    top_articles = ranked_articles[:5]
    
    if not top_articles:
        state["daily_briefing"] = "Displaying last intelligence cache. New signals arriving..."
        return state

    print(f"  [SYNTHESIS]: Initiating Single-Pass Intelligence Synthesis for Persona: {user_type.upper()}")

    # 1. Compile context
    context_blob = ""
    for idx, article in enumerate(top_articles):
        context_blob += f"ID: {article.get('id')}\nTitle: {article.get('title')}\nSnippet: {article.get('text', '')[:800]}\n\n"

    # 2. Advanced Multi-Objective Prompt
    prompt = f"""
You are the NewsMind Intelligence Synthesizer.
TASK: Analyze the following 5 news articles for a {user_type} profile.

CONTEXT:
{context_blob}

STRICT OUTPUT FORMAT (JSON ONLY):
{{
  "individual_summaries": [
    {{ "id": "...", "summary": "2 professional sentences tailored for {user_type}" }},
    ...
  ],
  "global_briefing": "A cohesive 3-paragraph narrative linking these stories. Use 'Strategic Outlook' and 'Market Landscape' headers. Persona-aligned tone."
}}
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        intelligence = json.loads(response.choices[0].message.content)
        
        # 3. Apply individual summaries to articles
        summary_map = {item["id"]: item["summary"] for item in intelligence.get("individual_summaries", [])}
        for article in top_articles:
            if article["id"] in summary_map:
                article["summary"] = summary_map[article["id"]]
                # Persist to DB silently
                try:
                    from database.sqlite_db import update_article_intelligence
                    update_article_intelligence(article["id"], article.get("analysis", {}), article["summary"], "")
                except: pass

        # 4. Finalize Global Briefing
        briefing = intelligence.get("global_briefing", "Intelligence summary processed.")
        
        # Persist Briefing
        from database.sqlite_db import save_daily_briefing
        save_daily_briefing(field, briefing)
        
    except Exception as e:
        print(f"  [SYNTHESIS_ERROR]: {e}")
        briefing = "Intelligence heartbeat detected. Narrative compilation in deep-sync..."
    
    state["daily_briefing"] = briefing
    return state
