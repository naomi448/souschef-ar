import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {CookInteractor, activeView, includes, snapshot, timer, waitUntil, waitForLabel} from './SousChefLeafSupport';

@component
export class SousChefTimerCompletion extends Scenario {
  async run(): Promise<void> {
    const cook = new CookInteractor(); await cook.ready(); await cook.recipe(); await cook.step(5);
    await cook.pinch('SousChef_Timer'); await cook.step(6); await cook.pinch('SousChef_Timer');
    await cook.pinch('SousChef_Next'); activeView('completion');
    const running = timer(5).remainingSeconds;
    includes('SousChef_LiveTimers', 'Step 6 timer still running');
    includes('SousChef_LiveTimers', 'Step 7 timer still running');
    await sleep(1500); expect(timer(5).remainingSeconds < running - 1).toBe(true);
    const chimes = snapshot().chimeCount;
    await waitUntil(() => timer(6).status === 'done', 34, 'timer finishing on completion');
    activeView('completion'); expect(snapshot().chimeCount).toBe(chimes + 1);
    await waitForLabel('SousChef_TimerAlert', 'Step 7: Finish & plate');
    includes('SousChef_LiveTimers', 'Step 6 timer still running');
    await cook.pinch('SousChef_TimerAlert'); activeView('recipe');
    expect(snapshot().model.stepIndex).toBe(6); includes('SousChef_Timer', 'Done');
    expect(timer(5).status).toBe('running');
    await cook.completion(); await cook.pinch('SousChef_Ingredients');
    const before = timer(5).remainingSeconds; await sleep(1200);
    expect(timer(5).remainingSeconds < before - 1).toBe(true);
    includes('SousChef_Back', 'Back to completion'); await cook.pinch('SousChef_Back');
    activeView('completion'); expect(timer(5).status).toBe('running');
  }
}
