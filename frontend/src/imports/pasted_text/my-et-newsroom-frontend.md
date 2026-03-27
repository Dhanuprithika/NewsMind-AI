Build a modern, scalable frontend for a web application called "My ET — The Personalized Newsroom".

Tech Stack:
- React (Vite)
- Tailwind CSS
- Lucide React icons

Core Concept:
The app should feel like a modern newspaper (similar to Economic Times), but more dynamic and personalized. It should NOT look like an AI tool. AI should remain invisible and only enhance the reading experience.

----------------------------------------
PROJECT STRUCTURE (VERY IMPORTANT)
----------------------------------------

Create the following folder structure:

src/
 ├── components/
 │    ├── layout/
 │    │    ├── Navbar.jsx
 │    │    ├── Container.jsx
 │    │
 │    ├── dashboard/
 │    │    ├── DailyBriefing.jsx
 │    │    ├── KeyInsight.jsx
 │    │    ├── ExploreMore.jsx
 │    │    ├── NewsCard.jsx
 │    │    ├── CategorySection.jsx
 │    │    ├── NewsFeed.jsx
 │    │
 │    ├── ai/
 │    │    ├── AIBriefPanel.jsx
 │    │    ├── AIProcessingLogs.jsx
 │    │
 │    ├── profile/
 │    │    ├── ProfileHeader.jsx
 │    │    ├── RoleSelector.jsx
 │    │    ├── InterestSelector.jsx
 │    │    ├── BehaviorInsights.jsx
 │    │    ├── ProfileSummary.jsx
 │
 ├── pages/
 │    ├── Dashboard.jsx
 │    ├── Profile.jsx
 │
 ├── hooks/
 │    ├── useSSE.js
 │    ├── useNews.js
 │
 ├── services/
 │    ├── api.js
 │
 ├── utils/
 │    ├── formatters.js
 │
 ├── App.jsx
 ├── main.jsx

----------------------------------------
APP STRUCTURE
----------------------------------------

Create a single-page experience with:

1. Dashboard (main page)
2. AI Brief Panel (inline or side panel, NOT separate page)
3. Profile Page

----------------------------------------
DASHBOARD PAGE
----------------------------------------

Layout sections (top to bottom):

1. Navbar:
- App name: "My ET"
- User role indicator
- Clean and minimal
- Use Lucide icons

2. 🗞️ Daily Briefing:
- Title: "Today's Briefing"
- Display paragraph from API

3. 💡 Key Insight:
- Display one insight text

4. 💬 Explore More:
- Show 2–3 clickable questions
- Optional input field

5. ✨ Recommended for You:
- Grid of NewsCard components

Each NewsCard must include:
- Title
- Short preview (2 lines)
- Reading time (Lucide clock icon)
- Source
- Bookmark icon (Lucide)
- Label: "Based on your reading"
- Button: "Read More"

6. 📊 Category Sections:
- Horizontal scroll sections:
  - Business
  - Startups
  - Banking

7. 📰 Latest News Feed:
- General article list

----------------------------------------
ARTICLE INTERACTION
----------------------------------------

When user clicks "Read More":

- Open AIBriefPanel (side panel or modal)
- Do NOT navigate away
- Pass article_id to panel

----------------------------------------
AI BRIEF PANEL
----------------------------------------

Components:

AIBriefPanel.jsx should include:

1. Header:
- Title
- Source
- Time

2. AIProcessingLogs.jsx:
- Display steps dynamically
- Prepare for SSE (initially simulate)

Messages:

- "Understanding the article..."
- "Identifying key details..."
- "Connecting related news..."
- "Preparing summary..."

3. Content (after loading):
- Summary
- Why It Matters
- Key Points
- Related Trends
- Explore More
- Related Coverage
- "Read Full Article"

----------------------------------------
PROFILE PAGE
----------------------------------------

Include:

- ProfileHeader
- RoleSelector
- InterestSelector
- BehaviorInsights (static placeholder)
- ProfileSummary
- Simple settings actions

----------------------------------------
HOOKS
----------------------------------------

1. useNews.js:
- Fetch dashboard data from API

2. useSSE.js:
- Create EventSource connection
- Listen to backend stream
- Map backend steps → UI messages

Mapping:

fetching_article → "Understanding the article..."
extracting_entities → "Identifying key details..."
analyzing_context → "Connecting related news..."
generating_summary → "Preparing summary..."

----------------------------------------
API SERVICE
----------------------------------------

services/api.js:

Functions:

- getNews() → GET /news
- streamArticle(article_id) → SSE connection

----------------------------------------
BACKEND INTEGRATION READY
----------------------------------------

Prepare for these endpoints:

GET /news

Response:

{
  "briefing": "...",
  "insight": "...",
  "recommended": [...],
  "categories": {...},
  "articles": [...]
}

SSE:

GET /stream/{article_id}

----------------------------------------
UI/UX REQUIREMENTS
----------------------------------------

- Clean layout
- Rounded cards
- Subtle shadows
- Smooth hover effects
- Smooth panel animation
- Mobile responsive
- No technical AI labels

----------------------------------------
STATE MANAGEMENT
----------------------------------------

Use React hooks:

- selectedArticle
- dashboardData
- aiLogs
- aiResult

----------------------------------------
GOAL
----------------------------------------

Build a frontend that:

- Feels like a real newspaper
- Shows personalized content
- Supports real-time AI processing (SSE-ready)
- Is clean, modern, and engaging