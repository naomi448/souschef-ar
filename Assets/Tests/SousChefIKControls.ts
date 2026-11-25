import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {createIKInteractor} from 'Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar';
import {DiagnosticRecorder} from 'Leaf.lspkg/Diagnostic/DiagnosticRecorder';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {CookInteractor, activeView} from './SousChefLeafSupport';

@component
export class SousChefIKControls extends Scenario {
  async run(): Promise<void> {
    const cook = new CookInteractor(); await cook.ready();
    const recorder = DiagnosticRecorder.getInstance();
    recorder.setPolicy('fail-fast');
    const ik = createIKInteractor({avatar: {debugOverlay: false}, body: {fallback: undefined}});
    const start = findInteractablesByName('SousChef_Start', undefined, true)[0];
    if (!start) throw new Error('Start is not an active Interactable');
    await ik.trigger(start); expect(recorder.hasErrors()).toBe(false); activeView('checklist');
    const item = findInteractablesByName('SousChef_Ingredient_0', undefined, true)[0];
    if (!item) throw new Error('Ingredient 0 is not an active Interactable');
    await ik.trigger(item); expect(recorder.hasErrors()).toBe(false);
    print('SousChef IK controls: diagnostic-free input convergence; physical hand-tracking feel remains unproven.');
  }
}
