import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName, sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {SousChefMain} from '../Scripts/SousChefMain';
import {SousChefSnapshot, SousChefView} from '../Scripts/SousChefTypes';

// Names confirmed by SousChefUIHosts.json and the authored root contract.
export const VIEW_HOSTS = ['SousChef_WelcomeView', 'SousChef_ChecklistView',
  'SousChef_RecipeView', 'SousChef_CompletionView'];
export const VIEW_NAMES: SousChefView[] = ['welcome', 'checklist', 'recipe', 'completion'];
export function object(name: string): SceneObject {
  const result = findSceneObjectByName(name);
  if (!result) throw new Error('Missing authored object: ' + name);
  return result;
}
export function main(): SousChefMain {
  const result = object('SousChefRoot').getComponent(SousChefMain.getTypeName());
  if (!result) throw new Error('SousChefMain is not attached to SousChefRoot');
  return result;
}
export function snapshot(): SousChefSnapshot { return main().getSnapshot(); }
export function texts(root: SceneObject, visibleOnly = true): Text[] {
  if (visibleOnly && !root.isEnabledInHierarchy) return [];
  let result = root.getComponents('Component.Text') as Text[];
  for (let i = 0; i < root.getChildrenCount(); i++) result = result.concat(texts(root.getChild(i), visibleOnly));
  return result.filter(text => !visibleOnly || text.enabled);
}
export function label(name: string): string {
  const result = texts(object(name)).map(text => text.text).join('\n');
  if (!result) throw new Error('No visible text below ' + name);
  return result;
}
export function includes(name: string, value: string): void {
  expect(label(name).includes(value)).toBe(true);
}
export function activeView(view: SousChefView): void {
  expect(snapshot().model.view).toBe(view);
  expect(VIEW_HOSTS.filter(name => object(name).isEnabledInHierarchy).length).toBe(1);
  expect(object(VIEW_HOSTS[VIEW_NAMES.indexOf(view)]).isEnabledInHierarchy).toBe(true);
}
export function enabledControl(name: string): boolean {
  return findInteractablesByName(name, undefined, true).length > 0;
}
export function timer(index: number) {
  const result = snapshot().timers.find(item => item.stepIndex === index);
  if (!result) throw new Error('Missing timer for step ' + (index + 1));
  return result;
}
export async function waitUntil(test: () => boolean, timeoutSeconds: number, description: string, pollMs = 100): Promise<void> {
  const deadline = getTime() + timeoutSeconds;
  while (!test()) {
    if (getTime() > deadline) throw new Error('Timed out: ' + description);
    await sleep(pollMs);
  }
}
/** UIKit TextSizing.Fit commits a new label after measurement, after model expiry.
 * Observe the enabled renderable, rather than treating a model update as a rendered frame. */
export async function waitForLabel(name: string, value: string): Promise<void> {
  const startedAt = getTime();
  await waitUntil(() => texts(object(name)).some(text =>
    text.text.includes(value) && text.textFill.color.a > 0),
    1, 'visible ' + name + ' containing ' + value, 25);
  includes(name, value);
  print('[SousChefLEAF] Visible ' + name + ' after ' + Math.round((getTime() - startedAt) * 1000) + ' ms');
}
export class CookInteractor extends DefaultLeafInteractor {
  constructor() { super('SousChefLEAFInteractor'); this.eventTimeoutMs = 5000; }
  async pinch(name: string): Promise<void> {
    const target = findInteractablesByName(name, undefined, true)[0];
    if (!target) throw new Error('Control not enabled for pinch: ' + name);
    await this.trigger(target);
    await sleep(100);
  }
  async ready(): Promise<void> {
    await waitUntil(() => !!findSceneObjectByName('SousChef_Start') && findInteractablesByName('SousChef_Start').length > 0, 12, 'UI initialization');
    // Every scenario establishes a clean recipe by real navigation and Restart if needed.
    if (snapshot().model.view !== 'welcome') await this.restart();
    activeView('welcome');
  }
  async recipe(): Promise<void> {
    await this.pinch('SousChef_Start');
    await this.pinch('SousChef_CookAnyway');
    activeView('recipe');
  }
  async step(index: number): Promise<void> {
    if (snapshot().model.view === 'completion') {
      if (!snapshot().model.alert) throw new Error('Cannot go backwards from completion without an alert');
      await this.pinch('SousChef_TimerAlert');
    }
    if (snapshot().model.view === 'checklist') await this.pinch('SousChef_Back');
    while (snapshot().model.stepIndex < index) await this.pinch('SousChef_Next');
    while (snapshot().model.stepIndex > index) await this.pinch('SousChef_Previous');
    activeView('recipe');
    includes('SousChef_StepLabel', 'Step ' + (index + 1) + ' of 7');
  }
  async completion(): Promise<void> {
    if (snapshot().model.view === 'checklist') {
      if (snapshot().model.returnLabel) await this.pinch('SousChef_Back');
      else await this.pinch('SousChef_CookAnyway');
    }
    if (snapshot().model.view === 'welcome') await this.recipe();
    if (snapshot().model.view === 'recipe') {
      await this.step(6);
      await this.pinch('SousChef_Next');
    }
    activeView('completion');
  }
  async restart(): Promise<void> {
    await this.completion();
    await this.pinch('SousChef_Restart');
    activeView('welcome');
  }
}

/** Observe rendered ring state, never write it. Segment color/scale/enable changes are visible evidence. */
export function ringSignature(): string {
  const values: string[] = [];
  const visit = (node: SceneObject) => {
    const scale = node.getTransform().getLocalScale();
    values.push(node.name + ':' + node.enabled + ':' + scale.x + ',' + scale.y + ',' + scale.z);
    for (const text of node.getComponents('Component.Text') as Text[]) {
      const color = text.textFill.color;
      values.push(text.text + ':' + [color.x, color.y, color.z, color.w].join(','));
    }
    for (const mesh of node.getComponents('Component.RenderMeshVisual') as RenderMeshVisual[]) {
      if (mesh.getMaterialsCount() > 0) {
        const color = mesh.getMaterial(0).mainPass.baseColor as vec4;
        if (color) values.push([color.x, color.y, color.z, color.w].join(','));
      }
    }
    for (let i = 0; i < node.getChildrenCount(); i++) visit(node.getChild(i));
  };
  visit(object('SousChef_TimerRing'));
  return values.join('|');
}
