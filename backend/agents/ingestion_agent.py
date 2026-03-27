import feedparser
import re
from database.sqlite_db import save_articles, get_latest_news

RSS_MAPPING = {
    "General": "https://economictimes.indiatimes.com/rssfeedsdefault.cms",
    "Business": "https://economictimes.indiatimes.com/news/economy/rssfeeds/1286551815.cms",
    "Markets": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "Startups": "https://economictimes.indiatimes.com/small-biz/startups/rssfeeds/11993050.cms",
    "Banking": "https://economictimes.indiatimes.com/industry/banking/finance/banking/rssfeeds/13358319.cms",
    "Tech": "https://economictimes.indiatimes.com/tech/rssfeeds/13357200.cms",
    "Technology": "https://economictimes.indiatimes.com/tech/rssfeeds/13357200.cms",
    "Economy": "https://economictimes.indiatimes.com/news/economy/rssfeeds/1286551815.cms",
    "World": "https://economictimes.indiatimes.com/news/international/world/rssfeeds/85847812.cms",
    "Politics": "https://economictimes.indiatimes.com/news/politics-and-nation/rssfeeds/1052730654.cms",
    "Commodities": "https://economictimes.indiatimes.com/markets/commodities/rssfeeds/18081521.cms",
    "Real Estate": "https://economictimes.indiatimes.com/wealth/real-estate/rssfeeds/12443026.cms",
    "IPO": "https://economictimes.indiatimes.com/markets/ipos/fpos/rssfeeds/14652238.cms",
    "MF": "https://economictimes.indiatimes.com/wealth/mutual-funds/rssfeeds/12443003.cms"
}

def ingestion_agent(state):
    selected_field = state.get("field", "General")
    print(f"\n[🚀 INGESTION AGENT]: Initiating targeted intelligence scan for Field: {selected_field}...")
    
    # Check cache first - we need a decent volume for a professional newsroom
    if selected_field == "General":
        from database.sqlite_db import DB_PATH
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM articles WHERE sector IN ('Business', 'World', 'Startups', 'Banking', 'Economy')")
        category_count = cursor.fetchone()[0]
        conn.close()
        # If we have less than 15 categorized articles, we definitely need a fresh load
        needs_pull = category_count < 15
    else:
        existing_news = get_latest_news(limit=20, sector=selected_field)
        needs_pull = len(existing_news) < 10
    
    # PULSE: Frequent checks for fresh data
    if needs_pull:
        # Define which feeds to pull
        if selected_field == "General":
            base_feeds = [
                ("General", RSS_MAPPING["General"]),
                ("Business", RSS_MAPPING["Business"]),
                ("World", RSS_MAPPING["World"]),
                ("Startups", RSS_MAPPING["Startups"]),
                ("Banking", RSS_MAPPING["Banking"]),
                ("Economy", RSS_MAPPING["Economy"]),
                ("Markets", RSS_MAPPING["Markets"])
            ]
            # ⭐ Phase 4: Persona-Targeted Ingestion
            user_type = state.get("user_type", "general").lower()
            persona_map = {
                "tech_professional": [("Technology", RSS_MAPPING["Tech"])],
                "investor": [("IPO", RSS_MAPPING["IPO"]), ("MF", RSS_MAPPING["MF"])],
                "entrepreneur": [("Startups", RSS_MAPPING["Startups"])],
                "student": [("Business", RSS_MAPPING["Business"]), ("Economy", RSS_MAPPING["Economy"])]
            }
            extra_feeds = persona_map.get(user_type, [])
            
            # Use a dict to unique-ify by URL while keeping priorities
            all_feeds_dict = {f[1]: f for f in base_feeds}
            for tag, url in extra_feeds:
                if url not in all_feeds_dict:
                    all_feeds_dict[url] = (tag, url)
            
            feeds_to_pull = list(all_feeds_dict.values())
        else:
            feeds_to_pull = [(selected_field, RSS_MAPPING.get(selected_field, RSS_MAPPING["General"]))]

        newly_fetched = []
        for sector_tag, rss_url in feeds_to_pull:
            print(f"  [INGESTION]: Pulling targeted '{sector_tag}' feed via {rss_url}...")
            feed = feedparser.parse(rss_url)
            # Pull up to 45 per feed to ensure 'View all' is rich
            for entry in feed.entries[:45]:
                text = entry.title + " " + entry.get("summary", "")
                clean_text = re.sub("<.*?>", "", text)
                
                newly_fetched.append({
                    "title": entry.title,
                    "text": clean_text,
                    "link": entry.link,
                    "source": "Economic Times",
                    "sector": sector_tag
                })

        save_articles(newly_fetched)
        # Pass 40 articles to the next stage for analysis
        articles_to_process = get_latest_news(limit=40, sector=selected_field)
    else:
        print(f"  -> Cache signals are high. Pulling from deep memory.")
        articles_to_process = get_latest_news(limit=40, sector=selected_field)

    # Map flat DB columns to nested 'analysis' object for processed articles
    final_list = []
    for art in articles_to_process:
        if art.get("is_processed") == 1:
            art["analysis"] = {
                "sector": art.get("sector"),
                "topic": art.get("topic"),
                "sentiment": art.get("sentiment"),
                "urgency": art.get("urgency"),
                "market_impact": art.get("market_impact"),
                "investor_relevance": art.get("investor_relevance"),
                "summary": art.get("summary")
            }
        final_list.append(art)

    state["articles"] = final_list
    print(f"[🚀 INGESTION AGENT]: Targeted Scan COMPLETE. Processing {len(final_list)} articles.")
    return state