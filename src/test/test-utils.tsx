import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, type RenderHookOptions, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";

/** Fresh QueryClient per render — no retries/caching noise between tests. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  routerProps?: MemoryRouterProps;
}

function AllProviders({ children, queryClient, routerProps }: AllProvidersProps) {
  return (
    <QueryClientProvider client={queryClient ?? createTestQueryClient()}>
      <MemoryRouter {...routerProps}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
  routerProps?: MemoryRouterProps;
}

/**
 * Renders a component wrapped in a `QueryClientProvider` + `MemoryRouter`,
 * matching the providers the real app tree supplies at the root.
 */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient, routerProps, ...options }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient} routerProps={routerProps}>
        {children}
      </AllProviders>
    ),
    ...options,
  });
}

/**
 * Renders a TanStack Query hook (`useQuery`/`useMutation`) wrapped in a fresh
 * `QueryClientProvider`. Returns both the render result and the client, so
 * tests can inspect/seed the cache directly when needed.
 */
export function renderHookWithQueryClient<TResult, TProps>(
  callback: (props: TProps) => TResult,
  options: Omit<RenderHookOptions<TProps>, "wrapper"> & { queryClient?: QueryClient } = {}
) {
  const { queryClient = createTestQueryClient(), ...rest } = options;
  const result = renderHook(callback, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    ...rest,
  });
  return { ...result, queryClient };
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
