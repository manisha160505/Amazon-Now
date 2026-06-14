# Amazon Flash Mode

**Tagline:** *"Tell us your situation, not the product."*

## Short Description

Amazon Flash Mode is a quick-commerce MVP that reimagines online shopping by letting customers describe their situation in plain language and instantly receiving a complete, ready-to-buy bundle. It reduces the traditional *Search → Browse → Compare → Buy* flow into a single *Situation → Instant Bundle → One-Tap Checkout* experience.

## What It Does

- Accepts natural-language situation input (e.g., "I have a fever", "Guests coming in 30 minutes")
- Matches intent using a fast, zero-cost rule-based engine with optional LLM fallback
- Generates a curated bundle of products for that situation
- Allows budget-constrained bundle generation
- Asks 2-3 smart clarifying questions when needed
- Supports one-tap cart addition, bill splitting, calendar-aware suggestions, and trending recommendations
- Includes a Chrome extension to highlight text on any webpage and open Flash Mode pre-filled

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Backend:** Python + FastAPI + Mangum
- **Database:** Amazon DynamoDB
- **Infra:** AWS Lambda, API Gateway, S3, CloudFront, SAM
- **Browser Extension:** Chrome Manifest v3

## Repo Description (for GitHub)

> Amazon Flash Mode ⚡ — Transform shopping from search/compare/buy into situation → instant bundle → one-tap checkout. Built with React, FastAPI, and AWS serverless.
