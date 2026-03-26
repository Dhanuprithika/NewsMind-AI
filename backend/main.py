import sys
from io import TextIOWrapper
from contextlib import asynccontextmanager

if sys.stdout.encoding != 'utf-8':
    assert isinstance(sys.stdout, TextIOWrapper)
    sys.stdout.reconfigure(encoding='utf-8')

import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import asyncio
from graph.workflow import graph, State

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="AI Newsroom API", lifespan=lifespan)

# Add CORS middleware to allow requests from the React frontend (usually running on port 5173 or 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Add your frontend origin here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsRequest(BaseModel):
    user_type: str = "student" # Default: student / teacher / investor / general

@app.post("/api/news")
async def generate_news(request: NewsRequest):
    """
    Generate personalised news based on user type.
    Options for user_type: 'student', 'teacher', 'investor', 'general'
    """
    try:
        # We invoke the graph with the initial state
        result = graph.invoke(State(
            user_type=request.user_type,
            articles=[],
            user_memory={},
            ranked_articles=[],
            final_output=[],
            daily_briefing=""
        ))

        # We format the response to match what the frontend might need
        return {
            "status": "success",
            "data": {
                "user_type_requested": request.user_type,
                "articles_found": len(result.get("articles", [])),
                "articles": result.get("articles", []),
                "user_memory": result.get("user_memory", {}),
                "ranked_articles": result.get("ranked_articles", []),
                "final_output": result.get("final_output", []),
                "daily_briefing": result.get("daily_briefing", "")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news/stream")
async def stream_news(user_type: str = "general"):
    """
    Step-by-step agentic execution.
    Each yield follows the LangGraph flow: Ingestion -> Analysis -> Memory -> Ranking -> Synthesis -> Output.
    """
    async def event_generator():
        try:
            initial_state = State(
                user_type=user_type,
                articles=[],
                user_memory={},
                ranked_articles=[],
                final_output=[],
                daily_briefing=""
            )

            print(f"\n--- [🤖 AGENTIC WORKFLOW STARTING FOR: {user_type.upper()}] ---")

            # Use graph.stream to get updates as each node completes
            for output in graph.stream(initial_state):
                for node_name, state_values in output.items():
                    # Format as progress update
                    payload = {
                        "agent": node_name,
                        "status": "completed",
                        "message": f"Agent '{node_name}' finished its task.",
                        "timestamp": asyncio.get_event_loop().time()
                    }
                    print(f"✅ [STREAM]: Node {node_name} finished.")
                    yield f"data: {json.dumps(payload)}\n\n"
                    
                    # Small delay for visual flow in terminal and output
                    await asyncio.sleep(0.5)

            yield f"data: {json.dumps({'status': 'finished', 'message': 'All intelligence agents have reported back.'})}\n\n"

        except Exception as e:
            print(f"❌ [ERROR]: {str(e)}")
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/news/semantic-search")
async def semantic_search(query: str, limit: int = 5, use_llm: bool = False):
    """
    Look for past news in our deep memory (SQLite + FAISS) using True Vector Semantic Search.
    Prioritizes meaning over exact semantic match.
    Pass `use_llm=true` to optionally re-rank the vector search results.
    """
    from agents.retrieval_agent import hybrid_search
    
    try:
        # Step 1 & 2: Vector embedding search + Optional LLM Reranking
        results = hybrid_search(query, top_k=limit, use_llm_rerank=use_llm)
        
        if not results:
            return {"status": "success", "query": query, "count": 0, "results": []}

        return {
            "status": "success",
            "query": query,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news/history")
async def get_history(limit: int = 20):
    """
    Get the latest intelligence from our archive.
    """
    import sqlite3
    from database.sqlite_db import DB_PATH
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM articles WHERE is_processed = 1 ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return {"status": "success", "history": [dict(row) for row in rows]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Simple endpoint to verify the API is running."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    # When running 'python backend/main.py', it starts on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
