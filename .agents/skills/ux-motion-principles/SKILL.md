---
name: ux-motion-principles
description: >-
  Apply 20 core UX and UI animation principles when designing, building, or
  reviewing interactive interfaces, micro-interactions, forms, and layouts.
  Use when implementing CSS/JS animations, transitions, feedback states, or
  evaluating interface ergonomics and responsiveness.
---

# UX & Motion Principles

Apply these 20 principles when building or reviewing UI components, transitions, and user flows.

## 1. Animation & Motion Physics

1. **Squash & stretch** — Elements should compress/deform slightly on impact to convey weight and physicality instead of feeling rigid.
2. **Anticipation wind-up** — Add a subtle counter-movement (wind-up) before a major movement or launch.
3. **Staging the focus** — Guide the user's eye to one thing at a time; avoid animating or revealing all elements simultaneously.
4. **Pose to pose** — Define explicit keyframes/states and let the transition interpolate smoothly between them rather than jumping without transitions.
5. **Follow through** — Allow secondary/trailing parts of an element to settle naturally after the main motion stops.
6. **Slow in & slow out** — Accelerate and decelerate (`ease-in-out`, cubic-bezier); never use constant `linear` speed for UI motion.
7. **Moving in arcs** — Move elements along curved paths rather than rigid straight lines when traveling across the screen (e.g., item flying to a cart).
8. **Secondary action** — Add a small supporting flourish that reinforces the primary action (e.g., a checkmark + subtle sparkle on a "Saved" button).
9. **Snappy timing** — Duration defines perceived quality: keep standard UI transitions under `300 ms` (e.g., `180 ms` for menus/popovers, not `600 ms`).
10. **Exaggerated feedback** — Make critical feedback unmistakable so the moment is felt (e.g., a clear shake + error message on wrong password instead of a subtle border color change).
11. **Solid drawing in 3D** — Give depth and volume to flat surfaces when tilting or flipping (e.g., `perspective: 700px` rather than `perspective: none`).
12. **Overall appeal** — Sweat every detail: replace bare text states (e.g., `"Downloading..."`) with crafted progress indicators and clear visual hierarchy.

## 2. Ergonomics & UX Laws

13. **Fitts's law** — Larger and closer targets are faster to acquire. Make primary CTAs prominent and close to the user's focus/cursor.
14. **Bigger hit areas** — Make clickable/tappable areas larger than the visible icon (e.g., `48 × 48 px` hit target around a `24 × 24 px` icon).
15. **Hick's law** — More options mean slower decisions. Reduce visible choices to the essential few (e.g., 4 clear categories instead of 16).
16. **Miller's law** — Humans hold ~7 items in working memory: chunk information into groups (e.g., card numbers in 4 blocks of 4 digits).
17. **Doherty threshold** — Respond within `400 ms` (ideally `<= 300 ms`) or the UI feels sluggish. Use optimistic UI or skeletons instead of long blocking spinners.
18. **Postel's law** — Be liberal in what you accept, strict/clean in what you output. Normalize messy user input (e.g., phone numbers, spacing, formatting) instead of rejecting valid variations.
19. **Jakob's law** — Users expect your app to work like other apps they already know. Place familiar elements (e.g., shopping cart, search, settings) in conventional locations.
20. **Frequency of use** — The more frequently an action is performed, the less it should animate. High-frequency menus and shortcuts should feel instant (`0 ms`) rather than delayed (`780 ms`).

## Verification Checklist

- [ ] No `linear` easing on UI transitions; durations are `< 300 ms` (or `0 ms` for high-frequency actions).
- [ ] Interactive targets have generous hit areas (`>= 44–48 px`) and primary CTAs follow Fitts's law.
- [ ] Forms normalize messy inputs (Postel's law) and group long numbers/data (Miller's law).
- [ ] Feedback states (loading `< 400 ms`, errors, success) are immediate and unmistakable.
