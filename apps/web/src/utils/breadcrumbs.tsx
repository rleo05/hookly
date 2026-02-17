import {
  Activity,
  Building2,
  ChevronRight,
  Eye,
  FileText,
  KeyRound,
  LayoutDashboard,
  Radio,
  Settings,
  Tags,
} from 'lucide-react';
import Link from 'next/link';

const SUB_PAGE_CONFIG: Record<string, { icon: any; label: string }> = {
  overview: { icon: Eye, label: 'Overview' },
  events: { icon: Activity, label: 'Events' },
  'event-types': { icon: Tags, label: 'Event Types' },
  endpoints: { icon: Radio, label: 'Endpoints' },
};

const BreadcrumbContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="pl-8 flex items-center gap-2 text-base">{children}</div>
);

function formatTitle(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getHeaderContent(pathname: string) {
  const staticRoutes: Record<string, React.ReactNode> = {
    '/dashboard': (
      <BreadcrumbContainer>
        <div className="flex items-center gap-2 text-foreground font-medium">
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </div>
      </BreadcrumbContainer>
    ),
    '/applications': (
      <BreadcrumbContainer>
        <div className="flex items-center gap-2 text-foreground font-medium">
          <Building2 size={16} />
          <span>Applications</span>
        </div>
      </BreadcrumbContainer>
    ),
    '/settings': (
      <BreadcrumbContainer>
        <div className="flex items-center gap-2 text-foreground font-medium">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </BreadcrumbContainer>
    ),
    '/keys': (
      <BreadcrumbContainer>
        <div className="flex items-center gap-2 text-foreground font-medium">
          <KeyRound size={16} />
          <span>Keys</span>
        </div>
      </BreadcrumbContainer>
    ),
  };

  if (staticRoutes[pathname]) {
    return staticRoutes[pathname];
  }

  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'applications' && parts[1]) {
    const currentSlug = parts[2] || 'overview';

    const config = SUB_PAGE_CONFIG[currentSlug] || {
      icon: FileText,
      label: formatTitle(currentSlug),
    };

    const CurrentIcon = config.icon;

    return (
      <BreadcrumbContainer>
        <Link
          href="/applications"
          className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors"
        >
          <Building2 size={16} />
          <span>Applications</span>
        </Link>

        <ChevronRight size={14} className="text-muted opacity-50" />

        <div className="flex items-center gap-2 font-medium text-foreground">
          <CurrentIcon size={16} />
          <span>{config.label}</span>
        </div>
      </BreadcrumbContainer>
    );
  }

  return <span className="font-medium text-gray-500"></span>;
}
