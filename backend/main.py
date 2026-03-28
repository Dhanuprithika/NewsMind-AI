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
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

from graph.workflow import graph, State
from agents.video_script_agent import generate_video_script

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="AI Newsroom API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SaveRequest(BaseModel):
    article_id: str
    user_id: str = "default_user"

class ProfileRequest(BaseModel):
    user_id: str = "default_user"
    user_type: str
    interests: list
    preferred_sectors: list

# 🔥 GLOBAL PIPELINE REGISTRY (To avoid performance degradation)
RUNNING_PIPELINES = set()
LAST_RUN_TIMES = {}

async def run_intelligence_pipeline(field: str, user_type: str):
    pipeline_key = (field, user_type)
    
    # 🌟 COOLDOWN: Don't run if updated in last 5 minutes to save token quota
    from datetime import datetime, timedelta
    last_run = LAST_RUN_TIMES.get(pipeline_key)
    if last_run and (datetime.now() - last_run) < timedelta(minutes=5):
        return

    if pipeline_key in RUNNING_PIPELINES:
        return # Skip if already in deep-processing mode
        
    RUNNING_PIPELINES.add(pipeline_key)
    try:
        from database.sqlite_db import get_user_profile
        user_profile = get_user_profile(user_type)
        user_memory = {
            "user_type": (user_profile or {}).get("user_type", user_type),
            "interests": (user_profile or {}).get("interests", []),
            "preferred_sectors": (user_profile or {}).get("preferred_sectors", [])
        }
        await graph.ainvoke(State(
            user_type=user_type, field=field, articles=[], user_memory=user_memory,
            ranked_articles=[], final_output=[], daily_briefing=""
        ))
        LAST_RUN_TIMES[pipeline_key] = datetime.now()
        print(f"  [MAIN]: Background intelligence pipeline for '{field}' completed.")
    except Exception as e:
        print(f"  [PIPELINE_ERROR]: {e}")
    finally:
        if pipeline_key in RUNNING_PIPELINES:
            RUNNING_PIPELINES.remove(pipeline_key)


@app.get("/api/news")
async def get_news(field: str = "General", user_type: str = "general", timeframe: str = "all"):
    from database.sqlite_db import get_latest_news, get_user_profile
    import asyncio
    from datetime import datetime, timedelta
    try:
        # 1. TIME-TRAVEL FILTERING LOGIC
        time_filter = None
        if timeframe.lower() == "today":
            time_filter = datetime.now().strftime("%Y-%m-%d 00:00:00")
        elif timeframe.lower() == "yesterday":
            time_filter = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d 00:00:00")
        elif timeframe.lower() == "week":
            time_filter = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d 00:00:00")
        elif timeframe.lower() == "month":
            time_filter = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d 00:00:00")

        # 2. IMMEDIATE DATA RETRIEVAL (History-Aware)
        articles = get_latest_news(limit=50, sector=field, after_timestamp=time_filter)
        
        # 2. Sync Ingestion check
        if not articles:
            print(f"  [MAIN]: DB empty for {field}. Sync RSS pull initiated.")
            from agents.ingestion_agent import ingestion_agent
            temp_state = {"field": field, "articles": []}
            result = ingestion_agent(temp_state)
            articles = result.get("articles", [])
            status_msg = "Initial intelligence sync completed."
        else:
            status_msg = "Displaying high-confidence intelligence cache."
        
        # 3. CATEGORY AGGREGATION
        # Initialize with empty lists to prevent frontend undefined errors
        cats = {
            "business": [], "world": [], "startups": [], "banking": [], "economy": [], "tech": []
        }

        # If we are on 'General', we want real category data, not just filtered 'General' feed
        if field.lower() == "general":
            # Update RSS_MAPPING with the new World URL
            from agents.ingestion_agent import RSS_MAPPING
            RSS_MAPPING["World"] = "https://economictimes.indiatimes.com/news/international/rssfeeds/858478126.cms"
            
            cats["business"] = get_latest_news(limit=8, sector="Business")
            cats["world"] = get_latest_news(limit=8, sector="World")
            cats["startups"] = get_latest_news(limit=8, sector="Startups")
            cats["banking"] = get_latest_news(limit=8, sector="Banking")
            cats["economy"] = get_latest_news(limit=8, sector="Economy")
            cats["tech"] = get_latest_news(limit=8, sector="Technology")
        else:
            def filter_cat(cat):
                return [a for a in articles if (a.get("sector") or "").lower() == cat.lower()]
            
            cats["business"] = filter_cat("Business")[:8]
            cats["tech"] = filter_cat("Technology")[:8]
            cats["banking"] = filter_cat("Banking")[:8]
            cats["startups"] = filter_cat("Startups")[:8]
            cats["world"] = filter_cat("World")[:8]
            cats["economy"] = filter_cat("Economy")[:8]

        # 4. BACKGROUND INTELLIGENCE (Always trigger to keep cache fresh)
        asyncio.create_task(run_intelligence_pipeline(field, user_type))

        # ⭐ REFINED: Get actual generated multi-article synthesis
        from database.sqlite_db import get_latest_briefing
        actual_briefing = get_latest_briefing(field)
        final_briefing = actual_briefing if actual_briefing else status_msg

        return {
            "status": "success",
            "data": {
                "briefing": final_briefing,
                "insight": "AI processing signal detected. Deep analysis will appear in detail view.",
                "recommended": articles[:3],
                "categories": cats,
                "articles": articles
            }
        }
    except Exception as e:
        print(f"Error in get_news: {e}")
        # Always return all keys to prevent frontend 'undefined' crashes
        empty_cats = {"business": [], "world": [], "startups": [], "banking": [], "economy": [], "tech": []}
        return {
            "status": "success",
            "data": {"briefing": "Syncing signal...", "insight": "", "recommended": [], "categories": empty_cats, "articles": []}
        }

