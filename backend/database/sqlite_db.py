import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "news_intelligence.db")

def init_db():
    """
    Initializes the SQLite database with Structured Tables.
    Includes self-healing logic to add missing columns to existing databases.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Articles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        text TEXT NOT NULL,
        link TEXT UNIQUE,
        source TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        sector TEXT,
        topic TEXT,
        sentiment TEXT,
        urgency TEXT,
        market_impact TEXT,
        investor_relevance TEXT,
        summary TEXT,
        video_script TEXT,
        is_processed BOOLEAN DEFAULT 0
    )
    """)

    # Self-healing: Ensure columns exist
    cursor.execute("PRAGMA table_info(articles)")
    columns = [col[1] for col in cursor.fetchall()]
    if "sector" not in columns:
        cursor.execute("ALTER TABLE articles ADD COLUMN sector TEXT")
    if "is_processed" not in columns:
        cursor.execute("ALTER TABLE articles ADD COLUMN is_processed BOOLEAN DEFAULT 0")

    # 2. User Profile Table (Self-Healing PK)
    cursor.execute("PRAGMA table_info(user_profile)")
    profile_cols = [col[1] for col in cursor.fetchall()]
    if not profile_cols: # Table doesn't exist
        cursor.execute("""
        CREATE TABLE user_profile (
            id TEXT PRIMARY KEY,
            user_type TEXT,
            interests TEXT,
            preferred_sectors TEXT
        )
        """)
    elif "id" not in profile_cols: # Old table without PK
        print("  [DATABASE]: Rebuilding user_profile with Primary Key...")
        cursor.execute("DROP TABLE user_profile")
        cursor.execute("""
        CREATE TABLE user_profile (
            id TEXT PRIMARY KEY,
            user_type TEXT,
            interests TEXT,
            preferred_sectors TEXT
        )
        """)

    # 3. Saved Articles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_articles (
        user_id TEXT,
        article_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, article_id)
    )
    """)

    # 4. Daily Briefings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS daily_briefings (
        sector TEXT,
        briefing TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (sector, timestamp)
    )
    """)

    conn.commit()
    conn.close()
    print(f"  [DATABASE]: SQLite initialized & verified at {DB_PATH}")

def save_daily_briefing(sector, briefing):
    """Saves a multi-article synthesis briefing for the given sector."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Unique entry per hour for each sector to prevent duplicate overload while maintaining freshness
    current_time = datetime.now().strftime("%Y-%m-%d %H:00:00")
    cursor.execute("""
    INSERT OR REPLACE INTO daily_briefings (sector, briefing, timestamp)
    VALUES (?, ?, ?)
    """, (sector, briefing, current_time))
    conn.commit()
    conn.close()
    print(f"  [DATABASE]: Saved daily briefing for '{sector}' at {current_time}")

def get_latest_briefing(sector="General"):
    """Retrieves the most recent synthesis for the given sector."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
    SELECT briefing FROM daily_briefings 
    WHERE sector = ? 
    ORDER BY timestamp DESC 
    LIMIT 1
    """, (sector,))
    row = cursor.fetchone()
    conn.close()
    return row["briefing"] if row else None

def save_articles(articles):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    saved_count = 0
    new_articles_for_embedding = []
    for article in articles:
        try:
            article_id = article.get("link", article.get("title", ""))
            cursor.execute("""
            INSERT INTO articles (id, title, text, link, source, timestamp, sector)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                sector = CASE 
                    WHEN articles.sector IS NULL OR articles.sector = 'General' THEN EXCLUDED.sector 
                    ELSE articles.sector 
                END
            """, (
                article_id, 
                article.get("title"), 
                article.get("text"), 
                article.get("link"), 
                article.get("source", "RSS"), 
                datetime.now().isoformat(),
                article.get("sector")
            ))
            if cursor.rowcount > 0:
                saved_count += 1
                try:
                    from utils.search_text import build_search_text
                    search_content = build_search_text(article)
                    new_articles_for_embedding.append((article_id, search_content))
                except: pass
        except Exception as e: print(f"Error saving article: {e}")
    conn.commit()
    conn.close()
    if new_articles_for_embedding:
        try:
            from database.vector_store import vector_store
            vector_store.add_articles(new_articles_for_embedding)
        except: pass

def get_latest_news(limit=50, sector=None, after_timestamp=None):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = "SELECT * FROM articles WHERE 1=1 "
    params = []
    
    if sector and sector.lower() not in ["all", "general"]:
        query += "AND LOWER(sector) = ? "
        params.append(sector.lower())
    
    if after_timestamp:
        query += "AND timestamp >= ? "
        params.append(after_timestamp)
        
    query += "ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_article_intelligence(article_id, analysis, summary, video_script):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE articles 
    SET sector = ?, topic = ?, sentiment = ?, urgency = ?, market_impact = ?, investor_relevance = ?, 
        summary = ?, video_script = ?, is_processed = 1
    WHERE id = ?
    """, (analysis.get("sector", "unknown"), analysis.get("topic", "policy"), analysis.get("sentiment", "neutral"), analysis.get("urgency", "medium"), analysis.get("market_impact", "medium"), analysis.get("investor_relevance", "medium"), summary, video_script, article_id))
    conn.commit()
    conn.close()

