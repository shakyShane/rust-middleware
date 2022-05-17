import {html, LitElement} from "lit";
import {customElement} from "lit/decorators/custom-element.js";
import {query} from "lit/decorators/query.js";

@customElement("bs3-app")
class App extends LitElement {

  @query("form", true)
  form: HTMLFormElement;

  handleEvent(e) {
    console.log(e);
    e.preventDefault();
    console.log(this.form);
    const data = new FormData(this.form);
    for (let [fieldName, value] of data) {
      console.log({fieldName, value});
    }
  }
  render() {
    return html`
    <pre><code>Submitting for: ${window.location.pathname}</code></pre>
    <div>
      <form @submit=${this} >
          <label for="body"><input type="text" id="body" name="body"></label>
          <button type="submit">Submit</button>
      </form>
    </div>
    `;
  }
}
