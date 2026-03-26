// API Service — Ready for backend integration
// Replace BASE_URL with your actual backend endpoint

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Article {
  id: string;
  title: string;
  preview: string;
  source: string;
  readingTime: number;
  category: string;
  imageUrl?: string;
  publishedAt: string;
  isBookmarked?: boolean;
}

export interface DashboardData {
  briefing: string;
  insight: string;
  recommended: Article[];
  categories: {
    business: Article[];
    startups: Article[];
    banking: Article[];
  };
  articles: Article[];
}

export interface AIResult {
  summary: string;
  whyItMatters: string;
  keyPoints: string[];
  relatedTrends: string[];
  exploreMore: string[];
  relatedCoverage: { title: string; source: string }[];
}

// GET /news
export async function getNews(): Promise<DashboardData> {
  try {
    const res = await fetch(`${BASE_URL}/news`);
    if (!res.ok) throw new Error('API error');
    return res.json();
  } catch {
    // Return mock data when backend is unavailable
    return getMockDashboardData();
  }
}

// SSE /stream/{article_id}
export function streamArticle(articleId: string): EventSource {
  return new EventSource(`${BASE_URL}/stream/${articleId}`);
}

// ─── Mock Data ────────────────────────────────────────────────
export function getMockDashboardData(): DashboardData {
  return {
    briefing: `Good morning! Markets opened cautiously today as investors digest the RBI's surprise liquidity infusion of ₹1.5 lakh crore, the largest in three years. Sensex gained 312 points in early trade while Nifty 50 crossed 22,800. On the global front, the US Fed's hawkish tone is keeping emerging markets on edge, but India's strong Q3 GDP data at 7.6% growth gives a cushion. Meanwhile, three unicorn startups announced funding rounds totalling $480M, signalling robust VC appetite for Indian tech.`,
    insight: `India's digital payments ecosystem processed over ₹18 lakh crore in February — a 42% YoY jump — reinforcing why global payment giants are doubling down on the Indian market. This milestone positions India to overtake China in per-capita digital transactions by 2026.`,
    recommended: [
      {
        id: 'r1',
        title: 'RBI\'s Stealth Pivot: How the Central Bank Is Quietly Easing Without Cutting Rates',
        preview: 'Through a series of open market operations and forex swaps, the Reserve Bank of India is injecting liquidity at a scale not seen since the pandemic — all without touching the benchmark rate.',
        source: 'Economic Times',
        readingTime: 5,
        category: 'Banking',
        imageUrl: 'https://images.unsplash.com/photo-1751912455778-6ec1feabefaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5raW5nJTIwZmluYW5jaWFsJTIwZGlzdHJpY3QlMjBjaXR5fGVufDF8fHx8MTc3NDQ5OTAwOXww&ixlib=rb-4.1.0&q=80&w=1080',
        publishedAt: '2h ago',
        isBookmarked: false,
      },
      {
        id: 'r2',
        title: 'Sequoia Bets Big on AI-Native SaaS: Three Indian Startups Secure ₹2,000 Cr in Series B',
        preview: 'The funding surge underscores a shift in global VC sentiment — investors are no longer waiting for profitability but betting on AI-powered moats in B2B software.',
        source: 'ET Startup',
        readingTime: 4,
        category: 'Startups',
        imageUrl: 'https://images.unsplash.com/photo-1759884247173-3db27f7fafef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwdGVjaCUyMG9mZmljZSUyMGlubm92YXRpb258ZW58MXx8fHwxNzc0NDk5MDA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
        publishedAt: '3h ago',
        isBookmarked: true,
      },
      {
        id: 'r3',
        title: 'Sensex Rally Defies Global Headwinds: FIIs Turn Net Buyers After 6-Week Exodus',
        preview: 'Foreign institutional investors pumped in ₹4,200 crore in a single session — the largest single-day inflow since October — as India\'s macros stand out in a turbulent world.',
        source: 'ET Markets',
        readingTime: 3,
        category: 'Markets',
        imageUrl: 'https://images.unsplash.com/photo-1766218329569-53c9270bb305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMHRyYWRpbmclMjBmaW5hbmNlJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzc0NDk5MDA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
        publishedAt: '4h ago',
        isBookmarked: false,
      },
    ],
    categories: {
      business: [
        {
          id: 'b1',
          title: 'Tata Group\'s ₹80,000 Cr Capex Plan: A Deep Dive into India\'s Biggest Industrial Bet',
          preview: 'From semiconductors to green steel, Tata Sons is deploying capital at an unprecedented pace across 12 sectors.',
          source: 'ET Business',
          readingTime: 6,
          category: 'Business',
          imageUrl: 'https://images.unsplash.com/photo-1744827324103-6aae68abb440?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG9iYWwlMjBlY29ub215JTIwdHJhZGUlMjBwb2xpY3l8ZW58MXx8fHwxNzc0NDk5MDEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          publishedAt: '1h ago',
          isBookmarked: false,
        },
        {
          id: 'b2',
          title: 'Reliance Retail Eyes Southeast Asia Expansion, Plans 500 Stores in 3 Markets',
          preview: 'The country\'s largest retailer is looking beyond Indian borders with a phased international strategy.',
          source: 'ET Retail',
          readingTime: 4,
          category: 'Business',
          imageUrl: 'https://images.unsplash.com/photo-1748335353650-989cd6fccb68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYSUyMGVjb25vbXklMjBydXBlZSUyMGN1cnJlbmN5fGVufDF8fHx8MTc3NDQ5OTAwOXww&ixlib=rb-4.1.0&q=80&w=1080',
          publishedAt: '5h ago',
          isBookmarked: false,
        },
        {
          id: 'b3',
          title: 'India\'s PLI Scheme Delivers: Manufacturing Output Jumps 28% in Targeted Sectors',
          preview: 'Production-linked incentives have catalysed over ₹3.8 lakh crore in investments across electronics, pharma, and auto components.',
          source: 'ET Industry',
          readingTime: 5,
          category: 'Business',
          imageUrl: 'https://images.unsplash.com/photo-1764983432146-0217568c8a00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBhdXRvbm9tb3VzJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzQ0OTkwMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
          publishedAt: '6h ago',
          isBookmarked: false,
        },
        {
          id: 'b4',
          title: 'Property Prices Surge 18% in Top 8 Cities; Affordable Segment Left Behind',
          preview: 'The real estate boom is increasingly concentrated in luxury and premium segments, raising housing affordability concerns.',
          source: 'ET Realty',
          readingTime: 3,
          category: 'Business',
          imageUrl: 'https://images.unsplash.com/photo-1763621550224-6ff277b8c754?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwcHJvcGVydHklMjBob3VzaW5nJTIwbWFya2V0fGVufDF8fHx8MTc3NDQ5OTAxNHww&ixlib=rb-4.1.0&q=80&w=1080',
          publishedAt: '7h ago',
          isBookmarked: false,
        },
      ],
      startups: [
        {
          id: 's1',
          title: 'Zepto\'s Road to IPO: Inside the Quick Commerce Giant\'s ₹3,500 Cr War Chest',
          preview: 'With profitability in sight and market share at a record high, Zepto is gearing up for India\'s most anticipated tech IPO of 2025.',
          source: 'ET Startup',
          readingTime: 5,
          category: 'Startups',
          imageUrl: 'https://images.unsplash.com/photo-1759884247173-3db27f7fafef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFydHVwJTIwdGVjaCUyMG9mZmljZSUyMGlubm92YXRpb258ZW58MXx8fHwxNzc0NDk5MDA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
          publishedAt: '2h ago',
          isBookmarked: false,
        },
        {
          id: 's2',
          title: 'AI Agents Are Replacing Junior Roles: How Indian SaaS Companies Are Restructuring',
          preview: 'From customer support to code review, AI is reshaping the entry-level workforce in India\'s booming software exports industry.',
          source: 'ET Tech',
          readingTime: 6,
          category: 'Startups',
          imageUrl: 'https://images.unsplash.com/photo-1642775196125-38a9eb496568?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwZGF0YSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NzQ0Mjg1NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
          publishedAt: '4h ago',
          isBookmarked: false,
        },
        {
          id: 's3',
          title: 'D2C Brands Hit ₹50,000 Cr Revenue Mark: The New Face of Indian Consumer Economy',
          preview: 'Direct-to-consumer brands born on social media are now outpacing traditional FMCG giants in specific categories.',
          source: 'ET Brand Equity',
          readingTime: 4,
          category: 'Startups',
          imageUrl: 'https://images.unsplash.com/photo-1744827324103-6aae68abb440?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbG9iYWwlMjBlY29ub215JTIwdHJhZGUlMjBwb2xpY3l8ZW58MXx8fHwxNzc0NDk5MDEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
          publishedAt: '8h ago',
          isBookmarked: false,
        },
      ],
      banking: [
        {
          id: 'bk1',
          title: 'HDFC Bank\'s Q4 Profit Beats Estimates: NIM Recovery Signals End of Post-Merger Pain',
          preview: 'The private lender\'s net interest margin expanded 12 basis points QoQ, easing concerns over HDFC Ltd integration drag.',
          source: 'ET Banking',
          readingTime: 4,
          category: 'Banking',
          imageUrl: 'https://images.unsplash.com/photo-1751912455778-6ec1feabefaa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5raW5nJTIwZmluYW5jaWFsJTIwZGlzdHJpY3QlMjBjaXR5fGVufDF8fHx8MTc3NDQ5OTAwOXww&ixlib=rb-4.1.0&q=80&w=1080',
          publishedAt: '3h ago',
          isBookmarked: false,
        },
        {
          id: 'bk2',
          title: 'UPI Credit Lines: RBI\'s New Framework Could Add ₹8 Lakh Crore to Formal Credit Market',
          preview: 'Allowing credit lines on UPI is being described as the most significant credit democratisation since Jan Dhan Yojana.',
          source: 'ET Banking',
          readingTime: 5,
          category: 'Banking',
          imageUrl: 'https://images.unsplash.com/photo-1744473119469-905016183836?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlwdG9jdXJyZW5jeSUyMGJsb2NrY2hhaW4lMjBkaWdpdGFsJTIwZmluYW5jZXxlbnwxfHx8fDE3NzQ0OTkwMTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
          publishedAt: '5h ago',
          isBookmarked: false,
        },
        {
          id: 'bk3',
          title: 'SBI Plans ₹25,000 Cr Bond Issuance to Fund Infrastructure Lending Push',
          preview: 'The state-owned lender is tapping long-term debt markets to finance India\'s infrastructure buildout as part of the National Infrastructure Pipeline.',
          source: 'ET Banking',
          readingTime: 3,
          category: 'Banking',
          imageUrl: 'https://images.unsplash.com/photo-1766218329569-53c9270bb305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1hcmtldCUyMHRyYWRpbmclMjBmaW5hbmNlJTIwYnVzaW5lc3N8ZW58MXx8fHwxNzc0NDk5MDA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
          publishedAt: '9h ago',
          isBookmarked: false,
        },
      ],
    },
    articles: [
      {
        id: 'a1',
        title: 'Budget 2025 Surprise: Fiscal Deficit Narrows to 5.1%, Beats Estimates',
        preview: 'Capex surge funded by divestment proceeds and GST buoyancy.',
        source: 'ET Policy',
        readingTime: 4,
        category: 'Economy',
        publishedAt: '30m ago',
        isBookmarked: false,
      },
      {
        id: 'a2',
        title: 'India\'s Semiconductor Ambitions: ISMC Fab Clears Final Hurdles, Construction to Begin Q2',
        preview: 'The ₹22,900 crore fabrication plant in Gujarat marks India\'s entry into the global chip supply chain.',
        source: 'ET Tech',
        readingTime: 5,
        category: 'Technology',
        publishedAt: '1h ago',
        isBookmarked: false,
      },
      {
        id: 'a3',
        title: 'Rupee Strengthens to 82.4 vs Dollar Amid FII Inflows, RBI\'s Managed Float',
        preview: 'The currency\'s 1.2% gain this week is the sharpest since July, driven by equity market optimism.',
        source: 'ET Markets',
        readingTime: 3,
        category: 'Markets',
        publishedAt: '2h ago',
        isBookmarked: false,
      },
      {
        id: 'a4',
        title: 'EV Adoption Hits Inflection Point: 1 in 5 Two-Wheelers Sold Now Electric',
        preview: 'Ola Electric, TVS, and Bajaj collectively sold 280,000 EVs in February, setting an all-time monthly record.',
        source: 'ET Auto',
        readingTime: 4,
        category: 'Auto',
        publishedAt: '3h ago',
        isBookmarked: false,
      },
      {
        id: 'a5',
        title: 'Adani Ports Secures Colombo West Terminal Deal, Cementing Indian Ocean Strategy',
        preview: 'The 35-year concession agreement deepens India\'s strategic and commercial presence in Sri Lanka\'s key maritime gateway.',
        source: 'ET Infra',
        readingTime: 4,
        category: 'Infrastructure',
        publishedAt: '4h ago',
        isBookmarked: false,
      },
      {
        id: 'a6',
        title: 'PhonePe Turns Profitable, Eyes Insurance and Lending for Next Growth Phase',
        preview: 'The fintech giant\'s path to a domestic IPO crystallises as it posts its first full-year profit of ₹2,075 crore.',
        source: 'ET Fintech',
        readingTime: 5,
        category: 'Fintech',
        publishedAt: '5h ago',
        isBookmarked: false,
      },
    ],
  };
}

