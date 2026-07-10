import { Component, type ErrorInfo, type ReactNode } from "react";
import { Sentry } from "@/lib/sentry";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere in the tree so users get a friendly
 * recovery screen instead of a blank white page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
    Sentry.captureException(error, {
      contexts: { react: { componentStack: info.componentStack } },
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="max-w-md text-sm text-gray-600">
          An unexpected error occurred. Please reload the page — if the problem
          persists, contact us on Messenger.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Reload page
        </button>
      </div>
    );
  }
}
