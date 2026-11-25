/** Owns recipe navigation, checklist, timers and alert state. Consumes authored UI and audio inputs;
 * never constructs UI, relocates the panel, or changes scene geometry. */
import {SousChefUI} from './SousChefUI';
import {formatTimer, INGREDIENTS, RECIPE_STEPS, SousChefAction, SousChefSnapshot,
  SousChefTimerStatus, SousChefTimerView, SousChefView, SousChefViewModel} from './SousChefTypes';

interface TimerState {
  stepIndex: number;
  totalSeconds: number;
  remainingSeconds: number;
  status: SousChefTimerStatus;
  deadline: number;
}

@component
export class SousChefMain extends BaseScriptComponent {
  @input ui!: SousChefUI;
  @input timerChime!: AudioComponent;
  @input debugColliders: boolean = false;
  @input chimeVolume: number = 0.35;
  @input noticeDuration: number = 3;

  private view: SousChefView = 'welcome';
  private stepIndex = 0;
  private checked: boolean[] = INGREDIENTS.map(() => false);
  private returnView: 'recipe' | 'completion' | null = null;
  private returnStep = 0;
  private started = false;
  private timers: TimerState[] = this.freshTimers();
  private pendingAlerts: number[] = [];
  private chimeCount = 0;
  private noticeStep = -1;
  private noticeUntil = 0;

  onAwake(): void {
    if (!this.ui || !this.timerChime) {
      print('SousChefMain: ui and timerChime inputs must be wired.');
      return;
    }
    this.createEvent('OnStartEvent').bind(() => this.onStart());
    this.createEvent('UpdateEvent').bind(() => this.onUpdate());
  }

  private onStart(): void {
    // Next frame ensures the UI has completed its own OnStartEvent.
    const ready = this.createEvent('DelayedCallbackEvent');
    ready.bind(() => {
      this.ui.onAction.add(action => this.handleAction(action));
      this.timerChime.playbackMode = Audio.PlaybackMode.LowLatency;
      this.timerChime.volume = Math.max(0, Math.min(1, this.chimeVolume));
      this.started = true;
      if (this.debugColliders) this.setColliderDebugAll(this.getSceneObject(), true);
      this.paint();
    });
    ready.reset(0);
  }

  private handleAction(action: SousChefAction): void {
    if (!this.started) return;
    // Account for elapsed time before an input so a just-expired chip cannot be paused.
    this.updateTimers(getTime());
    switch (action.type) {
      case 'start':
        if (this.view !== 'welcome') return;
        this.returnView = null;
        this.view = 'checklist';
        break;
      case 'toggleIngredient': {
        const index = action.index;
        if (this.view !== 'checklist' || index === undefined || !Number.isInteger(index) || index < 0 || index >= this.checked.length) return;
        this.checked[index] = !this.checked[index];
        break;
      }
      case 'startCooking':
        if (this.view !== 'checklist' || this.returnView !== null || !this.checked.every(Boolean)) return;
        this.goToStep(0);
        break;
      case 'cookAnyway':
        if (this.view !== 'checklist' || this.returnView !== null) return;
        this.goToStep(0);
        break;
      case 'ingredients':
        if (this.view !== 'recipe' && this.view !== 'completion') return;
        this.returnView = this.view;
        this.returnStep = this.stepIndex;
        this.view = 'checklist';
        break;
      case 'back':
        if (this.view !== 'checklist' || !this.returnView) return;
        if (this.returnView === 'completion') this.view = 'completion';
        else this.goToStep(this.returnStep);
        break;
      case 'previous':
        if (this.view !== 'recipe' || this.stepIndex === 0) return;
        this.goToStep(this.stepIndex - 1);
        break;
      case 'next':
        if (this.view !== 'recipe') return;
        if (this.stepIndex === RECIPE_STEPS.length - 1) this.view = 'completion';
        else this.goToStep(this.stepIndex + 1);
        break;
      case 'timer':
        if (this.view !== 'recipe') return;
        this.toggleTimer();
        break;
      case 'jumpAlert':
        if (this.pendingAlerts.length === 0) return;
        this.goToStep(this.pendingAlerts[0]);
        break;
      case 'restart':
        if (this.view !== 'completion') return;
        this.view = 'welcome';
        this.stepIndex = 0;
        this.checked = INGREDIENTS.map(() => false);
        this.returnView = null;
        this.returnStep = 0;
        this.timers = this.freshTimers();
        this.pendingAlerts = [];
        this.noticeStep = -1;
        this.noticeUntil = 0;
        this.chimeCount = 0;
        this.timerChime.stop(false);
        break;
    }
    this.paint();
  }

  private goToStep(index: number): void {
    this.view = 'recipe';
    this.stepIndex = index;
    this.pendingAlerts = this.pendingAlerts.filter(pending => pending !== index);
  }

  public getSnapshot(): SousChefSnapshot {
    return {
      model: this.makeViewModel(),
      timers: this.timers.map(timer => this.timerView(timer)),
      pendingAlerts: this.pendingAlerts.slice(),
      chimeCount: this.chimeCount
    };
  }

  private freshTimers(): TimerState[] {
    return RECIPE_STEPS.map((step, stepIndex) => ({
      stepIndex, totalSeconds: step.seconds, remainingSeconds: step.seconds,
      status: 'idle' as SousChefTimerStatus, deadline: 0
    })).filter(timer => timer.totalSeconds > 0);
  }

