// @ts-check

import {ThemeProvider as NextThemesProvider} from "next-themes";

/** @param {{children: import("react").ReactNode}} props */
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
