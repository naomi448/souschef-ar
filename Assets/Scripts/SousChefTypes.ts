/** Shared immutable recipe catalog and passive UI contract. No scene or timer state. */
export type SousChefView = 'welcome' | 'checklist' | 'recipe' | 'completion';
export type SousChefAction = {
  readonly type: 'start' | 'toggleIngredient' | 'startCooking' | 'cookAnyway' |
    'ingredients' | 'back' | 'previous' | 'next' | 'timer' | 'jumpAlert' | 'restart';
  readonly index?: number;
};
export type SousChefTimerStatus = 'idle' | 'running' | 'paused' | 'done';
export interface SousChefTimerView {
  readonly stepIndex: number;
  readonly totalSeconds: number;
  readonly remainingSeconds: number;
  readonly status: SousChefTimerStatus;
  readonly label: string;
  readonly progress: number;
}
export interface SousChefViewModel {
  readonly view: SousChefView;
  readonly stepIndex: number;
  readonly title: string;
  readonly subtitle: string;
  readonly body: string;
  readonly stepLabel: string;
  readonly ingredients: readonly string[];
  readonly checked: readonly boolean[];
  readonly readyCount: number;
  readonly canStart: boolean;
  readonly returnLabel: string | null;
  readonly previousEnabled: boolean;
  readonly nextLabel: string;
  readonly timer: SousChefTimerView | null;
  readonly alert: {readonly stepIndex: number; readonly label: string} | null;
  readonly notice: string;
  readonly liveTimers: readonly string[];
}
export interface SousChefSnapshot {
  readonly model: Readonly<SousChefViewModel>;
  readonly timers: readonly SousChefTimerView[];
  readonly pendingAlerts: readonly number[];
  readonly chimeCount: number;
}
export interface SousChefRecipeStep {
  readonly name: string;
  readonly instruction: string;
  readonly seconds: number;
}
export const INGREDIENTS: readonly string[] = Object.freeze([
  '400 g cooked rice, preferably day-old',
  '2 eggs',
  '150 g chicken breast, diced',
  '3 shallots',
  '3 garlic cloves',
  '2 red chilies',
  '2 tbsp kecap manis (sweet soy sauce)',
  '1 tsp shrimp paste (terasi), optional',
  '2 spring onions, sliced',
  'Cooking oil, salt, and white pepper'
]);
export const RECIPE_STEPS: readonly SousChefRecipeStep[] = Object.freeze([
  {name: 'Prep & check', instruction: 'Set out all ingredients and tick them off on the checklist.', seconds: 0},
  {name: 'Blend the spice paste', instruction: 'Blend the shallots, garlic, red chilies, and shrimp paste until smooth.', seconds: 0},
  {name: 'Scramble the eggs', instruction: 'Heat 1 tbsp oil, scramble the 2 eggs until just set, then set aside.', seconds: 60},
  {name: 'Sear the chicken', instruction: 'Stir-fry the diced chicken until cooked through.', seconds: 180},
  {name: 'Fry the spice paste', instruction: 'Add a little oil and fry the paste until fragrant and the oil separates.', seconds: 120},
  {name: 'Add rice & season', instruction: 'Add the cooked rice, kecap manis, salt, and white pepper; toss on high heat until evenly coated.', seconds: 180},
  {name: 'Finish & plate', instruction: 'Return the eggs, add the spring onions, toss for 30 seconds, then plate with cucumber, fried shallots, and crackers.', seconds: 30}
].map(step => Object.freeze(step)));
export function formatTimer(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  return Math.floor(whole / 60) + ':' + (whole % 60).toString().padStart(2, '0');
}
