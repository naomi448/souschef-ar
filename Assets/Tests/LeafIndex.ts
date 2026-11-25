import {scenariosIndex} from 'Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator';
import {ScenarioMetadata} from 'Leaf.lspkg/Scenarios/scenario/ScenarioMetadata';
import {SousChefFullFlow} from './SousChefFullFlow';
import {SousChefChecklist} from './SousChefChecklist';
import {SousChefNavigation} from './SousChefNavigation';
import {SousChefTimerCurrent} from './SousChefTimerCurrent';
import {SousChefTimerBackground} from './SousChefTimerBackground';
import {SousChefTimerCompletion} from './SousChefTimerCompletion';
import {SousChefAlertQueueRestart} from './SousChefAlertQueueRestart';
import {SousChefWorldAnchor} from './SousChefWorldAnchor';
import {SousChefIKControls} from './SousChefIKControls';

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: 'souschef-full-flow', typename: SousChefFullFlow.getTypeName()},
    {id: 'souschef-checklist', typename: SousChefChecklist.getTypeName()},
    {id: 'souschef-navigation', typename: SousChefNavigation.getTypeName()},
    {id: 'souschef-timer-current', typename: SousChefTimerCurrent.getTypeName()},
    {id: 'souschef-timer-background', typename: SousChefTimerBackground.getTypeName()},
    {id: 'souschef-timer-completion', typename: SousChefTimerCompletion.getTypeName()},
    {id: 'souschef-alert-queue-restart', typename: SousChefAlertQueueRestart.getTypeName()},
    {id: 'souschef-world-anchor', typename: SousChefWorldAnchor.getTypeName()},
    {id: 'souschef-ik-controls', typename: SousChefIKControls.getTypeName()}
  ];
}
