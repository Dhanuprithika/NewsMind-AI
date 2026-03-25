import sys
from io import TextIOWrapper
if sys.stdout.encoding != 'utf-8':
    assert isinstance(sys.stdout, TextIOWrapper)
    sys.stdout.reconfigure(encoding='utf-8')

from graph.workflow import graph, State

# -------------------------------
# 🔹 USER TYPE (CHANGE HERE)
# -------------------------------
result = graph.invoke(State(
    user_type="student",   # try: student / teacher / investor / general
    articles=[],
    user_memory={},
    ranked_articles=[],
    final_output=[],
    daily_briefing=""
))

# -------------------------------
# 📰 Articles Output
# -------------------------------
print("\n📰 Fetched & Analyzed Articles:\n")

for article in result.get("articles", []):

    print("Title:", article.get("title", "No Title"))

    analysis = article.get("analysis", {})

    print("Entities:", analysis.get("entities", []))
    print("Sentiment:", analysis.get("sentiment", "Unknown"))
    print("Topic:", analysis.get("topic", "Unknown"))
    print("Urgency:", analysis.get("urgency", "Unknown"))
    print("Market Impact:", analysis.get("market_impact", "Unknown"))
    print("Investor Relevance:", analysis.get("investor_relevance", "Unknown"))
    print("Reasoning:", analysis.get("reasoning", ""))

    print("-" * 50)

# -------------------------------
# 🧠 User Memory Output
# -------------------------------
print("\n🧠 USER MEMORY PROFILE:\n")

user_memory = result.get("user_memory", {})

print("Sector Interests:", user_memory.get("sector_interest", {}))
print("Topic Interests:", user_memory.get("topic_interest", {}))
print("Company Interests:", user_memory.get("company_interest", {}))
print("Sentiment Preference:", user_memory.get("sentiment_preference", {}))

# -------------------------------
# 🏆 Ranking Output
# -------------------------------
print("\n🏆 PERSONALISED RANKING:\n")

for article in result.get("ranked_articles", []):
    print("Score:", article.get("score", 0))
    print("Title:", article.get("title", "No Title"))
    print("Why shown:", article.get("reason", ""))
    print("-" * 50)

# -------------------------------
# 🎯 FINAL PERSONALISED OUTPUT
# -------------------------------
print("\n🎯 PERSONALISED NEWS (BASED ON USER TYPE):\n")

for article in result.get("final_output", []):
    print("Title:", article.get("title", "No Title"))
    print("\nSummary:", article.get("summary", "No summary generated"))
    print("=" * 60)

# -------------------------------
# 🧠 DAILY BRIEFING (SYNTHESIS)
# -------------------------------
print("\n🧠 DAILY BRIEFING (Multi-article Synthesis):\n")
print(result.get("daily_briefing", "No briefing generated."))
print("=" * 60)
