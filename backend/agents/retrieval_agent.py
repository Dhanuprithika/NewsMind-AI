import os
import json
from groq import Groq

# Import vector store and sqlite functions to use math instead of LLM prompts
from database.vector_store import vector_store
from database.sqlite_db import get_articles_by_ids, search_articles

client = Groq(api_key=os.getenv("GROQ_API_KEY", "dummy_key")) if os.getenv("GROQ_API_KEY") else None

def hybrid_search(user_query: str, top_k: int = 5, use_llm_rerank: bool = False):
    """
    Performs true semantic retrieval using mathematical embeddings.
    No hardcoded synonyms (Oil=Petroleum etc) are used. The vectors inherently understand meaning. 
    Optionally re-ranks the fetched results using an LLM.
    """
    print(f"\n[🧠 SEMANTIC SEARCH]: Looking for: '{user_query}'...")

    # 1. Vector Search using FAISS math
    vectors_results = vector_store.search(user_query, top_k=15)
    
    if vectors_results:
        article_ids = [res["article_id"] for res in vectors_results]
        print(f"  -> Found {len(article_ids)} semantic matches in FAISS.")
        
        # 2. Fetch full SQLite rows containing all categories dynamically
        candidates = get_articles_by_ids(article_ids)
    else:
        # 1b. Fallback to Keyword Search if FAISS vectors are missing
        print(f"  ⚠️ [WARNING]: FAISS empty/no results. Falling back to keyword search.")
        candidates = search_articles(user_query, limit=15)
        
    if not candidates:
        return []

    # 3. Optional LLM Reranking
    if use_llm_rerank and client:
        return llm_rerank(user_query, candidates)[:top_k]
        
    return candidates[:top_k]

def llm_rerank(user_query, article_candidates):
    """
    Given top ~15 semantic matches from all categories, this ensures the top 5 are perfectly ordered.
    """
    print(f"  [🔄 LLM RERANKING]: Re-evaluating top {len(article_candidates)} semantic matches...")

    # We dynamically pass the fetched titles. No hardcoded synonyms needed.
    articles_text = ""
    for idx, art in enumerate(article_candidates):
        articles_text += f"[{idx}] {art.get('title')}\n"

    prompt = f"""
You are a precision relevance scorer.
Given the User's Query and a pre-filtered list of Candidate News Titles:
Query: "{user_query}"

Candidate News List:
{articles_text}

Task:
Select the top most relevant articles dynamically based on category/meaning. 
Return ONLY a JSON array of their indexes, ordered from most relevant to least.
Example: [2, 0, 7]
"""
    try:
        if not client:
            raise ValueError("Groq API client not initialized. Check GROQ_API_KEY environment variable.")
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            response_format={"type": "json_object"} if "llama-3.1" in "llama-3.1-8b-instant" else None 
        )
        
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from LLM")
        content = content.strip()
        data = json.loads(content)
        
        if isinstance(data, list):
            indexes = data
        elif isinstance(data, dict):
            indexes = data.get("indexes", list(data.values())[0])
        else:
            indexes = []

        relevant_articles = []
        seen = set()
        for i in indexes:
            if i < len(article_candidates) and i not in seen:
                relevant_articles.append(article_candidates[i])
                seen.add(i)
                
        for i, art in enumerate(article_candidates):
            if i not in seen:
                relevant_articles.append(art)
                
        return relevant_articles

    except Exception as e:
        print(f"  ⚠️ [ERROR]: LLM Re-ranking validation failed. Returning FAISS base order.")
        return article_candidates
