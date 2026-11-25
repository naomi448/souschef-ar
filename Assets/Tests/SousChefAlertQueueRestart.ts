import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {CookInteractor, activeView, includes, snapshot, timer, waitUntil} from './SousChefLeafSupport';

@component
export class SousChefAlertQueueRestart extends Scenario {
  async run(): Promise<void> {
    const cook = new CookInteractor(); await cook.ready(); await cook.recipe(); await cook.step(2);
    await cook.pinch('SousChef_Timer');
    await cook.step(6); await cook.pinch('SousChef_Timer'); await cook.pinch('SousChef_Ingredients');
    await waitUntil(() => timer(2).status === 'done' && timer(6).status === 'done', 65, 'both real timers finish');
    activeView('checklist'); expect(snapshot().pendingAlerts).toEqual([6, 2]);
    includes('SousChef_TimerAlert', 'Step 7: Finish & plate');
    // Consume first by pinch; second is then shown, never a second panel.
    await cook.pinch('SousChef_TimerAlert'); activeView('recipe');
    expect(snapshot().model.stepIndex).toBe(6); expect(snapshot().pendingAlerts).toEqual([2]);
    includes('SousChef_TimerAlert', 'Step 3: Scramble the eggs');
    // Normal arrival, rather than alert pinch, clears the remaining pending alert.
    await cook.step(2); expect(snapshot().pendingAlerts.length).toBe(0);
    includes('SousChef_Timer', 'Done');
    await cook.step(3); await cook.pinch('SousChef_Timer'); // live timer must be cancelled by Restart
    await cook.pinch('SousChef_Ingredients'); await cook.pinch('SousChef_Ingredient_0');
    await cook.pinch('SousChef_Back'); await cook.completion(); await cook.pinch('SousChef_Restart');
    activeView('welcome'); const reset = snapshot();
    expect(reset.model.stepIndex).toBe(0); expect(reset.model.readyCount).toBe(0);
    expect(reset.pendingAlerts.length).toBe(0); expect(reset.chimeCount).toBe(0);
    for (const clock of reset.timers) {
      expect(clock.status).toBe('idle'); expect(clock.remainingSeconds).toBe(clock.totalSeconds);
    }
    await sleep(1200); expect(snapshot().timers).toEqual(reset.timers);
    await cook.pinch('SousChef_Start'); includes('SousChef_ReadyCount', '0 of 10 ready');
  }
}
