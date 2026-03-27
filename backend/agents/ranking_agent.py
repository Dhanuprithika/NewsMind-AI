import os
import json
import time
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def llm_rank(article, memory):
    try:
        # Respect tiny API rate limits on free tier
        time.sleep(1) 
        
        prompt = f"""
You are an intelligent news recommendation system.
User Profile: {json.dumps(memory, indent=2)}
Article Analysis: {json.dumps(article.get("analysis", {}), indent=2)}

Task:
1. Score relevance (1-10) for THIS user profile.
2. Give a short reason.

Return JSON:
{{ "score": number, "reason": "..." }}
"""
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        if "429" in str(e):
            print(f"  [RANK_THROTTLE]: Rate limit hit. Baseline score assigned.")
            return {"score": 5, "reason": "API busy."}
        return {"score": 5, "reason": "Fallback."}


def ranking_agent(state):
    articles = state.get("articles", [])
    memory = state.get("user_memory", {})
    sector = state.get("field", "General")
    
    # ⭐ SPEED OPTIMIZATION: Check if we have enough intelligence in cache 
    processed_count = sum(1 for a in articles if a.get("rank_score") and a.get("rank_score") > 7)
    if processed_count >= 5:
        print(f"  [RANKING]: High-intensity intelligence found in cache. Skipping LLM pass.")
        state["ranked_articles"] = sorted(articles, key=lambda x: x.get("rank_score", 5), reverse=True)
        return state

    ranked_articles = []
    # Rank ONLY the top 5 articles to keep it blazing fast
    for i, article in enumerate(articles):
        if i < 5 and not article.get("rank_score"):
            print(f"  [RANKING]: Deep-ranking '{article.get('title')[:30]}...'")
            result = llm_rank(article, memory)
            article["rank_score"] = result.get("score", 5)
            article["rank_reason"] = result.get("reason", "")
        elif not article.get("rank_score"):
            article["rank_score"] = 5
            article["rank_reason"] = "Secondary intelligence signal."
            
        ranked_articles.append(article)

    ranked_articles.sort(key=lambda x: x.get("rank_score", 5), reverse=True)
    state["ranked_articles"] = ranked_articles
    return state