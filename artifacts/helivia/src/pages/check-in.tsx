import { useState } from 'react';
import { Check, MapPinCheck } from 'lucide-react';
import { PageHeading } from '../components/ui-parts';
import { useAppState } from '../context/app-state';

function formatTimestamp(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(value);
}

export default function CheckInPage() {
  const { addActivity } = useAppState();
  const [timestamp, setTimestamp] = useState<Date | null>(null);

  function checkIn() {
    const now = new Date();
    addActivity({
      type: 'safe-arrival',
      title: 'Safe arrival check-in',
      description: 'Local demo check-in · no one was notified',
    });
    setTimestamp(now);
  }

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="A small moment of reassurance"
        title="Safe arrival"
        description="Make a private check-in for yourself. This demo records the time locally and does not share your arrival with anyone."
      />
      <div className="emergency-detail">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="action-icon" style={{ color: 'var(--blue)', background: 'rgba(115, 189, 232, 0.14)' }}>
              <MapPinCheck aria-hidden="true" />
            </span>
            <h2 className="hero-title">You made it.</h2>
            <p className="hero-subtitle">When you’re ready, save a quiet note that you arrived safely.</p>
          </div>
        </section>
        <div className="alert-note" style={{ marginTop: 16 }}>
          A check-in is not monitored. If you need help, contact local emergency services directly when it is safe.
        </div>
        <div className="panel panel-pad" style={{ marginTop: 16 }}>
          <h2 className="section-title">Your check-in</h2>
          <p className="section-caption">No location is requested in this flow.</p>
          <div className="form-actions">
            <button className="button" type="button" onClick={checkIn} data-testid="button-record-check-in">
              <Check aria-hidden="true" /> I’ve arrived safely
            </button>
          </div>
          {timestamp && (
            <div className="status-box" style={{ marginTop: 16 }} role="status" data-testid="status-check-in-confirmation">
              <div className="status-title">Check-in saved on this device</div>
              <p className="status-copy" data-testid="value-check-in-timestamp">{formatTimestamp(timestamp)}</p>
              <p className="status-copy">Demo only — no alert sent. No one was contacted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
