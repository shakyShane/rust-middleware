import {ActorRef, assign, createMachine, send, spawn} from "xstate";
import {pure} from "xstate/lib/actions";
import z from "zod";
import {trackLinks} from "../utils/nav-utils";
import {listViewMachine} from "./listViewMachine";
import {unknownViewMachine} from "./unknownViewMachine";

export const appMachine = createMachine({
  id: "app",
  initial: 'initial',
  context: {
    pathname: window.location.pathname,
    named: 'waiting',
    current: null as ActorRef<any> | null,
  },
  invoke: {
    id: "popstate-listener",
    src: "popstate-listener-service"
  },
  states: {
    initial: {
      entry: 'initial-route-resolution',
      on: {
        'navigate': {actions: 'try-navigate', target: 'navigating'}
      },
    },
    navigating: {
      on: {
        'navigation-complete': { actions: 'assign-route', target: 'settled' },
        'navigate': { actions: 'try-navigate', target: 'navigating' }
      }
    },
    settled: {
      entry: 'routing-settled',
      on: {
        'navigate': { actions: 'try-navigate', target: 'navigating' },
        'ack': { actions: 'ack-ack' }
      }
    }
  }
}, {
  actions: {
    'ack-ack': (ctx, evt) => {
      console.log('sub-machine loaded', evt);
    },
    'routing-settled': assign({
      current: (ctx) => {
        ctx.current?.stop?.();
        switch (ctx.named) {
          case "routes": return spawn(listViewMachine)
          default: return spawn(unknownViewMachine)
        }
      }
    }),
    'initial-route-resolution': pure((ctx, evt) => {
      if (!ctx.pathname.startsWith('/__bs3/api')) {
        const evt = createNavEvent({
          type: "navigate",
          named: "unknown"
        })
        return send(evt)
      }
      if (ctx.pathname === "/__bs3/api/routes") {
        return  send(createNavEvent({
          type: "navigate",
          named: "routes"
        }))
      }
      return [];
    }),
    'assign-route': assign({
      named: (_, evt) => {
        const parsed = navigationCompleteEvent.parse(evt);
        return parsed.named;
      }
    }),
    'try-navigate': pure((ctx, evt) => {
      const parsed = navEvent.parse(evt);
      switch (parsed.named) {
        case "unknown":
        case "routes": {
          return send(createNavigationCompleteEvent({type: "navigation-complete", named: parsed.named}))
        }
        default: throw new Error("unsupported route" + parsed)
      }
      return []
    })
  },
  services: {
    "popstate-listener-service": (ctx, evt) => (send, rec) => {
      const goto = (pathname: string) => {
        if (pathname.startsWith('/__bs3/api')) {
          const sliced = namedRoutes.parse(pathname.slice(11));
          send(createNavEvent({
            type: "navigate",
            named: sliced
          }))
        } else {
          send(createNavEvent({
            type: "navigate",
            named: 'unknown'
          }))
        }
      };
      trackLinks(goto);
    }
  }
})

const namedRoutes = z.union([
  z.literal("unknown"),
  z.literal("routes")
]);

const navEvent = z.object({
  type: z.literal("navigate"),
  named: namedRoutes,
});

function createNavEvent(d: z.infer<typeof navEvent>) {
  return navEvent.parse(d);
}

const navigationCompleteEvent = z.object({
  type: z.literal("navigation-complete"),
  named: namedRoutes,
});

function createNavigationCompleteEvent(d: z.infer<typeof navigationCompleteEvent>) {
  return navigationCompleteEvent.parse(d);
}
