import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def llm_rank(article, memory):

    prompt = f"""
You are an intelligent business news recommendation system.

User Profile:
{json.dumps(memory, indent=2)}

Article Analysis:
{json.dumps(article.get("analysis", {}), indent=2)}

Task:
1. Score relevance from 1 to 10
2. Give a short explanation

Return ONLY JSON:
{{
  "score": number,
  "reason": "..."
}}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",  # fast + good
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    output = response.choices[0].message.content

    try:
        result = json.loads(output)
    except:
        result = {"score": 5, "reason": "Parsing failed"}

    return result


def ranking_agent(state):

    articles = state.get("articles", [])
    memory = state.get("user_memory", {})

    ranked_articles = []

    for article in articles:

        result = llm_rank(article, memory)

        article["score"] = result.get("score", 5)
        article["reason"] = result.get("reason", "")

        ranked_articles.append(article)

    # sort descending
    ranked_articles.sort(key=lambda x: x["score"], reverse=True)

    state["ranked_articles"] = ranked_articles

    return state