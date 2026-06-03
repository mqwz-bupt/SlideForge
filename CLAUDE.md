# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---
## Project Overview

**SlideForge** — An AI-powered desktop application that converts documents (PDF/DOCX/TXT/MD) into stunning, animation-rich HTML/PPTX/PDF presentations. Target users are Chinese university students, professionals, and educators.

The project is currently in the **design and prototyping phase**. There is no build system, no package.json, and no runnable application yet.

## Repository Structure

| File / Directory | Purpose |
|---|---|
| `AI_PPT_Generator_PRD.md` | Complete product requirements document (703 lines). The source of truth for features, UI spec, data models, and MVP scope. |
| `ui_prototype.html` | Main UI prototype — 3-column layout (Sidebar + Workspace + AI Chat). Open directly in a browser to preview. |
| `wizard_prototype.html` | Start/wizard flow prototype — multi-step creation flow (topic → scope → mood → style → generate). Includes a collapsible recent-projects sidebar on the landing step. |
| `frontend-slides-main/` | Reference skill from [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides). Contains the design system, style presets, and HTML template used for generating the actual slide output. |

## Planned Architecture (from PRD)

- **Desktop:** Electron + React 18+ + Vite + Electron Builder
- **UI:** Material Design 3 style custom components, CSS-in-JS (Styled Components/Emotion)
- **AI:** Multi-model adapter pattern supporting OpenAI / Claude / DeepSeek / Qwen / Wenxin
- **Storage:** SQLite (better-sqlite3), local-only, no cloud
- **Parsing:** pdf-parse, mammoth.js for documents; python-pptx for PPTX
- **Export:** HTML (inline CSS/JS, zero deps), PptxGenJS for .pptx, Playwright headless for PDF

### Three-Panel Layout
```
[Sidebar 220px] | [Workspace: Outline Editor + Slide Preview] | [AI Chat 320-360px]
```

### Core Flow
```
Upload Doc → AI Parse → Structure Outline → Style Selection (Show Don't Tell) → Slide Generation → AI Chat Refinement → Export
```

## Design Principles (from frontend-slides skill)

These are non-negotiable for any generated slide output:

1. **Viewport Fitting** — Every slide must be `height: 100vh; overflow: hidden`. No scrolling within slides. Use `clamp()` for all sizing. Overflows must be split into additional slides.
2. **Zero Dependencies** — HTML output is a single file with all CSS/JS inlined.
3. **Distinctive Design** — No generic AI aesthetics. No purple-on-white gradients. Use distinctive fonts (Cormorant, Fraunces, Syne), bold colors with sharp accents, layered CSS backgrounds.
4. **Show Don't Tell** — Style selection via visual previews, not text descriptions.

## Style Presets

12 built-in themes defined in `frontend-slides-main/STYLE_PRESETS.md`:
- **Dark:** Bold Signal, Electric Studio, Creative Voltage, Dark Botanical
- **Light:** Notebook Tabs, Pastel Geometry, Split Pastel, Vintage Editorial
- **Specialty:** Neon Cyber, Terminal Green, Swiss Modern, Paper & Ink

## Language

- UI supports Chinese and English (bilingual toggle)
- All prototype UI text is in English; PRD is in Chinese
- Communication with the user is primarily in Chinese

## Working with Prototypes

Both HTML prototypes are self-contained and can be opened directly in a browser with `start "" <path>`. They use Google Fonts CDN and Material Icons CDN — an internet connection is needed for full rendering.

## Data Models

Key interfaces are defined in PRD section 10: `Project`, `DocumentOutline`, `Section`, `Point`, `Slide`. Refer to `AI_PPT_Generator_PRD.md` lines 498-550 for the canonical TypeScript definitions.
