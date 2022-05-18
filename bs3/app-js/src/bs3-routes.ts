import {customElement} from "lit/decorators/custom-element.js";
import {html, LitElement} from "lit";
import {query} from "lit/decorators/query.js";

@customElement("bs3-routes")
class BS3Routes extends LitElement {

  @query("form", true)
  form: HTMLFormElement | undefined;
  override  render() {
    return html`
        list of routes here...
    `;
  }
}



