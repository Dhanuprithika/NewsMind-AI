import os
import json
from groq import Groq

# Import vector store and sqlite functions
try:
    from backend.database.vector_store import vector_store
    from backend.database.sqlite_db import get_articles_by_ids, search_articles
except ImportError:
    from database.vector_store import vector_store
    from database.sqlite_db import get_articles_by_ids, search_articles

client = Groq(api_key=os.getenv("GROQ_API_KEY", "dummy_key")) if os.getenv("GROQ_API_KEY") else None

def hybrid_search(user_query: str, top_k: int = 5, use_llm_rerank: bool = False):
    """
    Performs true semantic retrieval using embeddings.
    If FAISS index is empty, gracefully falls back to keyword search.
    Optionally re-ranks the fetched results using an LLM.
    """
    print(f"\n[🧠 SEMANTIC SEARCH]: Looking for: '{user_query}'...")

    # 1. Vector Search using FAISS
    vectors_results = vector_store.search(user_query, top_k=15) # Fetch more for optional reranking
    
    if vectors_results:
        # Extract order-preserving IDs
        article_ids = [res["article_id"] for res in vectors_results]
        print(f"  -> Found {len(article_ids)} semantic matches in FAISS.")
        
        # 2. Fetch full SQLite rows 
        # get_articles_by_ids preserves the FAISS distance order
        candidates = get_articles_by_ids(article_ids)
    else:
        # 1b. Fallback to Keyword Search if FAISS is not yet populated
        print(f"  ⚠️ [WARNING]: FAISS empty/no results. Falling back to keyword search.")
        candidates = search_articles(user_query, limit=15)
        
    if not candidates:
        return []

    # 3. Optional LLM Reranking (Only as a SECOND stage)
    if use_llm_rerank and client.api_key:
        return llm_rerank(user_query, candidates)[:top_k]
        
    return candidates[:top_k]

def llm_rerank(user_query, article_candidates):
    """
    Strictly used as a second-stage re-ranker, NOT a primary retriever.
    Given top ~15 semantic matches, this ensures the top 5 are perfectly aligned 
    with nuanced context of the query.
    """
    print(f"  [🔄 LLM RERANKING]: Re-evaluating top {len(article_candidates)} matches...")

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
Select the top most relevant articles. Return ONLY a JSON array of their indexes, ordered from most relevant to least.
Example: [2, 0, 7]
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            response_format={"type": "json_object"} if "llama-3.1" in "llama-3.1-8b-instant" else None 
        )
        
        content = response.choices[0].message.content.strip()
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
                
        # Append remaining candidates at the end so we don't drop semantic matches
        for i, art in enumerate(article_candidates):
            if i not in seen:
                relevant_articles.append(art)
                
        return relevant_articles

    except Exception as e:
        print(f"  ⚠️ [ERROR]: LLM Re-ranking validation failed. Returning FAISS base order. Details: {e}")
        return article_candidates
