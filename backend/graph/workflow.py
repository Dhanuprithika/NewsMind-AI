from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Dict, Any
from agents.ingestion_agent import ingestion_agent
from agents.entity_agent import analyze_article
from agents.user_memory_agent import user_memory_agent
from agents.ranking_agent import ranking_agent
from agents.output_agent import output_agent   
from agents.synthesis_agent import synthesis_agent  # ⭐ NEW

# -------------------------------
# 🔹 Define State Schema
# -------------------------------
class State(TypedDict):
    user_type: str
    articles: List[Dict[str, Any]]
    user_memory: Dict[str, Any]
    ranked_articles: List[Dict[str, Any]]
    final_output: List[Dict[str, Any]]
    daily_briefing: str

# -------------------------------
# 🔹 Create Graph Builder
# -------------------------------
builder = StateGraph(State)

# -------------------------------
# 🔹 1. Ingestion Node
# -------------------------------
builder.add_node("ingestion", ingestion_agent)

# -------------------------------
# 🔹 2. Entity + Sentiment + Topic Node
# -------------------------------
def entity_analysis_node(state):

    articles = state.get("articles", [])
    enriched_articles = []

    for article in articles:

        text = article.get("text", "")

        if not text:
            enriched_articles.append({
                **article,
                "analysis": {
                    "entities": [],
                    "sentiment": "Unknown",
                    "topic": "Unknown"
                }
            })
            continue

        analysis = analyze_article(text)

        # Merge analysis into a new article dict explicitly to satisfy the linter
        new_article = article.copy()
        new_article["analysis"] = analysis
        enriched_articles.append(new_article)

    return {"articles": enriched_articles}

builder.add_node("entity_analysis", entity_analysis_node)

# -------------------------------
# 🔹 3. User Memory Node
# -------------------------------
def memory_node(state):

    articles = state.get("articles", [])

    for article in articles:
        analysis = article.get("analysis", {})
        
        # Pull from top level or from first item in entities list
        entities_list = analysis.get("entities", [])
        first_ent = entities_list[0] if (entities_list and isinstance(entities_list[0], dict)) else {}
        
        sector = analysis.get("sector") or first_ent.get("sector", "Unknown")
        topic = analysis.get("topic") or first_ent.get("topic", "Unknown")
        
        # Collect all companies mentioned in the entities list
        companies = []
        for ent in entities_list:
            if isinstance(ent, dict) and ent.get("company"):
                companies.append(ent.get("company"))

        article["entities"] = {
            "sector": sector,
            "topic": topic,
            "companies": companies
        }

        article["sentiment"] = analysis.get("sentiment", "Unknown")

    # Update state and pass to memory agent
    result_state = user_memory_agent(state)
    return result_state

builder.add_node("memory", memory_node)

# -------------------------------
# 🔹 4. Ranking Node (Groq LLM)
# -------------------------------
def ranking_node(state):
    print(f"DEBUG: Ranking {len(state.get('articles', []))} articles...")
    return ranking_agent(state)

builder.add_node("ranking", ranking_node)

# -------------------------------
# 🔹 5. Synthesis Node (NEW)
# -------------------------------
builder.add_node("synthesis", synthesis_agent)  # ⭐ NEW

# -------------------------------
# 🔹 6. Output Generator Node
# -------------------------------
builder.add_node("output", output_agent)

# -------------------------------
# 🔹 7. Define Flow
# -------------------------------
builder.set_entry_point("ingestion")

builder.add_edge("ingestion", "entity_analysis")
builder.add_edge("entity_analysis", "memory")
builder.add_edge("memory", "ranking")
builder.add_edge("ranking", "synthesis")   # ⭐ UPDATED
builder.add_edge("synthesis", "output")    # ⭐ UPDATED
builder.add_edge("output", END)         

# -------------------------------
# 🔹 8. Compile Graph
# -------------------------------
graph = builder.compile()
