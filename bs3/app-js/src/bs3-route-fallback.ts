import {customElement} from "lit/decorators/custom-element.js";
import {html, LitElement} from "lit";
import invariant from "tiny-invariant";
import {query} from "lit/decorators/query.js";

@customElement("bs3-route-fallback")
class BS3RouteFallback extends LitElement {

  @query("form", true)
  form: HTMLFormElement | undefined;

  handleEvent(_e: SubmitEvent) {
    _e.preventDefault();
    invariant(_e.target instanceof HTMLFormElement, "target must be a form element");
    const d = new FormData(_e.target);
    console.log(JSON.stringify(d));
  }
  override  render() {
    return html`
        <p>That route does not exist, would you like to create it?</p>
        <pre><code>Submitting for: ${window.location.pathname}</code></pre>
        <div>
            <form @submit=${this} method="POST">
                <label for="body">
                    <textarea name="body" id="" cols="30" rows="10"></textarea>
                </label>
                <input type="hidden" value=${window.location.pathname} name="pathname">
                <button type="submit">Submit</button>
            </form>
        </div>
    `;
  }
}

function isFormTarget(e: Event['target']): e is HTMLFormElement  {
  if (!(e instanceof HTMLFormElement)) {
    throw new Error('unreachable');
  }
  return true
}
