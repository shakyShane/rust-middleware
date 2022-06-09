import {customElement} from "lit/decorators/custom-element.js";
import {html, LitElement, PropertyValues} from "lit";
import {query} from "lit/decorators/query.js";
import {property} from "lit/decorators/property.js";
import {SubMachineController} from "./index";

@customElement("bs3-routes")
class BS3Routes extends LitElement {
  @property()
  machine = null;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.www = new SubMachineController(this, this.machine);
  }

  override render() {
    // console.log(this.www);
    console.log("bs3-routes render...", this.machine.state.context.counter);
    return html`
        list of routes here (${this.machine.state.context.counter || 0})...
    `;
  }
}



