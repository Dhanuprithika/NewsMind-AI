from groq import Groq
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_article(article_text):
    prompt = f"""
You are an AI financial news analyzer.

Extract:
- companies
- people
- sector
- keywords
- sentiment (Positive, Negative, Neutral)
- topic (Policy, Earnings, Funding, Layoffs)
- urgency (High, Medium, Low)
- market_impact (High, Medium, Low)
- investor_relevance (High, Medium, Low)
- reasoning (short explanation)

Return ONLY valid JSON in this format:
{{
  "entities": [],
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

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    result = response.choices[0].message.content

    # 🔥 convert string → JSON safely
    try:
        parsed = json.loads(result)
        return {
            "entities": parsed.get("entities", []),
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
            "sentiment": "Unknown",
            "topic": "Unknown",
            "urgency": "Unknown",
            "market_impact": "Unknown",
            "investor_relevance": "Unknown",
            "reasoning": "",
            "raw_output": result
        }