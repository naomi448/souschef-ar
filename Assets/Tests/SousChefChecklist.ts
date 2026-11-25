import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {CookInteractor, activeView, enabledControl, includes, label, snapshot} from './SousChefLeafSupport';

@component
export class SousChefChecklist extends Scenario {
  async run(): Promise<void> {
    const cook = new CookInteractor(); await cook.ready(); await cook.pinch('SousChef_Start');
    expect(enabledControl('SousChef_StartCooking')).toBe(false);
    const ingredients = ['400 g cooked rice, preferably day-old', '2 eggs', '150 g chicken breast, diced',
      '3 shallots', '3 garlic cloves', '2 red chilies', '2 tbsp kecap manis (sweet soy sauce)',
      '1 tsp shrimp paste (terasi), optional', '2 spring onions, sliced', 'Cooking oil, salt, and white pepper'];
    for (let index = 0; index < 10; index++) {
      includes('SousChef_Ingredient_' + index, ingredients[index]);
      const before = snapshot().model.readyCount;
      const visualBefore = label('SousChef_Ingredient_' + index);
      await cook.pinch('SousChef_Ingredient_' + index);
      expect(snapshot().model.readyCount).toBe(before + 1);
      expect(snapshot().model.checked[index]).toBe(true);
      expect(label('SousChef_Ingredient_' + index) !== visualBefore).toBe(true);
      includes('SousChef_Ingredient_' + index, '☑');
      includes('SousChef_ReadyCount', (before + 1) + ' of 10 ready');
      expect(enabledControl('SousChef_StartCooking')).toBe(index === 9);
    }
    await cook.pinch('SousChef_Ingredient_9');
    includes('SousChef_ReadyCount', '9 of 10 ready');
    expect(enabledControl('SousChef_StartCooking')).toBe(false);
    await cook.pinch('SousChef_Ingredient_9');
    await cook.pinch('SousChef_StartCooking');
    for (let index = 0; index < 7; index++) {
      await cook.step(index); await cook.pinch('SousChef_Ingredients'); activeView('checklist');
      expect(snapshot().model.checked.every(Boolean)).toBe(true);
      includes('SousChef_ReadyCount', '10 of 10 ready');
      includes('SousChef_Back', 'Back to Step ' + (index + 1));
      await cook.pinch('SousChef_Back'); activeView('recipe');
      expect(snapshot().model.stepIndex).toBe(index);
    }
    await cook.completion(); await cook.pinch('SousChef_Ingredients');
    activeView('checklist'); includes('SousChef_Back', 'Back to completion');
    await cook.pinch('SousChef_Back'); activeView('completion');
  }
}
