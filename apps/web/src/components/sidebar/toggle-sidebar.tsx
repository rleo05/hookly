import { PanelLeft } from "lucide-react";
import { useSidebar } from "../../contexts/sidebar-context";

export function ToggleSideBar({ className }: { className?: string }) {
    const { isOpen, toggle: toggleSideBar } = useSidebar();
    return (
        <button
          type="button"
          className={`p-2 rounded-xl cursor-pointer transition-all duration-200 text-text-muted ${className}`}
          onClick={toggleSideBar}
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          title={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <PanelLeft size={20} />
        </button>
    )
}