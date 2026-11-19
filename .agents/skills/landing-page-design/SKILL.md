---
name: landing-page-design
description: >-
  Structured workflow for designing and building high-converting, visually
  distinctive landing pages without generic AI-slop layouts. Use when the user
  asks to create, redesign, or plan a landing page, marketing page, or product
  showcase.
---

# Landing Page Design Workflow

Follow this 4-stage workflow before writing styled HTML/CSS/React so the landing page has real conversion strategy and a cohesive visual system instead of a generic AI template.

## Anti-Patterns to Avoid ("AI Slop")

Do **not** default to the overused generic layout for every product:
- Eyebrow label over a large serif headline on the left
- Product mock card on the right
- Single pill button under the copy
- Warm cream page background with no intentional visual identity

## Stage 1: Intake Interview (Before Any Code)

Before writing any code, ask the user these 7 questions (skip only what they already answered explicitly):

1. **Product & Audience:** What does the product/business do, and who is it for?
2. **Primary Action:** What is the **one** main action visitors should take?
3. **Value & Risk Reversal:** What do visitors get, and what reduces their risk (trial, guarantee, free tier)?
4. **Social Proof:** What proof exists (logos, testimonials, metrics/numbers)?
5. **Top Objections:** What are the top 2–3 objections a skeptical visitor has?
6. **Traffic Source:** Where does traffic come from (ads, organic search, social, referrals)?
7. **Look & Feel:** What tone, aesthetic, and visual personality fit the brand?

## Stage 2: Structure Plan (Blocks)

Plan the full page as a sequence of purposeful content blocks before styling (for example: Hero, Programs/Features, Story, How It Works, Social Proof/Mentors, Tiers/Levels, Use Cases, Pricing/Plans, FAQ, Final CTA, Footer).
- Define what each block accomplishes and its approximate content density.

## Stage 3: Copy-First Unstyled Wireframe

Draft the wireframe structure and conversion copy **before** applying final styling:
- Lead with a clear outcome-driven headline and verb-first CTA.
- Address the top objections and risk reversal directly in the copy.
- Place social proof where decision friction happens.

## Stage 4: Visual System (Design Tokens)

Apply an intentional, cohesive design token system rather than ad-hoc utility classes:
- **Typography (`TYPE`):** Choose at most 2 intentional font families (1 display/heading + 1 UI/body) with clear size/weight hierarchy.
- **Color (`COLOUR`):** Define a deliberate palette (background, surface, primary, accent, text, muted, border) tailored to the brand's Look & Feel.
- **Spacing & Radius (`SPACE`):** Standardize section paddings, container widths, gaps, and border radii in `px`/`rem`.

## Optional Stage 5: Animated Showcase

If the user asks for a presentation or promotional showcase of the finished page, create an animated walkthrough/motion sequence highlighting the hero, key blocks, and interactions (exportable to MP4/GIF if video tooling is requested).

## Verification

- [ ] Intake questions answered or confirmed before implementation.
- [ ] Copy and block hierarchy reviewed before final visual polish.
- [ ] Typography, color, and spacing follow explicit, consistent design tokens.
- [ ] Page does not resemble the generic "eyebrow + serif left + card right + cream bg" template.
