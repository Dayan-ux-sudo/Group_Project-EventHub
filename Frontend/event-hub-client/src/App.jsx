import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./App.css";

// Create the router with useful defaults
const router = createRouter({
  routeTree,
  defaultPreload: "intent",        // Preloads data when hovering links (great UX)
  defaultStaleTime: 0,             // Or set a higher value if using TanStack Query
  // context: {},                  // You can add global context here later (auth, etc.)
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;