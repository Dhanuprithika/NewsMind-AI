import requests
import trafilatura
from bs4 import BeautifulSoup

def scrape_full_article(url):
    """
    Fetches the full text content of a news article given its URL.
    Uses trafilatura for clean extraction, with BeautifulSoup as fallback.
    """
    print(f"  🔍 [SCRAPER]: Deep scanning content from: {url}...")
    try:
        # Standard headers to avoid blocking
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 1. Try Trafilatura for premium cleaning
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            extracted = trafilatura.extract(downloaded)
            if extracted and len(extracted) > 300: # Ensure we got more than just a snippet
                return extracted

        # 2. Fallback to Requests + BeautifulSoup for hard-to-parse pages
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove scripts and styles
            for script in soup(["script", "style"]):
                script.extract()

            # Economic Times specific parsing if needed, but generic works too
            # ET often stores text in .artText or .content class
            article_body = soup.find('div', class_='artText') or soup.find('article') or soup.find('div', class_='content')
            
            if article_body:
                return article_body.get_text(separator='\n', strip=True)
            
            # Last resort: just get text from body
            return soup.get_text(separator='\n', strip=True)

    except Exception as e:
        print(f"  ⚠️ [SCRAPER_ERROR]: Failed to fetch {url}: {e}")
        return None

    return None
