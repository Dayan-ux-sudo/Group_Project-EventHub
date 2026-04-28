import { createRootRoute, Outlet, Link } from '@tanstack/react-router'

function NotFound() {
  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3"
      style={{ background: "#101322", color: "#5ba8f6" }}
    >
      <div
        className="d-flex align-items-center justify-content-center rounded-3 mb-2"
        style={{ width: 64, height: 64, background: "rgba(19,55,236,0.15)" }}
      >
        <i className="bi bi-compass text-primary" style={{ fontSize: "2rem" }}></i>
      </div>
      <h2 className="text-white fw-bold mb-1">Page Not Found</h2>
      <p className="text-secondary mb-3">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/login"
        className="btn fw-semibold px-4 py-2"
        style={{ background: "#112278", color: "#fff", border: "none", borderRadius: 8 }}
      >
        <i className="bi bi-arrow-left me-2"></i>Go to Login
      </Link>
    </div>
  )
}

function RootComponent() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Child routes render here */}
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
})
