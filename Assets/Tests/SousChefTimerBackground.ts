import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {CookInteractor, activeView, includes, snapshot, timer, waitUntil, waitForLabel} from './SousChefLeafSupport';

@component
export class SousChefTimerBackground extends Scenario {
  async run(): Promise<void> {
    const cook = new CookInteractor(); await cook.ready(); await cook.recipe(); await cook.step(2);
    await cook.pinch('SousChef_Timer'); const initial = timer(2).remainingSeconds;
    await cook.pinch('SousChef_Next'); await sleep(1600);
    expect(timer(2).remainingSeconds < initial - 1).toBe(true);
    const nextStepRemaining = timer(2).remainingSeconds;
    await cook.pinch('SousChef_Ingredients'); activeView('checklist'); await sleep(1600);
    expect(timer(2).remainingSeconds < nextStepRemaining - 1).toBe(true);
    const before = snapshot().chimeCount;
    await waitUntil(() => timer(2).status === 'done', 65, 'background 60-second timer expiry');
    expect(snapshot().chimeCount).toBe(before + 1); activeView('checklist');
    await waitForLabel('SousChef_TimerAlert', 'Timer done'); includes('SousChef_TimerAlert', 'Step 3: Scramble the eggs');
    expect(snapshot().model.stepIndex).toBe(3);
    await sleep(1200); activeView('checklist'); // alert never navigates on its own
    await cook.pinch('SousChef_TimerAlert'); activeView('recipe');
    expect(snapshot().model.stepIndex).toBe(2); expect(snapshot().pendingAlerts.length).toBe(0);
    includes('SousChef_Timer', '0:00'); includes('SousChef_Timer', 'Done');
  }
}
