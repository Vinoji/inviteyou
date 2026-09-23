"use client";

import { Component, type ReactNode } from "react";

/**
 * Swallows render errors from a purely decorative child (e.g. WebGL
 * unsupported/blocked) instead of taking down the invitation around it.
 * Class component because error boundaries have no hook equivalent.
 */
export default class SilentErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
