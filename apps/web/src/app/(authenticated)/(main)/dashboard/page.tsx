import { Activity, ArrowRight, Box, CheckCircle, Eye, Plus, Radio, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Applications', value: '12', change: '+2 this week', icon: Box },
  { label: 'Active Endpoints', value: '48', change: '+5 this week', icon: Radio },
  { label: 'Events Today', value: '1,284', change: '+18% vs yesterday', icon: Activity },
  { label: 'Success Rate', value: '99.7%', change: 'Last 24h', icon: CheckCircle },
];

const recentEvents = [
  {
    id: 'evt_1a2b3c',
    type: 'payment.completed',
    app: 'Stripe Integration',
    endpoint: 'https://api.example.com/webhooks',
    status: 'delivered',
    time: '2 min ago',
  },
  {
    id: 'evt_4d5e6f',
    type: 'user.created',
    app: 'Auth Service',
    endpoint: 'https://hooks.slack.com/...',
    status: 'delivered',
    time: '5 min ago',
  },
  {
    id: 'evt_7g8h9i',
    type: 'order.updated',
    app: 'E-commerce',
    endpoint: 'https://api.warehouse.io/hooks',
    status: 'failed',
    time: '12 min ago',
  },
  {
    id: 'evt_0j1k2l',
    type: 'invoice.sent',
    app: 'Billing Service',
    endpoint: 'https://api.notify.com/wh',
    status: 'delivered',
    time: '18 min ago',
  },
  {
    id: 'evt_3m4n5o',
    type: 'subscription.renewed',
    app: 'Stripe Integration',
    endpoint: 'https://api.example.com/webhooks',
    status: 'delivered',
    time: '25 min ago',
  },
];

const quickActions = [
  {
    label: 'Create Application',
    description: 'Set up a new webhook source',
    icon: Plus,
    href: '/applications',
  },
  {
    label: 'Add Endpoint',
    description: 'Register a new delivery target',
    icon: Radio,
    href: '/endpoints',
  },
  {
    label: 'View Events',
    description: 'Browse event history and logs',
    icon: Eye,
    href: '/events',
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-text-main">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Overview of your webhook infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface p-5"
            style={{
              border: '1px solid var(--border)',
              borderRight: '4px solid var(--border-bold)',
              borderBottom: '4px solid var(--border-bold)',
              borderRadius: '16px',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-text-muted text-sm font-medium">{stat.label}</span>
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--input)' }}>
                <stat.icon size={16} style={{ color: 'var(--primary)' }} />
              </div>
            </div>
            <p className="text-2xl font-extrabold tracking-tight text-text-main">{stat.value}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingUp size={12} style={{ color: 'var(--accent)' }} />
              <span className="text-xs text-text-muted">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="lg:col-span-2 bg-surface"
          style={{
            border: '1px solid var(--border)',
            borderRight: '4px solid var(--border-bold)',
            borderBottom: '4px solid var(--border-bold)',
            borderRadius: '16px',
          }}
        >
          <div className="p-5 pb-0 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-main">Recent Events</h2>
              <p className="text-xs text-text-muted mt-0.5">Latest webhook deliveries</p>
            </div>
            <a
              href="/events"
              className="flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: 'var(--primary)' }}
            >
              View all
              <ArrowRight size={14} />
            </a>
          </div>
          <div className="p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 text-text-muted font-semibold text-xs uppercase tracking-wider">
                    Event
                  </th>
                  <th className="text-left pb-3 text-text-muted font-semibold text-xs uppercase tracking-wider">
                    Application
                  </th>
                  <th className="text-left pb-3 text-text-muted font-semibold text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right pb-3 text-text-muted font-semibold text-xs uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr key={event.id} className="border-b border-border last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <code
                          className="text-xs px-1.5 py-0.5 rounded-md font-mono"
                          style={{ backgroundColor: 'var(--input)', color: 'var(--primary)' }}
                        >
                          {event.type}
                        </code>
                      </div>
                    </td>
                    <td className="py-3 text-text-muted">{event.app}</td>
                    <td className="py-3">
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{
                          backgroundColor:
                            event.status === 'delivered'
                              ? 'rgba(34, 197, 94, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                          color: event.status === 'delivered' ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-text-muted text-xs">{event.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-text-main">Quick Actions</h2>
            <p className="text-xs text-text-muted mt-0.5">Common tasks</p>
          </div>
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="block bg-surface p-4 transition-all duration-200 group"
              style={{
                border: '1px solid var(--border)',
                borderRight: '4px solid var(--border-bold)',
                borderBottom: '4px solid var(--border-bold)',
                borderRadius: '16px',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl transition-all duration-200"
                  style={{ backgroundColor: 'var(--input)' }}
                >
                  <action.icon size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-main">{action.label}</p>
                  <p className="text-xs text-text-muted">{action.description}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-text-muted group-hover:translate-x-1 transition-transform duration-200"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
