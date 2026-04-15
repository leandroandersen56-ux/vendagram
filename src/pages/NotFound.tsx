import { useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  // Detect URLs with invisible Unicode chars (common from WhatsApp copy-paste)
  const decoded = decodeURIComponent(location.pathname);
  const cleaned = decoded.replace(/[\u2000-\u206F\u2800\uFEFF\u200B-\u200F\u00A0\u180E\u3000]/g, "").trim();
  
  // If path is only invisible chars or empty after cleaning, redirect to home
  if (cleaned === "/" || cleaned === "" || cleaned.length <= 1) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-semibold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Página não encontrada</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Voltar ao Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
