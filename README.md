# ⚔️ Mona Mayhem

> **Enter the arena. Two developers. One winner. Let the contributions decide.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro%20v5-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![GitHub Copilot](https://img.shields.io/badge/Built%20with-GitHub%20Copilot-8957e5?logo=github&logoColor=white)](https://github.com/features/copilot)

A **hands-on workshop** where you build a retro arcade-style GitHub Contribution Battle Arena using **Astro 5** and **GitHub Copilot**. Enter two GitHub usernames, fetch their contribution graphs, and crown a winner — all built by *you*, guided by AI.

![Mona Mayhem Screenshot](https://github.com/user-attachments/assets/5eca79e2-cb9f-4e93-aa0d-23666ebde3b7)

---

## ✨ What You'll Build

By the end of the workshop, you'll have a fully working app that:

- 🥊 **Pits two GitHub users head-to-head** — enter any two usernames and kick off the battle
- 📊 **Visualises contribution graphs** side by side in a retro arcade aesthetic
- ⚡ **Fetches live data** via a server-side API built on Astro's API routes
- 🎨 **Looks great** with a dark GitHub-inspired theme and Press Start 2P typography

This is the **starting scaffold** — you'll implement it step by step using GitHub Copilot.

---

## 📚 Workshop

Choose the track that matches your workflow and work through the parts in order:

| | Track | Tools & Features |
|---|---|---|
| 🖥️ | **VS Code** | Chat, Plan Mode, Agent Mode, background agents, editor-native review loops |
| 💻 | **CLI** | `copilot`, `@file` context, `/plan`, autonomous edits, `/fleet`, `/delegate`, `/review` |

| Part | Title | Copilot Focus |
|------|-------|---------------|
| [00](workshop/00-overview.md) | Overview | Track selection and learning goals |
| [01](workshop/01-setup.md) | Setup & Context Engineering | Instructions, permissions, and environment setup |
| [02](workshop/02-plan-and-scaffold.md) | Plan & Scaffold | Planning the API and page architecture |
| [03](workshop/03-agent-mode.md) | Build the Game | Agentic implementation and iteration |
| [04](workshop/04-design-vibes.md) | Design-First Theming | Visual design planning and implementation |
| [05](workshop/05-polish.md) | Polish & Parallel Work | Parallelism, reviews, and quality passes |
| [06](workshop/06-bonus.md) | Bonus & Extensions | Open-ended feature ideas and extra Copilot experiments |

---

## 🚀 Quick Start

**Step 1 — Get your own copy:**

- Click **[Use this template](../../generate)** to create a new repo from this template, _or_
- **Fork** this repository.

**Step 2 — Pick your track and set up:**

| VS Code | GitHub Copilot CLI |
|---|---|
| Clone your repo | Clone your repo |
| Open in VS Code | Install `copilot` (`npm i -g @github/copilot` or Homebrew / WinGet) |
| Sign in to the GitHub Copilot extension | Sign in via `copilot auth login` |

**Step 3 — Start the workshop:**

```bash
npm ci          # install dependencies
npm run dev     # start the dev server at http://localhost:4321
```

Then follow the [workshop guide →](workshop/00-overview.md)

---

## 🛠 Prerequisites

| Requirement | VS Code track | CLI track |
|---|:---:|:---:|
| GitHub Copilot (Pro / Business / Enterprise) | ✅ | ✅ |
| Git | ✅ | ✅ |
| Node.js | ✅ | ✅ 22+ |
| VS Code v1.107+ | ✅ | — |
| GitHub Copilot extension | ✅ | — |
| GitHub Copilot CLI (`copilot`) | — | ✅ |

---

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Framework | [Astro](https://astro.build/) v5 — server-rendered, Node adapter |
| Runtime | Node.js with [@astrojs/node](https://docs.astro.build/en/guides/integrations-guide/node/) |
| Font | Press Start 2P — for maximum retro vibes |
| Data | GitHub's contribution graph API |
| AI Copilot | GitHub Copilot (VS Code + CLI) |

---

## 🔌 API: Contributions Proxy

The app uses a server-side proxy endpoint to fetch contribution data from GitHub and avoid browser CORS limitations.

**Route**

- `GET /api/contributions/:username`

**Upstream source**

- `https://github.com/{username}.contribs`

**Query params**

- `refresh=true` or `refresh=1` bypasses a fresh cache hit and forces an upstream fetch.

**Response behavior**

- `200` on success with JSON payload from GitHub.
- `400` when `:username` is invalid.
- `404` when the GitHub user does not exist.
- `502` for upstream failures or invalid upstream JSON.
- `504` when the upstream request times out.

**Caching strategy**

- In-memory cache keyed by username.
- TTL: 5 minutes per cache entry.
- Capacity bound: 500 entries (oldest entries trimmed first).
- Stale fallback: if upstream fails and cached data exists, stale data is returned.

**Response headers**

- `Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=60`
- `X-Cache: HIT | MISS | STALE | SKIP`
- `Warning: 110 - Response is stale` when stale fallback is served.

---

## License

[MIT](LICENSE)
