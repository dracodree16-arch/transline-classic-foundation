import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Every route in this app is client-rendered (auth/session state lives in
    // the browser via Supabase storage). Marking SSR off by default keeps the
    // server output consistent with the per-route `ssr: false` settings and
    // avoids server/client hydration mismatches on initial load.
    defaultSsr: false,
  });

  return router;
};
