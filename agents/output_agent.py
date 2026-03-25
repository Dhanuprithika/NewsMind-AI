import os
import json
import re
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_summary(article, user_type):

    prompt = f"""
You are a professional business news analyst.

Article:
{article.get("text")}

User Type: {user_type}

Task:
Generate a DETAILED and structured summary of this article.

Structure:
1. What happened
2. Why it happened
3. Impact (on market, companies, or people)

Instructions:
- Minimum 6–8 sentences
- Include key facts, numbers, and context
- Explain clearly and logically
- Do NOT make it short
- Do NOT include JSON or formatting symbols in output

Adapt style based on user:
- Student → simple but detailed
- Teacher → conceptual and structured
- Investor → include financial and market impact
- General → balanced explanation

Return ONLY the summary text (NOT JSON).
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )

    output = response.choices[0].message.content.strip()

    # 🔥 CLEAN ANY JSON / SYMBOLS IF MODEL STILL RETURNS THEM
    try:
        # Remove accidental JSON blocks if any
        if output.startswith("{") and "summary" in output:
            parsed = json.loads(output)
            return parsed.get("summary", "").strip()

        # Remove backticks or formatting
        output = re.sub(r"^```.*?\n", "", output)
        output = re.sub(r"```$", "", output)

        return output.strip()

    except Exception:
        return output.strip()


def output_agent(state):

    articles = state.get("ranked_articles", [])
    user_type = state.get("user_type", "general")

    final_output = []

    for article in articles[:5]:

        summary = generate_summary(article, user_type)

        article["summary"] = summary

        final_output.append(article)

    state["final_output"] = final_output

    return state