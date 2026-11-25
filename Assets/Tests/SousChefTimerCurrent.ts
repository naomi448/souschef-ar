import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {CookInteractor, activeView, includes, label, main, ringSignature, snapshot, timer, waitUntil, waitForLabel} from './SousChefLeafSupport';

@component
export class SousChefTimerCurrent extends Scenario {
  async run(): Promise<void> {
    const cook = new CookInteractor(); await cook.ready(); await cook.recipe();
    expect(snapshot().model.timer).toBeNull(); await cook.step(1);
    expect(snapshot().model.timer).toBeNull(); await cook.step(6);
    const idle = timer(6); await sleep(1500);
    expect(timer(6).remainingSeconds).toBe(idle.remainingSeconds);
    expect(timer(6).status).toBe('idle'); includes('SousChef_Timer', '0:30');
    const ringBefore = ringSignature(); const digitsBefore = label('SousChef_Timer');
    await cook.pinch('SousChef_Timer'); await sleep(3200);
    expect(timer(6).status).toBe('running');
    expect(timer(6).remainingSeconds < idle.remainingSeconds - 2).toBe(true);
    expect(timer(6).progress > idle.progress).toBe(true);
    expect(label('SousChef_Timer') !== digitsBefore).toBe(true);
    expect(ringSignature() !== ringBefore).toBe(true);
    await cook.pinch('SousChef_Timer');
    const paused = timer(6); const pausedRing = ringSignature(); const pausedDigits = label('SousChef_Timer');
    expect(paused.status).toBe('paused'); includes('SousChef_Timer', 'Resume');
    await sleep(1600);
    expect(timer(6).remainingSeconds).toBeCloseTo(paused.remainingSeconds, 2);
    expect(ringSignature()).toBe(pausedRing); expect(label('SousChef_Timer')).toBe(pausedDigits);
    await cook.pinch('SousChef_Timer'); expect(timer(6).status).toBe('running');
    const chimes = snapshot().chimeCount;
    await waitUntil(() => timer(6).status === 'done', 33, 'real 30-second timer expiry', 30);
    expect(snapshot().chimeCount).toBe(chimes + 1);
    expect(main().timerChime.isPlaying()).toBe(true);
    await waitForLabel('SousChef_Notice', 'Time to move on');
    includes('SousChef_Timer', '0:00'); includes('SousChef_Timer', 'Done');
    expect(timer(6).progress).toBe(1); activeView('recipe');
    expect(snapshot().model.stepIndex).toBe(6);
    await sleep(3300); expect(snapshot().model.notice).toBe('');
    includes('SousChef_Timer', 'Done');
  }
}
