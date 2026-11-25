---
status: approved
---

# Design brief: SousChef AR

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

## The one spatial moment
The cook makes Nasi Goreng Spesial while a single world-anchored panel sits beside the simulated stove, about 1.3 m ahead and slightly right of their starting view, with its center about 25 cm below eye level. They pinch through the ingredient checklist and one recipe step at a time, starting and managing timers without touching a phone.

## Why it belongs on glasses
- Uses: draws in the world; leaves the cook's hands free and eyes up.
- Why it's better than the phone or laptop version: the current instruction, checklist, and cooking timers stay together in the cook's view, so they do not need to handle or re-read a wet or greasy phone.

## Product or overlay
- Type: product — the virtual cooking assistant is the experience.
- What the real version would sense: nothing; this recipe flow does not depend on recognizing real objects.
- Stand-in for the preview: the simulated room stands in for a kitchen. Put a simple virtual countertop plane and a frying-pan shape made from basic primitives under the panel to mark the stove spot; no external assets or real-stove recognition.

## Where things live
- Where the user is looking during the main task: toward the virtual counter and pan marker, with the recipe panel just above and beside them.
- Recipe panel: world-anchored about 130 cm ahead, slightly right of the starting view (exact horizontal offset +10 cm is a default), panel center about 25 cm below the straight-ahead eye line. Use one fixed world position and orientation after placement; face the starting viewpoint (default), never glue it to the camera. Keep all important content inside the comfortable central view.
- Recipe panel size: about 40 × 24 cm (default), with large readable text and controls. Lay the checklist out in two compact columns of five items (default) so it stays within that same comfortable view.
- Countertop marker: a simple plane about 50 × 34 cm (default), below the panel at the same stove spot. Add a basic primitive frying-pan shape about 28 cm across including handle (default). Keep the marker visually subordinate to the recipe.
- Visual style: clean, realistic, with restrained neutral colors and warm food tones (default).
- Welcome, checklist, recipe, and completion panels swap into the same anchored spot; exactly one panel is visible at a time. The finished-timer alert belongs inside the currently visible panel, not on a second panel.
- The checklist is also reachable from the completion panel (default); its return target reads “Back to completion” (default) and returns to the completion panel.

## Hands and input
- Pinch Start to open the ingredient checklist.
- Pinch any of the 10 checkboxes to tick or untick it. Show “X of 10 ready.” At 10 of 10, activate “Start cooking.” “Cook anyway” is available to skip ahead; either target opens Step 1.
- Pinch a timer chip to start its countdown when the food goes into the pan or onto the heat, not when the step card appears; pinch again to pause and again to resume. Show a progress ring and digits. Timers continue in the background while navigating steps or opening the checklist.
- Pinch the right edge of a step card to advance and its left edge to return to the previous step. Show “Step X of 7” throughout. The left-edge previous-step control is inactive on Step 1 (default).
- Each step card has a small “Ingredients” target in its bottom corner. Pinching it swaps to the checklist while preserving every tick. The checklist has “Back to Step X,” which returns to the exact step the cook left; timers keep running.
- A completed timer on the current step plays a soft chime, briefly flashes “Time to move on,” and leaves that timer chip at “0:00 — Done.” A timer completed on another step plays the chime and shows a gently pulsing banner: “Timer done — Step X: [step name].” The banner stays until pinched to jump to that step, or clears when normal navigation reaches it. When the cook arrives at the finished step, its chip reads “0:00 — Done.” The current card never changes on its own.
- When a timer ends while the checklist is open, show its alert on that panel too (default), with a pinch target to jump to the completed step. If several timer alerts are pending, show them one at a time (default).
- When a timer ends while the completion panel is open, play the chime and show “Timer done — Step X: [step name]” with a pinch target that returns to that step. Any still-running timer keeps counting and is listed on the completion panel, for example, “Step 6 timer still running — 1:24 left.” Reaching completion does not stop timers.
- Pinch next on Step 7 to open completion. The completion panel shows “Done — Nasi Goreng Spesial is ready to plate,” “7 of 7 steps completed,” garnish reminders (cucumber, fried shallots, crackers), any live timer lines or finished-timer alert, and a “Restart recipe” target.
- Keep the checklist reachable from completion too (default): an Ingredients target swaps to the checklist, and “Back to completion” returns to that panel without changing timer state.
- Pinch “Restart recipe” to cancel and reset every timer, clear the checklist and step position, and return to the welcome panel.
- Targets are big and highlight when aimed at. Pinch is the only required interaction. No voice controls.

