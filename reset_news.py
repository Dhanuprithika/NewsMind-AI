import sqlite3
try:
    c = sqlite3.connect('backend/database/news_intelligence.db')
    c.execute("UPDATE articles SET is_processed = 0")
    c.execute("UPDATE articles SET summary = NULL WHERE length(summary) < 5")
    c.commit()
    print(f"✅ Reset {c.total_changes} articles for fresh intelligence.")
    c.close()
except Exception as e:
    print(f"❌ Error: {e}")
