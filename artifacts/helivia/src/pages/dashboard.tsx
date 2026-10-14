import { Link } from 'wouter';
import { Check, Flame, HeartPulse, ShieldAlert, ShieldCheck, UsersRound } from 'lucide-react';
import { useAppState } from '../context/app-state';
import { ActivityList } from '../components/activity-list';
import { PageHeading, SectionHeading } from '../components/ui-parts';

const actions = [
  {
    key: 'red-help',
    label: 'RED HELP',
    hint: 'Personal safety emergency',
    icon: ShieldAlert,
    tone: 'red',
    href: '/emergency/red-help',
  },
  {
    key: 'green-help',
    label: 'GREEN HELP',
    hint: 'Medical assistance',
    icon: HeartPulse,
    tone: 'green',
    href: '/emergency/green-help',
  },
  {
    key: 'yellow-help',
    label: 'YELLOW HELP',
    hint: 'Fire and disaster reporting',
    icon: Flame,
    tone: 'yellow',
    href: '/emergency/yellow-help',
  },
  {
    key: 'blue-check-in',
    label: 'BLUE CHECK-IN',
    hint: 'Safe journey and arrival confirmation',
    icon: Check,
    tone: 'blue',
    href: '/check-in',
  },
];

export default function Dashboard() {
  const { activity, contacts } = useAppState();
  const recentItems = activity.slice(0, 3);

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="A calm next step"
        title="Help finds you."
        description="A private place to think clearly, keep helpful details close, and check in when you arrive."
      />
      <section className="hero-panel" aria-labelledby="welcome-title">
        <div className="hero-copy">
          <div className="eyebrow">Here with you</div>
          <h2 className="hero-title" id="welcome-title">Choose what feels right.</h2>
          <p className="hero-subtitle">
            HELIVIA is a demo companion. These actions help you organize a next step; they do not contact anyone.
          </p>
        </div>
      </section>

      <SectionHeading
        title="Choose an action"
        caption="Each option opens a private demo flow."
      />
      <div className="action-grid" aria-label="Safety actions">
        {actions.map(({ key, label, hint, icon: Icon, tone, href }) => (
          <Link
            key={key}
            href={href}
            className={`action-card ${tone}`}
            data-testid={`action-${key}`}
            aria-label={`${label}. ${hint}`}
          >
            <span className="action-icon"><Icon aria-hidden="true" /></span>
            <span>
              <span className="action-label">{label}</span>
              <span className="action-hint">{hint}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="content-grid">
        <section className="panel panel-pad" aria-labelledby="recent-title">
          <SectionHeading
            title="Recent activity"
            caption="Stored on this device in demo mode."
            action={<Link href="/activity" className="button secondary" data-testid="link-all-activity">View all</Link>}
          />
          <ActivityList items={recentItems} />
        </section>
        <aside className="panel panel-pad">
          <SectionHeading title="Your essentials" caption="Personal details stay under your control." />
          <div className="privacy-callout">
            <h3><UsersRound size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />Trusted contacts</h3>
            <p>{contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} saved as demo data. No one is notified.</p>
          </div>
          <div style={{ height: 12 }} />
          <div className="privacy-callout">
            <h3><ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />Your privacy, first</h3>
            <p>Location is off unless you choose it. Nothing is sent from this demo.</p>
            <Link href="/privacy" className="button secondary" style={{ marginTop: 14 }} data-testid="link-privacy-details">
              Privacy controls
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
