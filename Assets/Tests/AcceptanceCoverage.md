# SousChef AR acceptance scenarios

Test-owned files use only real UIKit/InteractionKit input; Main snapshots are read-only observations.
Object names are confirmed in `Assets/Scripts/SousChefUIHosts.json`, UI source and the authored scene snapshot.
Run scenarios serially with the LEAF panel targeting Preview. Do not refresh/recompile while a scenario runs.

| ID | Done criterion | Evidence sought |
| --- | --- | --- |
| souschef-full-flow | 1 | One unbroken welcome/checklist/seven exact recipe instructions/completion run |
| souschef-checklist | 2 | All ten visible ticks/count deltas; gated Start cooking; Ingredients/Back on every step and completion |
| souschef-navigation | 3 | Adjacent right/left navigation; labels; inactive previous on Step 1 |
| souschef-timer-current | 4 | Real 30s start/pause/resume; visible ring and digits; chime playing; transient notice; persistent Done |
| souschef-timer-background | 4 | Real 60s countdown through another step and checklist; no auto-navigation; alert jump |
| souschef-timer-completion | 4 | Timers survive completion; live lines; finished alert returns to step; checklist return preserves timer |
| souschef-alert-queue-restart | 4 | Ordered multi-alert queue; normal navigation clears alert; Restart resets all state and cancels live timer |
| souschef-world-anchor | 5 | Actual camera delta with fixed panel pose; all four views share pose and one visible view |
| souschef-ik-controls | 5 supplemental | IK input convergence with fail-fast diagnostics; no fallback masking |

Timer tests wait actual brief durations. No fake clock, private-action invocation, or state setters.
Default event timeout is 5 seconds; scenario timeout can be set to 120 seconds for timer cases.

The world-anchor scenario fails explicitly if tracking overrides its temporary camera movement.
If that occurs, use MovePreviewCamera and before/after runtime transforms as separate preview evidence.
Readability needs screenshot judgment; font metadata alone cannot prove it. Real-glasses comfort and hand-tracking feel remain unproven.

No device run is requested: the brief states no SPECS hardware is available.

## Attachment work order

Compile through Lens Studio MCP after the build and package migration finish. Import `Assets/Tests/LeafIndex.ts` through the scene/asset workflow; create one root named `LeafIndex`, attach the exported `LeafIndex` ScriptComponent, then save.
Do not attach individual scenarios: the scenario manager creates them from the index.
Discover the nine IDs through the LEAF panel, select Preview execution, and run one at a time.
Record actual outcomes; authored coverage is not a pass.