  private toggleTimer(): void {
    const timer = this.timers.find(value => value.stepIndex === this.stepIndex);
    if (!timer || timer.status === 'done') return;
    const now = getTime();
    if (timer.status === 'running') {
      timer.remainingSeconds = Math.max(0, timer.deadline - now);
      timer.status = 'paused';
      timer.deadline = 0;
    } else {
      timer.status = 'running';
      timer.deadline = now + timer.remainingSeconds;
    }
  }

  private onUpdate(): void {
    if (!this.started) return;
    this.updateTimers(getTime());
    this.paint();
  }

  private updateTimers(now: number): void {
    // Deadline order preserves FIFO even if several expire during one long frame.
    const due = this.timers.filter(timer => timer.status === 'running' && timer.deadline <= now)
      .sort((a, b) => a.deadline - b.deadline || a.stepIndex - b.stepIndex);
    for (const timer of due) {
      timer.remainingSeconds = 0;
      timer.status = 'done';
      timer.deadline = 0;
      this.timerChime.play(1);
      this.chimeCount++;
      if (this.view === 'recipe' && this.stepIndex === timer.stepIndex) {
        this.noticeStep = timer.stepIndex;
        this.noticeUntil = now + Math.max(0.5, this.noticeDuration);
      } else if (this.pendingAlerts.indexOf(timer.stepIndex) === -1) {
        this.pendingAlerts.push(timer.stepIndex);
      }
    }
  }

  private remaining(timer: TimerState): number {
    return timer.status === 'running' ? Math.max(0, timer.deadline - getTime()) : timer.remainingSeconds;
  }

  private timerView(timer: TimerState): SousChefTimerView {
    const remainingSeconds = this.remaining(timer);
    const verb = timer.status === 'idle' ? 'Start' : timer.status === 'running' ? 'Pause' :
      timer.status === 'paused' ? 'Resume' : 'Done';
    return {
      stepIndex: timer.stepIndex, totalSeconds: timer.totalSeconds,
      remainingSeconds, status: timer.status,
      label: formatTimer(remainingSeconds) + ' — ' + verb,
      progress: Math.max(0, Math.min(1, 1 - remainingSeconds / timer.totalSeconds))
    };
  }

  private makeViewModel(): SousChefViewModel {
    const step = RECIPE_STEPS[this.stepIndex];
    let title = 'SousChef AR';
    let subtitle = 'Nasi Goreng Spesial';
    let body = 'Serves 2 · about 25 minutes';
    if (this.view === 'checklist') {
      title = 'Ingredients'; subtitle = 'Nasi Goreng Spesial'; body = '';
    } else if (this.view === 'recipe') {
      title = step.name; subtitle = 'Nasi Goreng Spesial'; body = step.instruction;
    } else if (this.view === 'completion') {
      title = 'Done — Nasi Goreng Spesial is ready to plate';
      subtitle = '7 of 7 steps completed';
      body = 'Garnish with cucumber, fried shallots, and crackers';
    }
    const timer = this.timers.find(value => value.stepIndex === this.stepIndex);
    const oldestAlert = this.pendingAlerts[0];
    return {
      view: this.view, stepIndex: this.stepIndex, title, subtitle, body,
      stepLabel: 'Step ' + (this.stepIndex + 1) + ' of 7',
      ingredients: INGREDIENTS.slice(), checked: this.checked.slice(),
      readyCount: this.checked.filter(Boolean).length,
      canStart: this.checked.every(Boolean),
      returnLabel: this.returnView === 'completion' ? 'Back to completion' :
        this.returnView === 'recipe' ? 'Back to Step ' + (this.returnStep + 1) : null,
      previousEnabled: this.stepIndex > 0,
      nextLabel: this.stepIndex === 6 ? 'Finish' : 'Next',
      timer: this.view === 'recipe' && timer ? this.timerView(timer) : null,
      alert: oldestAlert === undefined ? null : {
        stepIndex: oldestAlert,
        label: 'Timer done — Step ' + (oldestAlert + 1) + ': ' + RECIPE_STEPS[oldestAlert].name
      },
      notice: this.view === 'recipe' && this.stepIndex === this.noticeStep && getTime() < this.noticeUntil ?
        'Time to move on' : '',
      liveTimers: this.timers.filter(value => value.status === 'running' || value.status === 'paused')
        .map(value => 'Step ' + (value.stepIndex + 1) + ' timer ' +
          (value.status === 'running' ? 'still running' : 'paused') + ' — ' + formatTimer(this.remaining(value)) + ' left')
    };
  }

  private paint(): void {
    if (this.started) this.ui.render(this.makeViewModel());
  }

  private setColliderDebugAll(obj: SceneObject, enable: boolean): void {
    const collider = obj.getComponent('Physics.ColliderComponent') as ColliderComponent | null;
    if (collider) collider.debugDrawEnabled = enable;
    const body = obj.getComponent('Physics.BodyComponent') as ColliderComponent | null;
    if (body) body.debugDrawEnabled = enable;
    for (let index = 0; index < obj.getChildrenCount(); index++) {
      this.setColliderDebugAll(obj.getChild(index), enable);
    }
  }
}
