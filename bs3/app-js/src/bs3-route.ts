import {customElement} from "lit/decorators/custom-element.js";
import {html, LitElement} from "lit";
import {property} from "lit/decorators/property.js";

@customElement("bs3-route")
class BS3Route extends LitElement {

  @property({type: String})
  pathId: string | undefined;

  render() {
    return html`
    <div>
      <pre><code>${this.pathId}</code></pre>
    </div>
    `;
  }
}
