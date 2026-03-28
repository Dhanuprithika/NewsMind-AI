import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Check root .env explicitly just in case
load_dotenv('../.env')

api_key = os.getenv("VITE_PEXELS_API_KEY")
print(f"API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    # Try just PEXELS_API_KEY
    api_key = os.getenv("PEXELS_API_KEY")
    print(f"PEXELS_API_KEY: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if api_key:
    url = "https://api.pexels.com/videos/search?query=business&per_page=1"
    headers = {"Authorization": api_key}
    res = requests.get(url, headers=headers)
    print(f"Status Code: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"Videos Found: {len(data.get('videos', []))}")
        if data.get('videos'):
            print(f"First Video Link: {data['videos'][0]['url']}")
    else:
        print(f"Error Response: {res.text}")
else:
    print("No API Key found.")
