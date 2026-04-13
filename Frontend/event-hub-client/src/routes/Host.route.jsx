// src/routes/Host.route.jsx
// This file is picked up by TanStack Router's file-based routing.
// It mounts the OrganizerDashboard at the path /Host
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute } from "@tanstack/react-router";
import OrganizerDashboard from "../components/Organizerdashboard";

export const Route = createFileRoute("/Host")({
  component: OrganizerDashboard,
});