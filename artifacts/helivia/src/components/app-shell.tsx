import { Link, useLocation } from 'wouter';
import { Activity, HeartPulse, House, LockKeyhole, MapPinCheck, Shield, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';

const navigation = [
  { href: '/', label: 'Home', icon: House },
  { href: '/contacts', label: 'Trusted contacts', shortLabel: 'Contacts', icon: UsersRound },
  { href: '/medical', label: 'Medical profile', shortLabel: 'Medical', icon: HeartPulse },
  { href: '/check-in', label: 'Safe arrival', shortLabel: 'Check-in', icon: MapPinCheck },
  { href: '/activity', label: 'Activity', shortLabel: 'Activity', icon: Activity },
  { href: '/privacy', label: 'Privacy', shortLabel: 'Privacy', icon: LockKeyhole },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const current = navigation.find((item) => item.href === location) ?? navigation[0];

  return (
    <div className="app-shell">
      <div className="shell-layout">
        <aside className="sidebar" aria-label="Main navigation">
          <Link href="/" className="brand" data-testid="link-brand-home">
            <span className="brand-mark"><Shield size={21} strokeWidth={1.8} /></span>
            <span>
              <span className="brand-name">HELIVIA</span>
              <span className="brand-tagline">Help finds you</span>
            </span>
          </Link>
          <p className="nav-label">Your safety space</p>
          <nav className="nav-list">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link${location === href ? ' active' : ''}`}
                aria-current={location === href ? 'page' : undefined}
                data-testid={`link-nav-${href === '/' ? 'home' : href.slice(1)}`}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="demo-sidebar-note">
              <span className="demo-dot" />
              <strong>Demo space</strong>
              <br />
              Nothing here contacts emergency services or other people.
            </div>
          </div>
        </aside>
        <div className="main-column">
          <header className="topbar">
            <div className="topbar-context">{current.label}</div>
            <span className="demo-badge" data-testid="status-demo-mode">
              <span className="demo-dot" />
              DEMO MODE
            </span>
          </header>
          <main>{children}</main>
        </div>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.map(({ href, shortLabel, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={location === href ? 'active' : ''}
            aria-label={shortLabel ?? label}
            aria-current={location === href ? 'page' : undefined}
            data-testid={`mobile-nav-${href === '/' ? 'home' : href.slice(1)}`}
          >
            <Icon aria-hidden="true" />
            <span>{shortLabel ?? label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
