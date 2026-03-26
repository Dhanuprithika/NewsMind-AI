def build_search_text(article: dict) -> str:
    """
    Constructs a rich text representation of an article for embedding generation.
    Incorporates all meaningful semantic fields to capture the nuance of the article.
    """
    parts = []
    
    # Title is the most important
    title = article.get("title")
    if title:
        parts.append(f"Title: {title}")
        
    # Categories / Sectors / Topics
    sector = article.get("sector")
    if sector and sector.lower() != "unknown":
        parts.append(f"Sector: {sector}")
        
    topic = article.get("topic")
    if topic and topic.lower() != "unknown":
        parts.append(f"Topic: {topic}")
        
    # Body text / Content
    text = article.get("text")
    if text:
        parts.append(f"Content: {text}")
        
    # Source
    source = article.get("source")
    if source:
        parts.append(f"Source: {source}")
        
    # Summaries or other meta fields
    summary = article.get("summary")
    if summary:
        parts.append(f"Summary: {summary}")
        
    return " \n".join(parts)
