import {html, LitElement, ReactiveController, ReactiveControllerHost} from "lit";
import {customElement} from "lit/decorators/custom-element.js";
import {inspect} from "@xstate/inspect";
import {createMachine, interpret, Subscription} from "xstate";

import "./bs3-routes";
import "./bs3-route";
import "./bs3-route-fallback";
import {appMachine} from "./machines/app";

inspect({iframe: false});

export class MachineController implements ReactiveController {
  // reference to the host element using this controller
  host: ReactiveControllerHost & Element;
  store;
  subscription?: Subscription;

  constructor(host: ReactiveControllerHost & Element, machine: typeof appMachine) {
    (this.host = host).addController(this);
    this.store = interpret(machine, {devTools: true}).start();
    this.subscription = this.store.subscribe(() => {
      this.host.requestUpdate();
    });
  }

  hostDisconnected() {
    this.subscription?.unsubscribe();
  }
}

export class SubMachineController implements ReactiveController {
  // reference to the host element using this controller
  host: ReactiveControllerHost & Element;
  subscription?: Subscription;

  constructor(host: ReactiveControllerHost & Element, store: any) {
    (this.host = host).addController(this);
    this.subscription = store.subscribe(() => {
      this.host.requestUpdate();
    });
  }

  hostDisconnected() {
    this.subscription?.unsubscribe();
  }
}


@customElement('router-test-1')
export class Test1 extends LitElement {
  machine = new MachineController(this, appMachine).store;
  get currentRoute() {
    // @ts-ignore
    console.log(this.machine.state.context.current);
    switch (this.machine.state.context.named) {
      case "waiting": return html`<p>Please wait...</p>`
      case "unknown": return html`<bs3-route-fallback></bs3-route-fallback>`
      case "routes": {
        return html`<bs3-routes .machine=${this.machine.state.context.current}></bs3-routes>`
      }
      default: return html`Not sure...`
    }
  }
  override render() {
    console.log('render...');
    return html`
      <pre><code>${JSON.stringify(this.machine.state.value)}</code></pre>
      <pre><code>${JSON.stringify(this.machine.state.context.named)}</code></pre>
      ${this.currentRoute}
      <p><a href="/__bs3/api/routes">See all routes</a></p>
      <p><a href="/shane">See an unknown route</a></p>
    `;
  }
}
