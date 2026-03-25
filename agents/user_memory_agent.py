import json
import os

MEMORY_FILE = "user_memory.json"

def user_memory_agent(state):

    articles = state.get("articles", [])

    # create file if not exists
    if not os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, "w") as f:
            json.dump({
                "sector_interest": {},
                "topic_interest": {},
                "company_interest": {},
                "sentiment_preference": {}
            }, f)

    # load memory
    with open(MEMORY_FILE, "r") as f:
        memory = json.load(f)

    for article in articles:

        entities = article.get("entities", {})

        sector = entities.get("sector")
        topic = entities.get("topic")
        companies = entities.get("companies", [])
        sentiment = article.get("sentiment")

        # update sector
        if sector:
            memory["sector_interest"][sector] = \
                memory["sector_interest"].get(sector, 0) + 1

        # update topic
        if topic:
            memory["topic_interest"][topic] = \
                memory["topic_interest"].get(topic, 0) + 1

        # update companies
        for c in companies:
            memory["company_interest"][c] = \
                memory["company_interest"].get(c, 0) + 1

        # update sentiment preference
        if sentiment:
            memory["sentiment_preference"][sentiment] = \
                memory["sentiment_preference"].get(sentiment, 0) + 1

    # save updated memory
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=2)

    # add to state
    state["user_memory"] = memory

    return state