def search_articles(query, limit=10):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    search_query = f"%{query}%"
    cursor.execute("SELECT * FROM articles WHERE (title LIKE ? OR text LIKE ?) ORDER BY timestamp DESC LIMIT ?", (search_query, search_query, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_articles_by_ids(article_ids):
    if not article_ids: return []
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    placeholders = ",".join("?" for _ in article_ids)
    cursor.execute(f"SELECT * FROM articles WHERE id IN ({placeholders})", article_ids)
    rows = cursor.fetchall()
    conn.close()
    article_dict = {row["id"]: dict(row) for row in rows}
    return [article_dict[aid] for aid in article_ids if aid in article_dict]

def save_article(user_id, article_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT OR IGNORE INTO saved_articles (user_id, article_id) VALUES (?, ?)", (user_id, article_id))
    conn.commit()
    conn.close()

def get_saved_articles(user_id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT a.* FROM articles a JOIN saved_articles s ON a.id = s.article_id WHERE s.user_id = ? ORDER BY s.timestamp DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_user_profile(user_id, user_type, interests, preferred_sectors):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO user_profile (id, user_type, interests, preferred_sectors)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET 
            user_type = EXCLUDED.user_type,
            interests = EXCLUDED.interests,
            preferred_sectors = EXCLUDED.preferred_sectors
    """, (user_id, user_type, json.dumps(interests), json.dumps(preferred_sectors)))
    conn.commit()
    conn.close()

def get_persona_template(persona_type="general"):
    templates = {
        "investor": {
            "user_type": "investor",
            "interests": ["markets", "equity", "finance", "stocks"],
            "preferred_sectors": ["Banking", "Markets", "Technology"]
        },
        "professional": {
            "user_type": "professional",
            "interests": ["business strategy", "industry trends", "corporate news"],
            "preferred_sectors": ["Business", "Startups", "Policy"]
        },
        "entrepreneur": {
            "user_type": "entrepreneur",
            "interests": ["funding", "venture capital", "hiring"],
            "preferred_sectors": ["Startups", "Technology"]
        },
        "general": {
            "user_type": "general",
            "interests": ["world news", "top stories"],
            "preferred_sectors": ["General"]
        }
    }
    return templates.get(persona_type.lower(), templates["general"])

def get_user_profile(user_identifier):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_profile WHERE id = ?", (user_identifier,))
    row = cursor.fetchone()
    if not row:
        cursor.execute("SELECT * FROM user_profile WHERE user_type = ?", (user_identifier,))
        row = cursor.fetchone()
    conn.close()
    if row:
        data = dict(row)
        try: data["interests"] = json.loads(data["interests"]) if data["interests"] else []
        except: data["interests"] = []
        try: data["preferred_sectors"] = json.loads(data["preferred_sectors"]) if data["preferred_sectors"] else []
        except: data["preferred_sectors"] = []
        return data
    return get_persona_template(user_identifier)

# Initialize on import
init_db()
