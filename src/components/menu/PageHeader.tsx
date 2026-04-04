import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}

export default function PageHeader({ title, rightAction }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 bg-primary px-4 h-14 flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 text-white" />
      </button>
      <h1 className="text-white font-semibold text-base flex-1 truncate">{title}</h1>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  );
}
