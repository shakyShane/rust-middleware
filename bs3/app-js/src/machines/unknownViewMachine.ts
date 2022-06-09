import {assign, createMachine, sendParent} from "xstate";

export const unknownViewMachine = createMachine({
  id: "unknownViewMachine",
  initial: "idle",
  context: { data: null },
  states: {
    idle: {
      invoke: {
        src: 'loader',
        onDone: { target: "loaded", actions: "assign-data" },
        onError: { target: "errored" },
      }
    },
    loaded: {},
    errored: {}
  },
  exit: () => {
    console.log("--unknownViewMachine")
  }
}, {
  actions: {
    "assign-data": assign({ data: (_ctx, evt) => evt.data })
  },
  services: {
    loader: async () => {
      await new Promise((res) => setTimeout(res, 1000));
      return [{name: "shane"}, {name: "kittie"}]
    }
  }
})