@app.get("/api/news/video-script/reel/{article_id:path}")
async def get_reel_script(article_id: str, user_type: str = "general"):
    from database.sqlite_db import get_articles_by_ids
    article_id = decode_url_id(article_id)
    try:
        articles = get_articles_by_ids([article_id])
        if not articles:
            raise HTTPException(status_code=404, detail="Article not found")
        
        article = articles[0]
        # Use existing summary if available, else use text
        content = article.get("summary") or article.get("text")[:1000]
        
        # Get user profile for personalization
        from database.sqlite_db import get_user_profile
        user_profile = get_user_profile(user_type)
        interests = (user_profile or {}).get("interests", [])
        
        script = generate_video_script('reel', content, user_type, user_interests=interests)
        
        # Enrich script with Pexels visual URLs
        from utils.pexels_helper import fetch_pexels_video
        for scene in script.get("scenes", []):
            if "visual_search_prompt" in scene:
                scene["visual_url"] = fetch_pexels_video(scene["visual_search_prompt"])
        
        return {"status": "success", "script": script}
    except Exception as e:
        print(f"Error in get_reel_script: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news/video-script/briefing/{field}")
async def get_briefing_script(field: str, user_type: str = "general"):
    from database.sqlite_db import get_latest_briefing
    try:
        briefing = get_latest_briefing(field)
        if not briefing:
            raise HTTPException(status_code=404, detail="Briefing not found for this sector")
        
        # Get user profile for personalization
        from database.sqlite_db import get_user_profile
        user_profile = get_user_profile(user_type)
        interests = (user_profile or {}).get("interests", [])
        
        script = generate_video_script('briefing', briefing, user_type, user_interests=interests)
        
        # Enrich script with Pexels visual URLs
        from utils.pexels_helper import fetch_pexels_video
        for scene in script.get("scenes", []):
            if "visual_search_prompt" in scene:
                scene["visual_url"] = fetch_pexels_video(scene["visual_search_prompt"])
        
        return {"status": "success", "script": script}
    except Exception as e:
        print(f"Error in get_briefing_script: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from sse_starlette.sse import EventSourceResponse

class ActivityPayload(BaseModel):
    signal_type: str # 'click', 'bookmark', 'time_spent'
    article_id: str

@app.post("/api/user/activity")
async def log_activity(payload: ActivityPayload):
    """
    Learns from user interactions to refine the intelligence profile.
    """
    from agents.user_memory_agent import signal_learning
    try:
        signal_learning(payload.signal_type, payload.article_id)
        return {"status": "success", "message": f"Signal '{payload.signal_type}' ingested."}
    except Exception as e:
        print(f"Error in log_activity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news/stream")
async def stream_news(field: str = "General", user_type: str = "general"):
    """
    SSE endpoint to push real-time news updates to the frontend.
    """
    async def news_generator(field: str, user_type: str):
        from database.sqlite_db import get_user_profile, get_latest_news
        try:
            user_profile = get_user_profile(user_type)
            user_memory = {
                "user_type": (user_profile or {}).get("user_type", user_type),
                "interests": (user_profile or {}).get("interests", []),
                "preferred_sectors": (user_profile or {}).get("preferred_sectors", [])
            }

            existing = get_latest_news(limit=20, sector=field)
            if len([a for a in existing if a.get('is_processed')]) >= 3:
                yield f"data: {json.dumps({'agent': 'cache', 'status': 'completed', 'message': 'Instant Intelligence Cache Hit.'})}\n\n"
                await asyncio.sleep(0.5)
                yield f"data: {json.dumps({'status': 'finished', 'message': 'Displaying last intelligence report.'})}\n\n"
                return

            initial_state = State(
                user_type=user_type,
                field=field,
                articles=[],
                user_memory=user_memory,
                ranked_articles=[],
                final_output=[],
                daily_briefing=""
            )

            # Use astream for async graph iteration
            async for output in graph.astream(initial_state):
                for node_name, state_values in output.items():
                    payload = {
                        "agent": node_name,
                        "status": "completed",
                        "message": f"Agent '{node_name}' finished its task.",
                        "timestamp": asyncio.get_event_loop().time()
                    }
                    yield f"data: {json.dumps(payload)}\n\n"
                    await asyncio.sleep(0.5)

            yield f"data: {json.dumps({'status': 'finished', 'message': 'All intelligence agents have reported back.'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"

    return EventSourceResponse(news_generator(field, user_type))

@app.get("/api/news/stream/{article_id:path}")
async def stream_article_intel(article_id: str):
    article_id = decode_url_id(article_id)
    async def event_generator():
        from database.sqlite_db import get_articles_by_ids, update_article_intelligence
        from agents.entity_agent import analyze_article
        try:
            articles = get_articles_by_ids([article_id])
            if not articles:
                yield f"data: {json.dumps({'status': 'error', 'message': 'Article not found.'})}\n\n"
                return
            article = articles[0]
            yield f"data: {json.dumps({'agent': 'ingestion', 'status': 'completed', 'message': 'Individual intelligence report initiated.'})}\n\n"
            await asyncio.sleep(0.5)
            yield f"data: {json.dumps({'agent': 'entity_analysis', 'status': 'running', 'message': 'Performing deep linguistic & entity audit...'})}\n\n"
            analysis = analyze_article(article.get("text", ""))
            article["analysis"] = analysis
            yield f"data: {json.dumps({'agent': 'entity_analysis', 'status': 'completed', 'message': 'Entities & sentiment extracted.'})}\n\n"
            await asyncio.sleep(0.5)
            yield f"data: {json.dumps({'agent': 'synthesis', 'status': 'running', 'message': 'Synthesizing elaborate narrative intelligence...'})}\n\n"
            
            # Use specialized prompt for deep-dive article description
            prompt = f"Write an elaborate, multi-paragraph narrative analysis (12-15 sentences) for the following news article. Focus on deep business implications, long-term trends, and strategic takeaways. Article: {article.get('title')}. Text: {article.get('text')}"
            
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            briefing = response.choices[0].message.content.strip()
            article["summary"] = briefing
            
            yield f"data: {json.dumps({'agent': 'synthesis', 'status': 'completed', 'message': 'Deep-dive analysis complete.'})}\n\n"
            await asyncio.sleep(0.5)
            
            # Persist the elaborate summary
            from database.sqlite_db import update_article_intelligence
            update_article_intelligence(article_id, json.dumps(analysis), briefing, "")
            yield f"data: {json.dumps({'status': 'finished', 'message': 'Intelligence package complete.', 'article': article})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"
    return EventSourceResponse(event_generator())

def decode_url_id(url_id: str):
    import urllib.parse
    return urllib.parse.unquote(url_id)

@app.get("/api/news/semantic-search")
async def semantic_search(query: str, limit: int = 5, use_llm: bool = False):
    from agents.retrieval_agent import hybrid_search
    try:
        results = hybrid_search(query, top_k=limit, use_llm_rerank=use_llm)
        return {"status": "success", "query": query, "count": len(results), "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news/history")
async def get_history(timeframe: str = "all", sector: str = None, limit: int = 50):
    import sqlite3
    from database.sqlite_db import DB_PATH
    from datetime import datetime, timedelta
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # 1. BASE QUERY
        query = "SELECT * FROM articles WHERE 1=1 "
        params = []
        
        # 2. SECTOR FILTERING
        if sector and sector.lower() != "general":
            query += "AND (sector = ? OR sector LIKE ?) "
            params.extend([sector, f"%{sector}%"])
        
        # 3. TIME-TRAVEL LOGIC
        if timeframe.lower() == "today":
            today_start = datetime.now().strftime("%Y-%m-%d 00:00:00")
            query += "AND timestamp >= ? "
            params.append(today_start)
        elif timeframe.lower() == "yesterday":
            yest_start = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d 00:00:00")
            yest_end = datetime.now().strftime("%Y-%m-%d 00:00:00")
            query += "AND timestamp >= ? AND timestamp < ? "
            params.extend([yest_start, yest_end])
        elif timeframe.lower() == "week":
            week_start = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d 00:00:00")
            query += "AND timestamp >= ? "
            params.append(week_start)
        elif timeframe.lower() == "month":
            month_start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d 00:00:00")
            query += "AND timestamp >= ? "
            params.append(month_start)
            
        query += "ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        conn.close()
        return {"status": "success", "history": [dict(row) for row in rows]}
    except Exception as e:
        print(f"Error in get_history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/news/{article_id:path}")
async def get_article_detail(article_id: str):
    from database.sqlite_db import get_articles_by_ids
    article_id = decode_url_id(article_id)
    try:
        articles = get_articles_by_ids([article_id])
        if not articles:
            raise HTTPException(status_code=404, detail="Article not found")
        return {"status": "success", "article": articles[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/news/save")
async def save_article_endpoint(request: SaveRequest):
    from database.sqlite_db import save_article
    try:
        save_article(request.user_id, request.article_id)
        return {"status": "success", "message": "Article saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news/saved")
async def get_saved_articles_endpoint(user_id: str = "default_user"):
    from database.sqlite_db import get_saved_articles
    try:
        articles = get_saved_articles(user_id)
        return {"status": "success", "articles": articles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/preferences")
async def update_preferences(request: ProfileRequest):
    from database.sqlite_db import update_user_profile
    try:
        update_user_profile(
            request.user_id, 
            request.user_type, 
            request.interests, 
            request.preferred_sectors
        )
        return {"status": "success", "message": "Preferences updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    article_id: str = None
    question: str
    user_id: str = "default_user"
    user_type: str = "general"

async def safe_groq_chat(prompt: str, temperature: float = 0.7):
    """Retries with multiple models if rate limited."""
    models = ["llama-3.1-8b-instant", "llama3-8b-8192", "gemma2-9b-it", "mixtral-8x7b-32768"]
    last_err = None
    for model_name in models:
        try:
            print(f"  [🧠 AI]: Attempting response with {model_name}...")
            response = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            last_err = e
            print(f"  ⚠️ [AI FAIL]: {model_name} failed. Reason: {str(e)[:100]}...")
            continue
    raise last_err or Exception("All AI signals lost. Try a different API key.")

@app.post("/api/news/ask")
async def ask_intelligence(request: ChatRequest):
    from database.sqlite_db import get_articles_by_ids, get_user_profile
    from agents.user_memory_agent import MEMORY_FILE
    from agents.retrieval_agent import hybrid_search
    import json
    
    try:
        # 1. Get Context: Articles + Profile + Memory
        article_context = ""
        user_type = request.user_type or "general"
        
        if request.article_id and request.article_id != "general":
            articles = get_articles_by_ids([request.article_id])
            if articles:
                article = articles[0]
                article_context = f"CURRENT ARTICLE:\nTitle: {article.get('title')}\nSummary: {article.get('summary')}\nText: {article.get('text')[:1500]}"
        
        # If no specific article OR we want broader context, do a quick cross-reference search
        if not article_context:
            print(f"  [CHAT]: Performing RAG search for general query: '{request.question}'")
            search_results = hybrid_search(request.question, top_k=3)
            if search_results:
                article_context = "RELEVANT NEWS CONTEXT:\n" + "\n---\n".join([
                    f"Title: {a.get('title')}\nSummary: {a.get('summary') or a.get('preview')}" 
                    for a in search_results
                ])

        user_profile = get_user_profile(user_type)
        user_memory = {}
        if os.path.exists(MEMORY_FILE):
            try:
                with open(MEMORY_FILE, "r") as f:
                    user_memory = json.load(f)
            except: pass

        # 2. Construct Prompt
        prompt = f"""
You are the NewsMind Intelligence Assistant. Your goal is to provide CRISP, BULLETED intelligence briefings.
User Role: {user_type.upper()}
User Question: "{request.question}"

{article_context or "CONSULTING INTERNAL INTELLIGENCE ARCHIVES: No specific real-time news articles found in the local database for this specific query."}

Task:
1. Synthesize an answer in 3-4 SHARP BULLET POINTS tailored to a {user_type}.
2. If real-time news (RELEVANT NEWS CONTEXT) exists above, prioritize it.
3. If no local news is found, use your secondary intelligence archives to provide a high-fidelity expert answer anyway.
4. PERSONALIZATION: If Student, explain implications for their career. If Investor, focus on market risk. If General, focus on broad impact.
5. If an article title/link exists in context, end the response with: "For deeper reading, view the full report on the official portal."
6. FORMATTING: Use markdown bullet points (-). Keep each point under 25 words.
"""

        answer = await safe_groq_chat(prompt)
        
        return {"status": "success", "answer": answer}
    except Exception as e:
        print(f"Error in ask_intelligence: {e}")
        return {"status": "error", "answer": "I'm experiencing a brief signal interruption in my intelligence processing. Please try asking again in a moment."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