export function getMockAIResult(articleId: string): AIResult {
  const results: Record<string, AIResult> = {
    default: {
      summary: 'The Reserve Bank of India has conducted a series of open market operations and currency swaps totalling ₹1.5 lakh crore over the past three weeks — the largest liquidity infusion since the pandemic. Unlike a rate cut, this approach allows the RBI to ease credit conditions while maintaining its inflation-fighting credibility, signalling a nuanced shift in monetary policy stance.',
      whyItMatters: 'Liquidity is the lifeblood of credit markets. When the RBI injects this level of cash into the banking system, it lowers the cost of borrowing for banks — without the signalling effect of a formal rate cut. This means home loans, corporate credit, and SME financing could get cheaper in coming weeks, even before any official rate action.',
      keyPoints: [
        'RBI has infused ₹1.5 lakh crore via OMOs and FX swaps in March 2025',
        'Banking system liquidity has flipped from deficit to surplus of ₹85,000 crore',
        'Call money rates have softened 40–55 bps since early March',
        'No formal rate cut yet — MPC meeting scheduled for April 9–11',
        'SBI and HDFC Bank already reduced MCLR by 10–15 basis points',
      ],
      relatedTrends: ['Monetary Easing Cycle', 'Credit Growth Recovery', 'RBI Policy Pivot', 'Banking NIM Expansion'],
      exploreMore: [
        'How does RBI\'s OMO strategy differ from the US Fed\'s QE?',
        'Which sectors benefit most from liquidity-driven easing?',
        'What does this mean for fixed deposit rates in 2025?',
      ],
      relatedCoverage: [
        { title: 'HDFC Bank Cuts MCLR, Home Loan EMIs to Fall', source: 'ET Banking' },
        { title: 'RBI Forex Reserves Hit $650 Billion — Impact on Rupee', source: 'ET Markets' },
        { title: 'MPC Preview: Will April Bring India\'s First Rate Cut in 5 Years?', source: 'ET Economy' },
      ],
    },
  };
  return results[articleId] || results['default'];
}
