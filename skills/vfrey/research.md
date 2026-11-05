# Research with vfrey

One engine, any research demand. A **plan** (JSON) says what to collect, where, which country, how to filter, how to group and rank, and what to output. vfrey runs it on its servers and charges credits per provider call. Finding creators is one recipe. `npx vfrey research schema` prints the plan format; `npx vfrey research schema --recipe ID` prints a plan to start from.

**Research needs no project.** `research` (older name: `ingest`) and `creators find|browse|show` run from any folder and write nothing but the files you ask for. Never run `npx vfrey init`, `npm create vfrey` or make a project for research (that adds `scenes/`, `scripts/`, `videos/` and skill copies nobody asked for). Outside a project folder the command is `npx @vfrey/vfrey research ...` (the printed hints already say so); `npx vfrey` only works inside one.

## The flow (always this order)

1. **Understand the demand.** Who is it for, which topic or brand, which country and platform, what do they want back (creators, posts, trends, a competitor's content, one creator)? Ask once if the country or platform is unclear.
2. **Write the plan** in `plans/<name>.json` (any folder is fine). Start from the closest recipe below.
   - **Queries in the audience's language.** Expand the person's words into 5 to 10 searches in the local language: the brand and its competitors, sale or price words as locals say them (Vietnamese: `săn sale`, `giảm giá`, `bóc giá`, `deal hời`), city names (`sale hà nội`), `review`, `haul`, `mở hộp`. Use the accented and the unaccented form only if they differ in meaning: matching ignores accents.
   - **Language.** `region` and `filter.country` say where a post was published, not what language it is. When the request names a language or a market with one main language, set `filter.languages` (ISO codes, e.g. `["vi"]` for Vietnam). Posts in other languages are dropped and counted; posts whose language is unknown are kept and counted, and the summary says how many.
   - **Season.** For a seasonal campaign (Black Friday, Tet, 11.11) consider `filter.withinDays` or `since`/`until`, and tell the person what dates the posts span (summary.md has a "Posts dated" line).
   - `region` limits a search to a country when the platform can (TikTok keyword search can; Instagram cannot, and the result says so). `filter.country` drops posts from other countries.
   - `filter.mustMention` (every word) and `anyOf` (at least one; `$price` means a price or a discount like 99k or 30%) keep the results about the topic. `exclude` drops noise. `dropNotCreators` removes media pages and betting or spam promos.
   - `group`: `creator` for people, `hashtag` or `sound` for trends, `day` or `week` for timing, `query` to compare searches, `none` for a plain list of posts.
   - Each provider call is one credit and a failed call is free. `budget.maxCalls` and `budget.maxCredits` cap it. At most 100 calls per plan.
3. **Quote first, always.** `npx vfrey research run --plan plans/x.json --quote` prints the cost of every step and spends nothing. Tell the person the number ("this will use up to 14 credits, you have 42") and wait for a yes.
4. **Run once.** `npx vfrey research run --plan plans/x.json --max-credits 14 --out out/x --open`. `--out DIR` writes `summary.md`, `posts.csv`, `groups.csv`, `result.json` and `report.html` in one go (`--md FILE`, `--csv FILE`, `--groups-csv FILE` and `--html FILE` write them one by one). A plan over 10 credits only runs with `--max-credits` (or `budget.maxCredits` in the plan); do not add it before the person agreed. Do not pipe the run through `tail` or `head`.
5. **Read `out/x/summary.md` before you reply.** It has the counts and drops, the dates the posts span, the ranked table, a link list (best post of each), the brand, retail and not-creator accounts apart, failed calls and notes. The run already spent the credits: **never run it again just to see its output**; read the files. `groups.csv` is one row per creator or group; `posts.csv` one row per post (handles have no `@`, with a separate `profile_url`).
6. **Open the report.** `--open` opens `report.html` in the browser. If you can publish or show a page (an artifact, a browser tool), open it there too. The CSVs open in Excel with Vietnamese intact. Tell the person where the folder is.
6b. **A "Partial result" warning is not optional to relay.** If `summary.md`, the output or the MCP text starts with it (a `!` line on stderr, exit code 0), some steps failed or were skipped. Tell the person which and why, give the Fix line, and say the list is incomplete. Nothing was charged for those steps.
7. **Summarise in chat, with links** (do not paste all of summary.md). For creators: **best bets** (high median views and engagement, recent, 2 or more posts), **by city** (when cities were found), **viral but small** (views per follower above 3 on accounts under 10K followers), **probably not KOLs** (media pages, betting promos, inflated views), and the **brand's own, retail and mall accounts** listed apart. One line per creator: `@handle`, followers, median views, engagement, and the link to their best post. For trends: the top five hashtags or sounds with their best post link. Say what was dropped (the summary line), the dates the posts span, and any `Note:` line (for example, a platform that has no country filter). If summary.md has a **Failed calls** section, tell the person exactly which search or lookup failed and why (it is skipped and not charged, so its posts are missing) and offer to run just that one again.
8. **Offer a next step:** a wider sweep (more pages), another country, a deep dive on the top three, or outreach drafts (`npx vfrey mail draft`, free; never send without the person's yes).

## Rules

- Never name the data source. Say "vfrey search".
- Unknown numbers print as `—`; never turn them into 0. Never invent a metric, a city or a follower count.
- Separate brand official accounts, retailers and media pages from creators, and say how you decided (the tags come from the account's name, bio and platform label).
- `research trends --region VN` is the one-line shortcut for a trending read; `npx vfrey creators find --query "muji sale" --region VN --language vi --must-mention muji --any-of sale,giảm --pages 2 --max-credits 20 --out out/x` is the shortcut for recipe 1. `creators find` is a live search and costs credits; `creators browse` reads the stored index and runs no new search (`creators search` is the older name).
- Steps can feed each other: give a step an `id`, then `{"op": "recentPosts", "platform": "tiktok", "fromStep": {"step": "found", "top": 20}}` reads the last posts of the top 20 creators it found. The platform must match.
- Metrics a group can show: posts, creators, totalViews, medianViews, bestViews, engagementRate, viewsPerFollower, avgShares, avgSaves, avgComments, latestPost, followers, followerGrowth7d, followerGrowth30d, score, and for creators formats, hooks and postingTimes. Engagement is (likes + comments + shares + saves) divided by views, the median over the group's posts.

## Recipes

### 1. KOLs for a brand sale in a country (`kols-for-a-sale`)

Use when: creators, KOLs or influencers who post about a brand, a sale or a campaign in one country.

```json
{
  "title": "MUJI sale creators in Vietnam",
  "collect": [
    {
      "op": "searchPosts",
      "platform": "tiktok",
      "queries": [
        "muji sale",
        "săn sale muji",
        "muji giảm giá",
        "muji review",
        "muji haul",
        "muji việt nam"
      ],
      "region": "VN",
      "pages": 2
    }
  ],
  "filter": {
    "country": "VN",
    "languages": [
      "vi"
    ],
    "mustMention": [
      "muji"
    ],
    "anyOf": [
      "sale",
      "giảm",
      "deal",
      "ưu đãi",
      "$price"
    ]
  },
  "group": "creator",
  "rank": {
    "by": "score"
  },
  "output": {
    "formats": [
      "html",
      "csv"
    ],
    "views": [
      "posts",
      "groups"
    ]
  },
  "budget": {
    "maxCalls": 20,
    "maxCredits": 20
  }
}
```

### 2. Competitor content monitoring (`competitor-content`)

Use when: what the competitors post and what performs, from the brands' own accounts.

```json
{
  "title": "What performs on the competitors' accounts",
  "collect": [
    {
      "op": "profile",
      "platform": "tiktok",
      "handles": [
        "uniqlo_vn",
        "zara",
        "hm"
      ]
    },
    {
      "op": "recentPosts",
      "platform": "tiktok",
      "handles": [
        "uniqlo_vn",
        "zara",
        "hm"
      ],
      "limit": 30
    }
  ],
  "filter": {
    "withinDays": 90
  },
  "group": "creator",
  "metrics": [
    "followers",
    "posts",
    "medianViews",
    "engagementRate",
    "avgShares",
    "avgSaves",
    "latestPost",
    "formats",
    "hooks"
  ],
  "rank": {
    "by": "medianViews"
  }
}
```

### 3. Trend scouting in a region, by hashtag (`trend-scouting`)

Use when: what is trending or rising in a niche or a country; use group sound for the sounds instead.

```json
{
  "title": "Trending in Vietnam on TikTok",
  "collect": [
    {
      "id": "trending",
      "op": "trending",
      "platform": "tiktok",
      "region": "VN",
      "limit": 50
    },
    {
      "op": "searchPosts",
      "platform": "tiktok",
      "kind": "hashtag",
      "queries": [
        "thoitrang",
        "review"
      ],
      "region": "VN",
      "pages": 2
    }
  ],
  "filter": {
    "country": "VN",
    "withinDays": 14
  },
  "group": "hashtag",
  "rank": {
    "by": "totalViews",
    "top": 50
  }
}
```

### 4. A creator deep dive (`creator-deep-dive`)

Use when: everything about one creator: numbers, recent posts, formats, hooks, best hours.

```json
{
  "title": "Deep dive: one creator",
  "collect": [
    {
      "op": "profile",
      "platform": "tiktok",
      "handles": [
        "minhchuoi000"
      ]
    },
    {
      "op": "recentPosts",
      "platform": "tiktok",
      "handles": [
        "minhchuoi000"
      ],
      "limit": 30
    }
  ],
  "group": "creator",
  "metrics": [
    "followers",
    "posts",
    "medianViews",
    "engagementRate",
    "avgShares",
    "avgSaves",
    "postingTimes",
    "formats",
    "hooks"
  ]
}
```

### 5. Cross-platform topic research (`cross-platform-topic`)

Use when: what people post about a topic across TikTok, YouTube and Reddit; group by day to see when it moves, or by creator to see who.

```json
{
  "title": "Meal prep across platforms",
  "collect": [
    {
      "op": "searchPosts",
      "platform": "tiktok",
      "queries": [
        "meal prep"
      ],
      "pages": 2
    },
    {
      "op": "searchPosts",
      "platform": "youtube",
      "queries": [
        "meal prep"
      ]
    },
    {
      "op": "searchPosts",
      "platform": "reddit",
      "queries": [
        "meal prep"
      ]
    }
  ],
  "filter": {
    "withinDays": 30
  },
  "group": "day"
}
```

### 6. Outlier posts in a niche (`outlier-posts`)

Use when: which posts beat their own creator's usual: find a niche's creators, read their recent posts, keep posts at 2x their creator's median views or more (tiers: mild 1.5-2x, strong 2-5x, huge 5x+). Open the report on the outliers view. A creator with under 10 posts in the run is low confidence.

```json
{
  "title": "Outlier posts: meal prep on TikTok",
  "collect": [
    {
      "id": "found",
      "op": "searchPosts",
      "platform": "tiktok",
      "queries": [
        "meal prep",
        "meal prep ideas"
      ],
      "limit": 30
    },
    {
      "id": "recent",
      "op": "recentPosts",
      "platform": "tiktok",
      "fromStep": {
        "step": "found",
        "top": 15,
        "by": "views"
      },
      "limit": 30
    }
  ],
  "filter": {
    "withinDays": 90,
    "minLift": 2
  },
  "group": "none",
  "output": {
    "formats": [
      "html",
      "csv"
    ],
    "views": [
      "outliers",
      "posts"
    ]
  },
  "budget": {
    "maxCalls": 20,
    "maxCredits": 20
  }
}
```

### 7. Comment mining (`comment-mining`)

Use when: what an audience says under the posts that matter: real questions, objections, praise and the words people use. Read the comments of the most-commented posts of a search, then quote them verbatim.

```json
{
  "title": "What people ask under skincare routine posts",
  "collect": [
    {
      "id": "top",
      "op": "searchPosts",
      "platform": "tiktok",
      "queries": [
        "skincare routine"
      ],
      "limit": 30
    },
    {
      "op": "comments",
      "platform": "tiktok",
      "fromStep": {
        "step": "top",
        "top": 5,
        "by": "comments"
      },
      "pages": 2,
      "limit": 100
    }
  ],
  "filter": {
    "withinDays": 60
  },
  "group": "none",
  "output": {
    "formats": [
      "html",
      "csv"
    ],
    "views": [
      "posts"
    ]
  },
  "budget": {
    "maxCalls": 15,
    "maxCredits": 15
  }
}
```

### 8. Transcript intelligence (`transcript-intelligence`)

Use when: what the best videos of a topic actually say: their hooks, structure, claims and calls to action, from the words of the video, not the caption.

```json
{
  "title": "What top podcast-start videos say",
  "collect": [
    {
      "id": "top",
      "op": "searchPosts",
      "platform": "tiktok",
      "queries": [
        "how to start a podcast"
      ],
      "limit": 30
    },
    {
      "op": "transcript",
      "platform": "tiktok",
      "fromStep": {
        "step": "top",
        "top": 8,
        "by": "views"
      }
    }
  ],
  "filter": {
    "withinDays": 120
  },
  "group": "none",
  "output": {
    "formats": [
      "html",
      "csv"
    ],
    "views": [
      "posts"
    ]
  },
  "budget": {
    "maxCalls": 12,
    "maxCredits": 12
  }
}
```

### 9. Competitor research across platforms (`competitor-research`)

Use when: how competitors do on every platform they use: their recent posts on TikTok and Instagram, which posts beat their own usual, and what people say under the best ones.

```json
{
  "title": "Competitors: what beats their usual",
  "collect": [
    {
      "id": "tt",
      "op": "recentPosts",
      "platform": "tiktok",
      "handles": [
        "zara",
        "hm"
      ],
      "limit": 30
    },
    {
      "id": "ig",
      "op": "recentPosts",
      "platform": "instagram",
      "handles": [
        "zara",
        "hm"
      ],
      "limit": 30
    },
    {
      "op": "comments",
      "platform": "tiktok",
      "fromStep": {
        "step": "tt",
        "top": 5,
        "by": "lift"
      },
      "limit": 50
    }
  ],
  "filter": {
    "withinDays": 90
  },
  "group": "creator",
  "metrics": [
    "followers",
    "posts",
    "medianViews",
    "baselineMedianViews",
    "engagementRate",
    "bestLift",
    "latestPost",
    "formats",
    "hooks"
  ],
  "rank": {
    "by": "bestLift"
  },
  "output": {
    "formats": [
      "html",
      "csv"
    ],
    "views": [
      "groups",
      "outliers"
    ]
  },
  "budget": {
    "maxCalls": 15,
    "maxCredits": 15
  }
}
```

### 10. Social listening on a brand (`social-listening`)

Use when: what people say about a brand or a topic right now, across X, Threads, Reddit, LinkedIn and TikTok, and when the talk moves. Read the comments under the most-discussed Reddit threads.

```json
{
  "title": "What people say about a brand this month",
  "collect": [
    {
      "op": "searchPosts",
      "platform": "x",
      "queries": [
        "oatly"
      ],
      "pages": 2
    },
    {
      "op": "searchPosts",
      "platform": "threads",
      "queries": [
        "oatly"
      ]
    },
    {
      "id": "reddit",
      "op": "searchPosts",
      "platform": "reddit",
      "queries": [
        "oatly"
      ]
    },
    {
      "op": "searchPosts",
      "platform": "linkedin",
      "queries": [
        "oatly"
      ]
    },
    {
      "op": "searchPosts",
      "platform": "tiktok",
      "queries": [
        "oatly"
      ]
    },
    {
      "op": "comments",
      "platform": "reddit",
      "fromStep": {
        "step": "reddit",
        "top": 3,
        "by": "comments"
      },
      "limit": 100
    }
  ],
  "filter": {
    "withinDays": 30,
    "mustMention": [
      "oatly"
    ]
  },
  "group": "day",
  "output": {
    "formats": [
      "html",
      "csv"
    ],
    "views": [
      "posts",
      "groups"
    ]
  },
  "budget": {
    "maxCalls": 15,
    "maxCredits": 15
  }
}
```
