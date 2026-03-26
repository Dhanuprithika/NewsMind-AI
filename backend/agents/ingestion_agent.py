import feedparser
import re

RSS_FEEDS = [
    "https://economictimes.indiatimes.com/rssfeedsdefault.cms"
]

def ingestion_agent(state):
    print(f"\n[🚀 INGESTION AGENT]: Initiating business intelligence scan...")
    articles = []

    for url in RSS_FEEDS:
        print(f"  -> Fetching from: {url}...")
        feed = feedparser.parse(url)

        for entry in feed.entries[:5]:
            # Clean text
            text = entry.title + " " + entry.get("summary", "")
            clean_text = re.sub("<.*?>", "", text)

            articles.append({
                "title": entry.title,
                "text": clean_text,
                "link": entry.link
            })
            print(f"     ✅ Buffered: {entry.title[:30]}...")

    state["articles"] = articles
    print(f"[🚀 INGESTION AGENT]: Data capture COMPLETE. Forwarding {len(articles)} articles to Entity Analysis Agent.")
    return state