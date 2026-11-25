import Event, {PublicApi} from "InteractionKit.lspkg/Utils/Event";
import {Frame} from "UIKit.lspkg/Scripts/Components/Frame/Frame";
import {Button} from "UIKit.lspkg/Scripts/Components/Button/Button";
import {ElementContent, TextAlignment, TextSizing} from "UIKit.lspkg/Scripts/Components/Content/ElementContent";
import {addContentToElement} from "UIKit.lspkg/Scripts/Components/Content/ElementContentFactory";
import {FlexLayout} from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout";
import {FlexItem} from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem";
import {FlexAlign, FlexAlignSelf, FlexDirection, FlexJustify} from "UIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes";
import {GridLayout} from "UIKit.lspkg/Scripts/Components/Layout2D/Grid/GridLayout";
import {GridItem} from "UIKit.lspkg/Scripts/Components/Layout2D/Grid/GridItem";
import {CanvasController} from "UIKit.lspkg/Scripts/Utility/CanvasController";
import {INGREDIENTS, SousChefAction, SousChefViewModel} from "./SousChefTypes";

/** Passive UIKit presentation. Every named host is authored in the saved scene. */
@component
export class SousChefUI extends BaseScriptComponent {
  @input @hint("Recipe instruction text size. The panel remains fixed at the stove.")
  bodyTextSize: number = 30;

  private actions = new Event<SousChefAction>();
  readonly onAction: PublicApi<SousChefAction> = this.actions.publicApi();
  private hosts = new Map<string, SceneObject>();
  private labels = new Map<string, ElementContent>();
  private buttons = new Map<string, Button>();
  private layouts: FlexLayout[] = [];
  private grid: GridLayout | null = null;
  private model: Readonly<SousChefViewModel> | null = null;
  private ready = false;
  private ringDots: ElementContent[] = [];
  private lastView = "";
  private lastLayoutKey = "";
  private light = new vec4(1, 0.97, 0.9, 1);
  private amber = new vec4(1, 0.73, 0.35, 1);

  onAwake(): void {
    this.createEvent("OnStartEvent").bind(() => this.start());
    this.createEvent("UpdateEvent").bind(() => {
      if (this.ready && this.model && this.model.alert) {
        const alert = this.labels.get("SousChef_TimerAlert");
        if (alert) alert.opacity = 0.82 + 0.18 * Math.sin(getTime() * 3);
      }
    });
  }

  render(model: Readonly<SousChefViewModel>): void {
    this.model = model;
    if (this.ready) this.paint(model);
  }

  private start(): void {
    this.indexHosts(this.getSceneObject());
    const content = this.host("SousChef_ContentRoot");
    content.getTransform().setLocalPosition(new vec3(0, 0, 0.10));
    new CanvasController(this.getSceneObject()).ensure(new vec2(40, 24));
    const frame = this.getSceneObject().createComponent(Frame.getTypeName()) as Frame;
    frame.allowTranslation = false;
    frame.allowScaling = false;
    frame.onInitialized.add(() => {
      frame.innerSize = new vec2(38, 22);
      frame.showCloseButton = false;
      frame.showFollowButton = false;
      frame.setUseFollow(false);
      frame.setFollowing(false);
      frame.suspendFollow("fixed-cooking-station");
      this.build();
      this.ready = true;
      if (this.model) this.paint(this.model);
      print("[SousChefUI] Authored UIKit panel ready");
    });
  }

