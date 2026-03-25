from langgraph.graph import StateGraph, END
from agents.ingestion_agent import ingestion_agent
from agents.entity_agent import analyze_article
from agents.user_memory_agent import user_memory_agent
from agents.ranking_agent import ranking_agent
from agents.output_agent import output_agent   
from agents.synthesis_agent import synthesis_agent  # ⭐ NEW

# -------------------------------
# 🔹 Create Graph Builder
# -------------------------------
builder = StateGraph(dict)

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

        enriched_articles.append({
            **article,
            "analysis": analysis
        })

    return {"articles": enriched_articles}

builder.add_node("entity_analysis", entity_analysis_node)

# -------------------------------
# 🔹 3. User Memory Node
# -------------------------------
def memory_node(state):

    articles = state.get("articles", [])

    for article in articles:
        analysis = article.get("analysis", {})

        article["entities"] = {
            "sector": analysis.get("sector"),
            "topic": analysis.get("topic"),
            "companies": analysis.get("companies", [])
        }

        article["sentiment"] = analysis.get("sentiment")

    return user_memory_agent(state)

builder.add_node("memory", memory_node)

# -------------------------------
# 🔹 4. Ranking Node (Groq LLM)
# -------------------------------
builder.add_node("ranking", ranking_agent)

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
