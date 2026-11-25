import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {CookInteractor, activeView, includes, snapshot, waitForLabel} from './SousChefLeafSupport';

@component
export class SousChefFullFlow extends Scenario {
  async run(): Promise<void> {
    const cook = new CookInteractor(); await cook.ready();
    includes('SousChef_WelcomeTitle', 'SousChef AR');
    includes('SousChef_WelcomeRecipe', 'Nasi Goreng Spesial');
    includes('SousChef_WelcomeMeta', 'Serves 2');
    await cook.pinch('SousChef_Start'); activeView('checklist');
    includes('SousChef_ReadyCount', '0 of 10 ready');
    await cook.pinch('SousChef_CookAnyway');
    const titles = ['Prep & check', 'Blend the spice paste', 'Scramble the eggs', 'Sear the chicken',
      'Fry the spice paste', 'Add rice & season', 'Finish & plate'];
    const instructions = [
      'Set out all ingredients and tick them off on the checklist.',
      'Blend the shallots, garlic, red chilies, and shrimp paste until smooth.',
      'Heat 1 tbsp oil, scramble the 2 eggs until just set, then set aside.',
      'Stir-fry the diced chicken until cooked through.',
      'Add a little oil and fry the paste until fragrant and the oil separates.',
      'Add the cooked rice, kecap manis, salt, and white pepper; toss on high heat until evenly coated.',
      'Return the eggs, add the spring onions, toss for 30 seconds, then plate with cucumber, fried shallots, and crackers.'
    ];
    for (let index = 0; index < titles.length; index++) {
      activeView('recipe');
      expect(snapshot().model.stepIndex).toBe(index);
      // UIKit Fit labels reveal after measurement, independently of the model update.
      await waitForLabel('SousChef_StepLabel', 'Step ' + (index + 1) + ' of 7');
      await waitForLabel('SousChef_StepTitle', titles[index]);
      await waitForLabel('SousChef_Instruction', instructions[index]);
      await cook.pinch('SousChef_Next');
    }
    activeView('completion');
    await waitForLabel('SousChef_CompletionTitle', 'Nasi Goreng Spesial is ready to plate');
    await waitForLabel('SousChef_CompletionProgress', '7 of 7 steps completed');
    await waitForLabel('SousChef_CompletionGarnish', 'cucumber');
    includes('SousChef_CompletionGarnish', 'fried shallots');
    includes('SousChef_CompletionGarnish', 'crackers');
  }
}
