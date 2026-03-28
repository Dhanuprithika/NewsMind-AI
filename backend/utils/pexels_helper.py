import os
import requests
from dotenv import load_dotenv

load_dotenv()

PEXELS_API_KEY = os.getenv("VITE_PEXELS_API_KEY") or os.getenv("PEXELS_API_KEY")

def fetch_pexels_video(query):
    if not PEXELS_API_KEY:
        print(" [PEXELS]: No API Key found.")
        return None
    
    url = f"https://api.pexels.com/videos/search?query={query}&per_page=1&orientation=landscape&size=small"
    headers = {"Authorization": PEXELS_API_KEY}
    
    try:
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            data = res.json()
            videos = data.get("videos", [])
            if videos:
                # Find a suitable video file (SD or HD)
                video_files = videos[0].get("video_files", [])
                for f in video_files:
                    if f.get("quality") in ["sd", "hd"]:
                        return f.get("link")
        else:
            print(f" [PEXELS ERR]: {res.status_code} - {res.text}")
    except Exception as e:
        print(f" [PEXELS EXCEPTION]: {e}")
    
    return None
