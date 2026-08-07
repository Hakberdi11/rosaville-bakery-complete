import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
              <span className="text-rose-500 text-xl font-bold">!</span>
            </div>
            <h1 className="text-lg font-semibold mb-1">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-4">The app hit an unexpected error. Try reloading.</p>
            <pre className="text-[11px] text-left bg-muted/50 p-3 rounded-lg overflow-auto max-h-40 mb-4 whitespace-pre-wrap">{this.state.error?.message || String(this.state.error)}</pre>
            <button onClick={() => window.location.reload()} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}