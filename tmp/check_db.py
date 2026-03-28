import sqlite3
import os

DB_PATH = os.path.join("backend", "database", "news_intelligence.db")

def check_db():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title FROM articles LIMIT 5;")
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Title: {row[1]}")
    conn.close()

if __name__ == "__main__":
    check_db()