  private build(): void {
    this.column("SousChef_ContentRoot", 38, 22, 0.15);
    this.column("SousChef_WelcomeView", 38, 17.5, 0.25);
    this.item("SousChef_WelcomeView", 38, 17.5);
    this.label("SousChef_WelcomeTitle", "SousChef AR", 38, 3, 44);
    this.label("SousChef_WelcomeRecipe", "Nasi Goreng Spesial", 38, 2.8, 39);
    this.label("SousChef_WelcomeMeta", "Serves 2 · about 25 minutes", 38, 2.2, 30);
    this.label("SousChef_PanIllustration", "◯━━", 38, 4.2, 60);
    this.button("SousChef_Start", "Start", 38, 3.4, {type: "start"});

    this.column("SousChef_ChecklistView", 38, 18.9, 0.15);
    this.item("SousChef_ChecklistView", 38, 18.9);
    this.label("SousChef_ChecklistTitle", "Ingredients", 38, 2.2, 38);
    this.label("SousChef_ReadyCount", "0 of 10 ready.", 38, 1.6, 27);
    const gridHost = this.host("SousChef_ChecklistGrid");
    this.item("SousChef_ChecklistGrid", 38, 11.7);
    this.grid = gridHost.createComponent(GridLayout.getTypeName()) as GridLayout;
    this.grid.width = 38; this.grid.height = 11.7;
    this.grid.templateColumns = "1fr 1fr";
    this.grid.templateRows = "repeat(5, 1fr)";
    this.grid.columnGap = 0.55; this.grid.rowGap = 0.15;
    const gridItems: GridItem[] = [];
    for (let i = 0; i < 10; i++) {
      const name = "SousChef_Ingredient_" + i;
      this.button(name, "☐ " + INGREDIENTS[i], 18.7, 2.2, {type: "toggleIngredient", index: i}, 23, false);
      const item = this.host(name).createComponent(GridItem.getTypeName()) as GridItem;
      item.autoPlacement = false; item.gridRow = i % 5 + 1; item.gridColumn = Math.floor(i / 5) + 1;
      gridItems.push(item);
    }
    this.grid.addItems(gridItems);
    this.row("SousChef_ChecklistActions", 38, 2.8, 0.6);
    this.item("SousChef_ChecklistActions", 38, 2.8);
    this.button("SousChef_StartCooking", "Start cooking", 18.7, 2.8, {type: "startCooking"}, 30);
    this.button("SousChef_CookAnyway", "Cook anyway", 18.7, 2.8, {type: "cookAnyway"}, 30);
    this.button("SousChef_Back", "Back", 38, 2.8, {type: "back"}, 30);

    this.column("SousChef_RecipeView", 38, 15.9, 0.12);
    this.item("SousChef_RecipeView", 38, 15.9);
    this.label("SousChef_StepLabel", "Step 1 of 7", 38, 1.6, 27);
    this.label("SousChef_StepTitle", "Prep & check", 38, 2.6, 39);
    this.row("SousChef_NavigationRow", 38, 6.6, 0.55);
    this.item("SousChef_NavigationRow", 38, 6.6);
    this.button("SousChef_Previous", "‹", 3.4, 6.6, {type: "previous"}, 46);
    this.label("SousChef_Instruction", "", 30.1, 6.6, this.bodyTextSize > 0 ? this.bodyTextSize : 30);
    this.button("SousChef_Next", "›", 3.4, 6.6, {type: "next"}, 46);
    this.row("SousChef_TimerRow", 38, 3.2, 0.8);
    this.item("SousChef_TimerRow", 38, 3.2);
    this.item("SousChef_TimerRing", 3.2, 3.2);
    this.button("SousChef_Timer", "1:00 — Start", 34, 3.2, {type: "timer"}, 34);
    this.buildRing();
    this.label("SousChef_Notice", "", 38, 1.4, 27);

    this.column("SousChef_CompletionView", 38, 15.8, 0.1);
    this.item("SousChef_CompletionView", 38, 15.8);
    this.label("SousChef_CompletionTitle", "Done — Nasi Goreng Spesial is ready to plate", 38, 3.8, 34);
    this.label("SousChef_CompletionProgress", "7 of 7 steps completed", 38, 1.8, 29);
    this.label("SousChef_CompletionGarnish", "Garnish with cucumber, fried shallots, and crackers", 38, 2.7, 28);
    this.label("SousChef_LiveTimers", "", 38, 4.0, 24);
    this.button("SousChef_Restart", "Restart recipe", 38, 2.8, {type: "restart"}, 31);
    this.button("SousChef_Ingredients", "Ingredients", 10, 2.6, {type: "ingredients"}, 29);
    this.item("SousChef_Ingredients", 10, 2.6).alignSelf = FlexAlignSelf.End;
    this.button("SousChef_TimerAlert", "", 38, 2.7, {type: "jumpAlert"}, 26);
    this.labels.get("SousChef_TimerAlert")!.textColorOverride = this.amber;
    this.refreshLayouts();
  }

  private paint(model: Readonly<SousChefViewModel>): void {
    const viewNames = ["welcome", "checklist", "recipe", "completion"];
    const hosts = ["SousChef_WelcomeView", "SousChef_ChecklistView", "SousChef_RecipeView", "SousChef_CompletionView"];
    for (let i = 0; i < hosts.length; i++) this.host(hosts[i]).enabled = model.view === viewNames[i];
    this.host("SousChef_Ingredients").enabled = model.view === "recipe" || model.view === "completion";
    this.host("SousChef_TimerAlert").enabled = model.alert !== null;
    this.setText("SousChef_TimerAlert", model.alert ? model.alert.label : "");
    this.setText("SousChef_ReadyCount", model.readyCount + " of 10 ready.");
    for (let i = 0; i < 10; i++) {
      this.setText("SousChef_Ingredient_" + i, (model.checked[i] ? "☑ " : "☐ ") + model.ingredients[i]);
      this.labels.get("SousChef_Ingredient_" + i)!.textColorOverride = model.checked[i] ? this.amber : this.light;
    }
    const returning = model.returnLabel !== null;
    this.host("SousChef_StartCooking").enabled = !returning;
    this.host("SousChef_CookAnyway").enabled = !returning;
    this.host("SousChef_Back").enabled = returning;
    this.buttons.get("SousChef_StartCooking")!.inactive = !model.canStart;
    this.setText("SousChef_Back", model.returnLabel || "Back");
    this.setText("SousChef_StepLabel", model.stepLabel);
    this.setText("SousChef_StepTitle", model.title);
    this.setText("SousChef_Instruction", model.body);
    this.buttons.get("SousChef_Previous")!.inactive = !model.previousEnabled;
    this.host("SousChef_TimerRow").enabled = model.timer !== null;
    this.setText("SousChef_Timer", model.timer ? model.timer.label : "");
    this.buttons.get("SousChef_Timer")!.inactive = !!model.timer && model.timer.status === "done";
    const remaining = model.timer ? Math.ceil((1 - model.timer.progress) * 12) : 12;
    for (let i = 0; i < this.ringDots.length; i++) this.ringDots[i].opacity = i < remaining ? 1 : 0.18;
    this.setText("SousChef_Notice", model.notice);
    this.setText("SousChef_LiveTimers", model.liveTimers.join("\n"));
    const layoutKey = model.view + ":" + returning + ":" + !!model.alert + ":" + !!model.timer;
    if (this.lastLayoutKey !== layoutKey) {
      this.lastView = model.view;
      this.lastLayoutKey = layoutKey;
      this.refreshLayouts();
    }
  }

