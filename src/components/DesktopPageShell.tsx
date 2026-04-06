import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/menu/PageHeader";

interface DesktopPageShellProps {
  title: string;
  children: ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
  rightAction?: ReactNode;
  maxWidth?: string;
  showFooter?: boolean;
}

export default function DesktopPageShell({
  title,
  children,
  breadcrumbs,
  rightAction,
  maxWidth = "max-w-3xl",
  showFooter = true,
}: DesktopPageShellProps) {
  const crumbs = breadcrumbs || [
    { label: "Início", to: "/" },
    { label: title },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 sm:pb-0">
      <Navbar />
      <PageHeader title={title} rightAction={rightAction} />

      <div className={`container mx-auto px-4 pt-4 sm:pt-24 pb-16 ${maxWidth}`}>
        {/* Desktop breadcrumb & title */}
        <div className="hidden sm:block mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        </div>

        {children}
      </div>

      {showFooter && (
        <div className="hidden sm:block">
          <Footer />
        </div>
      )}
    </div>
  );
}
