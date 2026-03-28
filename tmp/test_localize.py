import asyncio
import os
import sys

# Ensure backend is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.agents.localization_agent import localize_article

async def test():
    title = "Gold demand in India has improved as prices ease"
    content = "Bullion dealers in India offered discounts of up to $61 per ounce over official domestic gold prices this week, down from as much as $75 last week. These prices include 6% import duty and 3% sales tax. Meanwhile, spot gold experienced volatile trading, flitting between $4,100 and $4,600 per ounce. Prices briefly touched a four-month low."
    language = "Tamil"
    
    print(f"Testing localization for {language}...")
    try:
        result = await localize_article(title, content, language)
        if result:
            print("Success!")
            # print(result) # Don't print JSON to terminal to avoid encoding issues
            print(f"Language: {result.get('language')}")
            print(f"Translated Title: {result.get('translated_title')}")
        else:
            print("Failed!")
    except Exception as e:
        print(f"Exception during test: {e}")

if __name__ == "__main__":
    asyncio.run(test())
