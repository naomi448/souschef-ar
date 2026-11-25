import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {CookInteractor, activeView, enabledControl, includes, snapshot} from './SousChefLeafSupport';

@component
export class SousChefNavigation extends Scenario {
  async run(): Promise<void> {
    const cook = new CookInteractor(); await cook.ready(); await cook.recipe();
    expect(enabledControl('SousChef_Previous')).toBe(false);
    for (let index = 0; index < 6; index++) {
      const before = snapshot().model.stepIndex;
      await cook.pinch('SousChef_Next');
      expect(snapshot().model.stepIndex).toBe(before + 1);
      includes('SousChef_StepLabel', 'Step ' + (before + 2) + ' of 7');
      await cook.pinch('SousChef_Previous');
      expect(snapshot().model.stepIndex).toBe(before);
      includes('SousChef_StepLabel', 'Step ' + (before + 1) + ' of 7');
      await cook.pinch('SousChef_Next');
    }
    await cook.pinch('SousChef_Next'); activeView('completion');
  }
}
