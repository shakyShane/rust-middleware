import {assign, createMachine, sendParent} from "xstate";

export const listViewMachine = createMachine({
  id: "listViewMachine",
  initial: "idle",
  context: { data: null, counter: 0 },
  invoke: {
    src: () => (send) => {
      const int = setInterval(() => {
        console.log('tick');
        send('inc');
      }, 1000);
      return () => clearInterval(int);
    },
  },
  entry: sendParent({type: "ack", id: "listViewMachine#machine-loaded"}),
  on: {
    inc: { actions: 'inc' }
  },
  states: {
    idle: {
      invoke: {
        src: 'loader',
        onDone: {target: "loaded", actions: "assign-data"},
        onError: {target: "errored"},
      }
    },
    loaded: {
      entry: sendParent({type: "ack", id: "listViewMachine#data-loaded"})
    },
    errored: {}
  },
  exit: () => {
    console.log("--listViewMachine")
  }
}, {
  actions: {
    "assign-data": assign({data: (_ctx, evt) => evt.data}),
    "inc": assign({counter: (ctx, evt) => ctx.counter + 1}),
  },
  services: {
    loader: async () => {
      await new Promise((res) => setTimeout(res, 1000));
      return [{name: "shane"}, {name: "kittie"}]
    }
  }
})
