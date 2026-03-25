import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def synthesis_agent(state):
    """
    Looks at all ranked articles and generates a unified, narrative-style 'Daily Briefing'.
    """
    ranked_articles = state.get("ranked_articles", [])
    user_type = state.get("user_type", "general")
    
    # Take the top 5 articles for synthesis
    top_articles = ranked_articles[:5]
    
    if not top_articles:
        state["daily_briefing"] = "No news available to synthesize."
        return state

    # Format articles for the prompt
    articles_text = ""
    for idx, article in enumerate(top_articles):
        articles_text += f"\n--- Article {idx+1}: {article.get('title')} ---\n"
        articles_text += f"Analysis: {json.dumps(article.get('analysis'), indent=2)}\n"
        articles_text += f"Text: {article.get('text')[:500]}...\n"

    prompt = f"""
You are a senior news editor for a premium intelligence platform.

Context: 
Below are the top news articles of the day, ranked by relevance for a {user_type}.

Articles for Synthesis:
{articles_text}

Task:
Generate a single, COHESIVE, and NARRATIVE 'Daily Briefing' for this {user_type}.

Guidelines:
1. Don't just list the articles. Connect the dots between them where possible.
2. If there's a common theme (e.g., market growth, policy changes), highlight it.
3. Tailor the tone for a {user_type}:
   - Investor: Focus on market trends, financial implications, and sector-wide effects.
   - Student: Provide a structured, informative summary with clear highlights.
   - Professional: Focus on strategic insights and actionable information.
   - General: Provide a balanced, engaging story of the day's major news.
4. Structure the briefing into logical sections (e.g., 'Market Landscape', 'Key Developments', 'The Bigger Picture').
5. Use professional and engaging language. Avoid generic summaries.

Return ONLY the final briefing text.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )

    briefing = response.choices[0].message.content.strip()
    
    state["daily_briefing"] = briefing
    
    return state
