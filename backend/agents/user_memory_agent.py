import json
import os
import sqlite3
from datetime import datetime

MEMORY_FILE = os.path.join(os.path.dirname(__file__), "..", "user_memory.json")

def get_empty_memory():
    return {
        "sector_interest": {},
        "topic_interest": {},
        "company_interest": {},
        "sentiment_preference": {},
        "last_updated": datetime.now().isoformat()
    }

def load_memory():
    if not os.path.exists(MEMORY_FILE):
        return get_empty_memory()
    try:
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)
    except:
        return get_empty_memory()

def save_memory(memory):
    memory["last_updated"] = datetime.now().isoformat()
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=2)

def signal_learning(signal_type: str, article_id: str):
    """Processes a discrete user action (click, bookmark) to update memory."""
    from database.sqlite_db import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    article = conn.execute("SELECT sector, summary FROM articles WHERE id = ?", (article_id,)).fetchone()
    conn.close()

    if not article: return

    memory = load_memory()
    weight = 5 if signal_type == "bookmark" else 1
    if signal_type == "time_spent": weight = 2

    # Update sector weight
    sector = article["sector"]
    if sector:
        memory["sector_interest"][sector] = memory["sector_interest"].get(sector, 0) + weight

    save_memory(memory)
    print(f"  [MEMORY]: Reinforced '{sector}' with +{weight} via {signal_type}")

def user_memory_agent(state):
    """Batch updates memory during the orchestration graph run."""
    memory = load_memory()
    articles = state.get("articles", [])

    for article in articles:
        entities = article.get("entities", {})
        sector = entities.get("sector")
        # During a passive crawl, we only nudge the memory (+0.1) unless clicked
        if sector:
            memory["sector_interest"][sector] = memory["sector_interest"].get(sector, 0) + 0.1

    save_memory(memory)
    state["user_memory"] = memory
    return state