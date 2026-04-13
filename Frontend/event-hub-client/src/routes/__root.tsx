import { useState, useEffect } from 'react';
import { createRootRoute, Outlet, Link, useNavigate } from '@tanstack/react-router'

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
        to="/"
        className="btn fw-semibold px-4 py-2"
        style={{ background: "#112278", color: "#fff", border: "none", borderRadius: 8 }}
      >
        <i className="bi bi-arrow-left me-2"></i>Go to Home
      </Link>
    </div>
  )
}

function RootComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated by looking for access token
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    // Listen for storage changes (when user logs in/out from other components)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('access_token');
      setIsAuthenticated(!!newToken);
    };

    // Listen for custom auth-changed event from login/logout
    const handleAuthChanged = () => {
      const newToken = localStorage.getItem('access_token');
      setIsAuthenticated(!!newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-changed', handleAuthChanged);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChanged);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    
    // Dispatch custom event to ensure all components update
    window.dispatchEvent(new Event('auth-changed'));
    
    navigate({ to: '/' });
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand fw-bold">EventHub</Link>
          <div className="navbar-nav ms-auto">
            {!isAuthenticated && (
              <Link to="/" className="nav-link">Home</Link>
            )}
            {isAuthenticated && (
              <Link to="/explore" className="nav-link">Explore</Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="nav-link btn btn-link"
                style={{ textDecoration: 'none' }}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="nav-link">Login</Link>
            )}
          </div>
        </div>
      </nav>

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