### Recipe content

**Nasi Goreng Spesial** — Serves 2 · about 25 minutes.

**Welcome panel:** “SousChef AR,” “Nasi Goreng Spesial,” “Serves 2 · about 25 minutes,” an optional simple frying-pan illustration (include it by default), and one large “Start” pinch target.

**Ingredient checklist (10 items):**
1. 400 g cooked rice, preferably day-old
2. 2 eggs
3. 150 g chicken breast, diced
4. 3 shallots
5. 3 garlic cloves
6. 2 red chilies
7. 2 tbsp kecap manis (sweet soy sauce)
8. 1 tsp shrimp paste (terasi), optional
9. 2 spring onions, sliced
10. Cooking oil, salt, and white pepper

Garnish reminders (cucumber, fried shallots, crackers) appear on the completion panel, not in the checklist.

**Seven steps in order:**
1. **Prep & check** — Set out all ingredients and tick them off on the checklist. No timer. The Ingredients target keeps the checklist reachable from this and every other step.
2. **Blend the spice paste** — Blend the shallots, garlic, red chilies, and shrimp paste until smooth. No timer.
3. **Scramble the eggs** — Heat 1 tbsp oil, scramble the 2 eggs until just set, then set aside. Timer: 1:00.
4. **Sear the chicken** — Stir-fry the diced chicken until cooked through. Timer: 3:00.
5. **Fry the spice paste** — Add a little oil and fry the paste until fragrant and the oil separates. Timer: 2:00.
6. **Add rice & season** — Add the cooked rice, kecap manis, salt, and white pepper; toss on high heat until evenly coated. Timer: 3:00.
7. **Finish & plate** — Return the eggs, add the spring onions, toss for 30 seconds, then plate with cucumber, fried shallots, and crackers. Timer: 0:30.

## When things show
- Welcome appears first; Start opens the checklist.
- Checklist stays available before cooking and from every recipe step through the Ingredients target. It replaces the current panel and returns to the exact step through “Back to Step X.”
- One step card at a time appears after “Start cooking” or “Cook anyway.” Navigation changes the displayed step only when pinched.
- Timer chips appear only on Steps 3–7. Their countdowns are user-started, persist across navigation and checklist use, and are not canceled by completion.
- Timer alerts appear on the currently visible panel and remain actionable until the cook jumps to the finished step or reaches it through normal navigation.
- Completion appears after advancing from Step 7. Running timers remain visible there; finished timers can take the cook back to their step. Restart cancels timers and returns to welcome.
- If something important is out of view: none; keep the panel, controls, and timer alerts at the fixed stove spot in view.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. In one unbroken run, pinch through welcome, checklist, all seven steps in order, and completion after Step 7.
2. Pinching a checkbox visibly ticks it and updates “X of 10 ready”; at 10 of 10, “Start cooking” activates. The Ingredients target on each step opens the checklist, preserves tick states, and returns to the exact step.
3. Pinching the right edge advances, the left edge returns to the previous step, and each card shows the correct “Step X of 7.”
4. A timer starts only on pinch, visibly counts down with ring and digits, pauses and resumes on pinch, and reaches zero with a chime and “Time to move on.” A timer continues while another step is shown; finishing it raises the alert on the current panel. Completion also shows running timers and routes a finished-timer alert back to its step.
5. The panel stays fixed in the world at the stove spot while the preview view moves; it does not follow the camera. Text is large and readable, and exactly one panel is visible at a time.

## Out of scope
- Recognizing or tracking a real stove, pan, ingredients, or other real-world objects.
- Requiring voice, phone input, or any interaction beyond pinch.
- Any recipe other than Nasi Goreng Spesial in this first version.

## Risks and open questions
- Real-world comfort and hand-tracking feel remain unproven without SPECS hardware; the interaction and placement checks are for Lens Studio preview.
- Timer alert behavior while the checklist is open, and ordering multiple simultaneous timer alerts, use the defaults marked above.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details on the hackathon site: https://learn-specs.devpost.com/resources
