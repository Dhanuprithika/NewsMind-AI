import os
import json
import asyncio
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

async def localize_article(title, content, target_language):
    """
    JSON-ONLY API Engine for Vernacular News.
    Strictly returns parsable JSON with zero markdown or external text.
    """
    
    system_prompt = """
You are a JSON-only API engine.

Your task is to return STRICTLY VALID JSON.

You are NOT allowed to output anything except JSON.

---

## INPUT

* title (string)
* content (string)
* target_language (Hindi, Tamil, Telugu, Bengali)

---

## TASK

Convert the article into a simplified, localized explanation in the target language.

---

## CRITICAL RULES

* Output ONLY JSON

* DO NOT include markdown (no ```json)

* DO NOT include explanations

* DO NOT include text before or after JSON

* DO NOT include comments

* JSON MUST be valid (parsable using json.loads)

* Use ONLY double quotes (")

* No trailing commas

* All fields MUST exist

---

## OUTPUT FORMAT

{
"language": "<target_language>",
"translated_title": "<text>",
"translated_summary": "<text>",
"key_points": [
"<point>",
"<point>",
"<point>"
],
"local_context": "<text>",
"reader_impact": "<text>",
"glossary": [
{
"term": "<term>",
"meaning": "<meaning>"
}
]
}

---

## FAILSAFE

If you cannot fully process the request:
RETURN this exact JSON:

{
"language": "error",
"translated_title": "Error",
"translated_summary": "Processing failed",
"key_points": [],
"local_context": "",
"reader_impact": "",
"glossary": []
}
"""

    user_input = f"""
INPUT
-----------------------------------
title: {title}
content: {content}
target_language: {target_language}
"""

    models = ["llama-3.1-8b-instant", "llama3-8b-8192", "gemma2-9b-it", "mixtral-8x7b-32768"]
    last_err = None

    for model_name in models:
        try:
            print(f"  [API ENGINE]: Generating {target_language} JSON with {model_name}...")
            response = await client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            
            raw_content = response.choices[0].message.content.strip()
            
            # Failsafe: strip any unexpected markdown
            if raw_content.startswith("```"):
                raw_content = raw_content.split("\n", 1)[1].rsplit("\n", 1)[0].replace("json", "").strip()
            
            localized_data = json.loads(raw_content)
            return localized_data
            
        except Exception as e:
            last_err = e
            print(f"  [API ENGINE FAIL]: {model_name} failed. Detail: {str(e)[:100]}")
            continue

    print(f"  [API ENGINE CRITICAL]: All models failed. Returning Failsafe JSON.")
    return {
        "language": "error",
        "translated_title": "Error",
        "translated_summary": f"Processing failed: {str(last_err)[:50]}",
        "key_points": [],
        "local_context": "",
        "reader_impact": "",
        "glossary": []
    }
