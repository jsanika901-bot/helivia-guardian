import { Activity as ActivityIcon, Check, CircleHelp, HeartPulse, ShieldAlert } from 'lucide-react';
import type { Activity } from '../context/app-state';

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Time unavailable';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function ActivityList({ items }: { items: Activity[] }) {
  if (!items.length) {
    return (
      <div className="empty-state" data-testid="empty-activity">
        Your local activity will appear here after a demo action.
        <br />
        No action here sends an alert.
      </div>
    );
  }

  return (
    <div className="activity-list">
      {items.map((item) => {
        const Icon = item.type === 'safe-arrival'
          ? Check
          : item.type === 'profile'
            ? HeartPulse
            : item.type === 'red-help' || item.type === 'yellow-help'
              ? ShieldAlert
              : item.type === 'blue-check-in'
                ? Check
                : item.type === 'green-help'
                  ? CircleHelp
                  : ActivityIcon;
        return (
          <div className="activity-row" key={item.id} data-testid={`activity-item-${item.id}`}>
            <span className="activity-mark"><Icon size={17} aria-hidden="true" /></span>
            <div className="contact-detail">
              <div className="activity-title" data-testid={`activity-title-${item.id}`}>{item.title}</div>
              <div className="activity-meta">{item.description}</div>
            </div>
            <time className="activity-meta" dateTime={item.createdAt}>{formatTime(item.createdAt)}</time>
          </div>
        );
      })}
    </div>
  );
}
