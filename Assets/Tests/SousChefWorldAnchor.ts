import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {CookInteractor, activeView, object, snapshot, texts, VIEW_HOSTS} from './SousChefLeafSupport';

@component
export class SousChefWorldAnchor extends Scenario {
  async run(): Promise<void> {
    const cook = new CookInteractor(); await cook.ready();
    const panel = object('SousChefPanelRoot').getTransform();
    const camera = object('Camera Object').getTransform();
    const initialPosition = panel.getWorldPosition(), initialRotation = panel.getWorldRotation();
    const cameraPosition = camera.getWorldPosition(), cameraRotation = camera.getWorldRotation();
    expect(Math.abs(initialPosition.x - cameraPosition.x - 10) < 3).toBe(true);
    expect(Math.abs(initialPosition.y - cameraPosition.y + 25) < 3).toBe(true);
    expect(Math.abs(initialPosition.z - cameraPosition.z + 130) < 3).toBe(true);
    try {
      camera.setWorldPosition(cameraPosition.add(new vec3(20, 5, 0)));
      camera.setWorldRotation(quat.angleAxis(0.15, vec3.up()).multiply(cameraRotation));
      await sleep(500);
      const moved = camera.getWorldPosition().distance(cameraPosition);
      if (moved < 10) throw new Error('Tracking overrode LEAF camera movement; world-anchor movement assertion unverified. Run main-agent MovePreviewCamera proof.');
      expect(panel.getWorldPosition().distance(initialPosition) < 0.1).toBe(true);
      expect(Math.abs(panel.getWorldRotation().dot(initialRotation)) > 0.9999).toBe(true);
    } finally {
      camera.setWorldPosition(cameraPosition); camera.setWorldRotation(cameraRotation); await sleep(100);
    }
    for (const view of ['welcome', 'checklist', 'recipe', 'completion'] as const) {
      if (view === 'checklist') await cook.pinch('SousChef_Start');
      if (view === 'recipe') await cook.pinch('SousChef_CookAnyway');
      if (view === 'completion') await cook.completion();
      activeView(view);
      expect(panel.getWorldPosition().distance(initialPosition) < 0.1).toBe(true);
      const activeHost = object(VIEW_HOSTS[['welcome', 'checklist', 'recipe', 'completion'].indexOf(snapshot().model.view)]);
      const visibleText = texts(activeHost);
      expect(visibleText.length > 0).toBe(true);
      for (const text of visibleText) expect(text.size > 0).toBe(true);
    }
    print('SousChef criterion 5: world pose and one active view verified. Perceptual readability still requires preview screenshots; hardware comfort is unproven.');
  }
}
