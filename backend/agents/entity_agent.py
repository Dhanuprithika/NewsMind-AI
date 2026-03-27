from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_article(article_text):
    print(f"  🧠 [ENTITY AGENT]: Analyzing linguistic density and market variables...")
    prompt = f"""
You are an AI financial news analyzer.

Extract:
- companies
- people
- sector (Business, Technology, Banking, Startups, Markets, World, Economy, Policy, or General)
- keywords
- sentiment (Positive, Negative, Neutral)
- topic (Policy, Earnings, Funding, Layoffs, etc.)
- urgency (High, Medium, Low)
- market_impact (High, Medium, Low)
- investor_relevance (High, Medium, Low)
- reasoning (short explanation)

Return ONLY valid JSON in this format:
{{
  "entities": [],
  "sector": "",
  "sentiment": "",
  "topic": "",
  "urgency": "",
  "market_impact": "",
  "investor_relevance": "",
  "reasoning": ""
}}

News:
{article_text}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        result = response.choices[0].message.content
    except Exception as e:
        if "429" in str(e):
            print("  ⚠️ [ENTITY]: Rate Limit Hit (429). Using baseline analysis.")
            return {
                "entities": [], "sector": "General", "sentiment": "Neutral", "topic": "General", "urgency": "Low",
                "market_impact": "Medium", "investor_relevance": "Medium", "reasoning": "Rate limit fallback."
            }
        raise e

    # 🔥 convert string → JSON safely
    try:
        parsed = json.loads(result)
        return {
            "entities": parsed.get("entities", []),
            "sector": parsed.get("sector", "General"),
            "sentiment": parsed.get("sentiment", "Unknown"),
            "topic": parsed.get("topic", "Unknown"),
            "urgency": parsed.get("urgency", "Unknown"),
            "market_impact": parsed.get("market_impact", "Unknown"),
            "investor_relevance": parsed.get("investor_relevance", "Unknown"),
            "reasoning": parsed.get("reasoning", "")
        }
    except Exception:
        return {
            "entities": [],
            "sector": "General",
            "sentiment": "Unknown",
            "topic": "Unknown",
            "urgency": "Unknown",
            "market_impact": "Unknown",
            "investor_relevance": "Unknown",
            "reasoning": "",
            "raw_output": result
        }