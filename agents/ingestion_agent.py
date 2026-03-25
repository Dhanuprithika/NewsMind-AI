import feedparser
import re

RSS_FEEDS = [
    "https://economictimes.indiatimes.com/rssfeedsdefault.cms"
]

def ingestion_agent(state):

    articles = []

    for url in RSS_FEEDS:

        feed = feedparser.parse(url)

        for entry in feed.entries[:5]:

            text = entry.title + " " + entry.get("summary", "")
            clean_text = re.sub("<.*?>", "", text)

            articles.append({
                "title": entry.title,
                "text": clean_text,
                "link": entry.link
            })

    state["articles"] = articles

    return state