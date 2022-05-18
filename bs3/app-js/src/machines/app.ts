import {assign, createMachine, send} from "xstate";
import {pure} from "xstate/lib/actions";
import z from "zod";

export const appMachine = createMachine({
  id: "app",
  initial: 'initial',
  context: {
    pathname: window.location.pathname,
    named: 'waiting'
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
        'navigation-complete': {actions: 'assign-route', target: 'settled'},
        'navigate': {actions: 'try-navigate', target: 'navigating'}
      }
    },
    settled: {
      entry: send('broadcast-settled'),
      on: {
        'navigate': {actions: 'try-navigate', target: 'navigating'}
      }
    }
  }
}, {
  actions: {
    'assign-route': assign({
      named: (_, evt) => {
        const parsed = navigationCompleteEvent.parse(evt);
        return parsed.named;
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
    'try-navigate': pure((ctx, evt) => {
      const parsed = navEvent.parse(evt);
      switch (parsed.named) {
        case "unknown":
        case "routes": {
          return send(createNavigationCompleteEvent({type: "navigation-complete", named: parsed.named}))
        }
        default:
          "unsupported"
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
      }
      window.addEventListener('popstate', (e) => {
        goto(window.location.pathname);
      })
      window.addEventListener('click', (e: MouseEvent) => {
        const isNonNavigationClick =
          e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey;
        if (e.defaultPrevented || isNonNavigationClick) {
          return;
        }

        const anchor = e
          .composedPath()
          .find((n) => (n as HTMLElement).tagName === 'A') as
          | HTMLAnchorElement
          | undefined;
        if (
          anchor === undefined ||
          anchor.target !== '' ||
          anchor.hasAttribute('download') ||
          anchor.getAttribute('rel') === 'external'
        ) {
          return;
        }

        const href = anchor.href;
        if (href === '' || href.startsWith('mailto:')) {
          return;
        }

        const location = window.location;
        if (anchor.origin !== origin) {
          return;
        }

        e.preventDefault();
        if (href !== location.href) {
          window.history.pushState({}, '', href);
          goto(anchor.pathname)
        }
      })
    }
  }
})

const namedRoutes = z.union([z.literal("unknown"), z.literal("routes")]);
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
