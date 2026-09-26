"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getMotionTheme, type MotionTheme } from "@/lib/motionThemes";

const MotionThemeContext = createContext<MotionTheme>(getMotionTheme(""));

/** Makes the current template's MotionTheme available to Section and
 * MotionHeading. Takes the template id (not the theme object) so server
 * components can render it without passing anything non-serializable. */
export default function MotionThemeProvider({
  templateId,
  children,
}: {
  templateId: string;
  children: ReactNode;
}) {
  return (
    <MotionThemeContext.Provider value={getMotionTheme(templateId)}>
      {children}
    </MotionThemeContext.Provider>
  );
}

export function useMotionTheme(): MotionTheme {
  return useContext(MotionThemeContext);
}
