import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"

import { ThemeProvider } from "@/components/theme-provider"
import { routeTree } from "./routeTree.gen"
import "./index.css"

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")!

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="pro-suite-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
