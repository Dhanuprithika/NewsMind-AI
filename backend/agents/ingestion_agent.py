import feedparser
import re
from backend.database.sqlite_db import save_articles, get_latest_news

RSS_FEEDS = [
    "https://economictimes.indiatimes.com/rssfeedsdefault.cms"
]

def ingestion_agent(state):
    print(f"\n[🚀 INGESTION AGENT]: Initiating global business intelligence scan...")
    
    # 1. Fetch live news from RSS
    newly_fetched = []
    for url in RSS_FEEDS:
        print(f"  -> Pulling latest feeds from: {url}...")
        feed = feedparser.parse(url)

        # Let's fetch more (15 per feed) and store them
        for entry in feed.entries[:15]:
            text = entry.title + " " + entry.get("summary", "")
            clean_text = re.sub("<.*?>", "", text)

            newly_fetched.append({
                "title": entry.title,
                "text": clean_text,
                "link": entry.link,
                "source": "Economic Times"
            })

    # 2. Store all fetched news in the Structured SQLite Database
    save_articles(newly_fetched)

    # 3. Retrieve the news we want to process (Today's Latest)
    # This simulates a "Retrieval" step from the database.
    articles_to_process = get_latest_news(limit=5)
    
    # Check if we have anything to process
    if not articles_to_process:
        print("  ⚠️ [LOG]: No new/unprocessed news in database. Using last fetched as backup.")
        articles_to_process = newly_fetched[:5]

    state["articles"] = articles_to_process
    
    print(f"[🚀 INGESTION AGENT]: Scan COMPLETE. {len(newly_fetched)} synced to Database.")
    print(f"                       Processing {len(articles_to_process)} most relevant articles.")
    
    return state