  private buildRing(): void {
    for (let i = 0; i < 12; i++) {
      const name = "SousChef_Ring_" + i;
      const angle = Math.PI / 2 - i * Math.PI / 6;
      this.host(name).getTransform().setLocalPosition(new vec3(Math.cos(angle) * 1.14, Math.sin(angle) * 1.14, 0.10));
      const dot = this.label(name, "●", 0.55, 0.55, 17, false);
      dot.textColorOverride = this.amber;
      this.ringDots.push(dot);
    }
  }

  private label(name: string, text: string, width: number, height: number, font: number, managed = true): ElementContent {
    const host = this.host(name);
    if (managed) this.item(name, width, height);
    const content = addContentToElement(host, {
      text, textSize: font, sizeOverride: new vec2(width, height),
      textAlignment: TextAlignment.Center, textSizing: TextSizing.Fit, autoResize: false
    });
    content.wrapText = true;
    content.useTextColorOverride = true;
    content.textColorOverride = this.light;
    content.zOffset = 0.10;
    this.labels.set(name, content);
    return content;
  }

  private button(name: string, text: string, width: number, height: number, action: SousChefAction, font = 32, managed = true): void {
    const host = this.host(name);
    if (managed) this.item(name, width, height);
    const button = host.createComponent(Button.getTypeName()) as Button;
    button.setVariant({theme: "System3", shape: "Rectangle", style: "Secondary"});
    button.size = new vec3(width, height, 0.5);
    button.playAudio = false;
    button.initialize();
    button.onTriggerUp.add(() => this.actions.invoke(action));
    const content = this.label(name, text, width, height, font, false);
    content.zOffset = 0.15;
    this.buttons.set(name, button);
  }

  private item(name: string, width: number, height: number): FlexItem {
    const host = this.host(name);
    const item = host.getComponent(FlexItem.getTypeName()) as FlexItem || host.createComponent(FlexItem.getTypeName()) as FlexItem;
    item.overrideWidth = width; item.overrideHeight = height; item.flexShrink = 0;
    return item;
  }

  private column(name: string, width: number, height: number, gap: number): FlexLayout {
    return this.flex(name, width, height, gap, FlexDirection.Column);
  }
  private row(name: string, width: number, height: number, gap: number): FlexLayout {
    return this.flex(name, width, height, gap, FlexDirection.Row);
  }
  private flex(name: string, width: number, height: number, gap: number, direction: FlexDirection): FlexLayout {
    const host = this.host(name);
    const layout = host.createComponent(FlexLayout.getTypeName()) as FlexLayout;
    layout.autoDiscoverItemsOnStart = false;
    layout.width = width; layout.height = height;
    layout.direction = direction; layout.justifyContent = FlexJustify.Center; layout.alignItems = FlexAlign.Center;
    layout.gap = gap;
    this.layouts.push(layout);
    return layout;
  }
  private refreshLayouts(): void {
    for (let i = this.layouts.length - 1; i >= 0; i--) this.layouts[i].refreshChildren();
    if (this.grid) this.grid.forceLayout();
  }
  private setText(name: string, value: string): void {
    const label = this.labels.get(name);
    if (label && label.text !== value) label.text = value;
  }
  private indexHosts(root: SceneObject): void {
    this.hosts.set(root.name, root);
    for (let i = 0; i < root.getChildrenCount(); i++) this.indexHosts(root.getChild(i));
  }
  private host(name: string): SceneObject {
    const host = this.hosts.get(name);
    if (!host) throw new Error("SousChefUI missing authored host: " + name + ". Apply SousChefUIHosts.json before playback.");
    return host;
  }
}
