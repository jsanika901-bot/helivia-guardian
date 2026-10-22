import { useEffect, useRef, useState } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { ArrowLeft, Check, Flame, HeartPulse, MapPin, ShieldAlert, Radio, UsersRound } from 'lucide-react';
import { PageHeading } from '../components/ui-parts';
import { useAppState, type EmergencyType, type NearbySosEvent } from '../context/app-state';

const details: Record<Exclude<EmergencyType, 'blue-check-in'>, {
  title: string;
  summary: string;
  prompt: string;
  tone: string;
  icon: typeof ShieldAlert;
}> = {
  'red-help': {
    title: 'RED HELP',
    summary: 'Personal safety emergency. If you are in immediate danger, contact local emergency services directly when it is safe to do so.',
    prompt: 'Use this page to pause and record a private demo note. HELIVIA cannot call for help.',
    tone: 'red',
    icon: ShieldAlert,
  },
  'green-help': {
    title: 'GREEN HELP',
    summary: 'Medical assistance. If this is life-threatening, contact local emergency services directly.',
    prompt: 'This demo cannot contact a hospital or provide medical care.',
    tone: 'green',
    icon: HeartPulse,
  },
  'yellow-help': {
    title: 'YELLOW HELP',
    summary: 'Fire and disaster reporting. Move away from immediate danger when possible and contact local emergency services directly.',
    prompt: 'This demo cannot file a report or request dispatched assistance.',
    tone: 'yellow',
    icon: Flame,
  },
};

function formatTimestamp(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(value);
}

export default function EmergencyPage() {
  const [, params] = useRoute('/emergency/:type');
  const emergencyType = params?.type as Exclude<EmergencyType, 'blue-check-in'> | undefined;
  const detail = emergencyType && emergencyType in details ? details[emergencyType] : details['red-help'];
  const { addActivity, privacy, activateRedHelp, nearbySosEvents } = useAppState();
  const [locationPath] = useLocation();
  const [timestamp] = useState(() => new Date());
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [saved, setSaved] = useState(false);
  const eventId = new URLSearchParams(window.location.search).get('eventId');
  const [sosEvent, setSosEvent] = useState<NearbySosEvent | null>(() => (
    emergencyType === 'red-help' && eventId
      ? nearbySosEvents.find((event) => event.id === eventId) ?? null
      : null
  ));
  const createdForRoute = useRef<string | null>(null);
  const Icon = detail.icon;

  useEffect(() => {
    if (emergencyType !== 'red-help') return;
    const selected = eventId ? nearbySosEvents.find((event) => event.id === eventId) : null;
    if (selected) {
      setSosEvent(selected);
      return;
    }
    if (createdForRoute.current !== locationPath) {
      createdForRoute.current = locationPath;
      setSosEvent(activateRedHelp());
    }
  }, [emergencyType, eventId, nearbySosEvents, activateRedHelp, locationPath]);

  function requestLocation() {
    if (!privacy.locationEnabled) {
      setLocationStatus('Location is off in Privacy settings. Turn it on there first, then choose this action to request browser permission.');
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('This browser does not provide location access.');
      return;
    }

    setLocationStatus('Waiting for your browser permission…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus('Location is shown only in this page. It is not sent or tracked.');
      },
      () => {
        setLocation(null);
        setLocationStatus('Location was not shared. You can continue without it.');
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 0 },
    );
  }

  function saveDemoNote() {
    addActivity({
      type: emergencyType ?? 'red-help',
      title: `Demo note: ${detail.title}`,
      description: location
        ? `Local demo record · location included by choice (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
        : 'Local demo record · no location included',
    });
    setSaved(true);
  }

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="Private demo flow"
        title="Your next step"
        description="Review the selected action and decide whether you want to save a local note."
      />
      <div className="emergency-detail">
        <section className={`emergency-banner ${detail.tone}`}>
          <span className="action-icon"><Icon aria-hidden="true" /></span>
          <div>
            <h2 className="section-title" data-testid="text-selected-emergency">{detail.title}</h2>
            <p className="section-caption">{detail.summary}</p>
          </div>
        </section>

        {emergencyType === 'red-help' && (
          <>
            <div className="alert-note" style={{ marginTop: 16 }} role="alert" data-testid="notice-red-help-safety">
              HELIVIA cannot call emergency services. If you need urgent help, contact your local emergency number directly when safe.
            </div>
            {sosEvent && <section className="panel nearby-event-panel" data-testid="panel-nearby-sos-event">
              <div className="nearby-event-header">
                <span className="nearby-orbit"><Radio size={22} aria-hidden="true" /></span>
                <div>
                  <div className="eyebrow">10-Meter Nearby SOS</div>
                  <h2 className="section-title">Local event created</h2>
                  <p className="section-caption">No countdown. This event and workflow are simulated on this device only.</p>
                </div>
              </div>
              <div className="nearby-facts">
                <div><span>Radius</span><strong data-testid="value-sos-radius">{sosEvent.radiusMeters} meters</strong></div>
                <div><span>Provider mode</span><strong data-testid="value-sos-provider">{sosEvent.providerMode === 'demo' ? 'Demo simulator' : sosEvent.providerMode}</strong></div>
                <div><span>Event reference</span><strong className="event-id">{sosEvent.id}</strong></div>
              </div>
              <div className="nearby-truth-note" data-testid="status-sos-no-alert">
                Simulated users only. No alert was sent, and no person or service was contacted.
              </div>
              <h3 className="nearby-list-title"><UsersRound size={16} aria-hidden="true" /> Simulated nearby profiles</h3>
              {sosEvent.detections.length ? <div className="nearby-record-list">
                {sosEvent.detections.map((detection) => {
                  const delivery = sosEvent.deliveries.find((item) => item.userId === detection.userId);
                  return <article className="nearby-record" key={detection.userId} data-testid={`nearby-detection-${detection.userId}`}>
                    <div className="nearby-record-heading">
                      <strong>{detection.label}</strong><span className="sample-tag">{detection.simulated ? 'Simulated' : 'Provider record'}</span>
                    </div>
                    <p>{detection.distanceMeters} m away · {detection.source === 'demo-simulator' ? 'demo simulator' : 'provider source'}</p>
                    <div className="delivery-state" data-testid={`delivery-status-${detection.userId}`}>
                      Delivery: {delivery?.status === 'simulated-not-sent' ? 'simulated — not sent' : delivery?.status ?? 'no delivery record'}
                    </div>
                    {delivery && <small>{delivery.detail}</small>}
                  </article>;
                })}
              </div> : <div className="empty-state" data-testid="empty-sos-detections">No simulated profiles in this event radius.</div>}
            </section>}
          </>
        )}

        <section className="panel panel-pad" style={{ marginTop: 16 }}>
          <div className="section-head" style={{ marginTop: 0 }}>
            <div>
              <h2 className="section-title">Details for this demo</h2>
              <p className="section-caption">{detail.prompt}</p>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-mark"><Check size={17} /></span>
            <div>
              <div className="activity-title">Selected action</div>
              <div className="activity-meta">{detail.title}</div>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-mark"><Check size={17} /></span>
            <div>
              <div className="activity-title">Local timestamp</div>
              <time className="activity-meta" dateTime={timestamp.toISOString()} data-testid="value-emergency-timestamp">{formatTimestamp(timestamp)}</time>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-mark"><MapPin size={17} /></span>
            <div>
              <div className="activity-title">Location</div>
              {location
                ? <div className="activity-meta" data-testid="value-emergency-location">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} · browser-provided</div>
                : <div className="activity-meta" data-testid="value-emergency-location">Not shared</div>}
            </div>
          </div>
          <div className="form-actions">
            <button className="button secondary" type="button" onClick={requestLocation} data-testid="button-request-location">
              <MapPin aria-hidden="true" /> Add location (optional)
            </button>
          </div>
          {locationStatus && <div className="inline-notice" role="status" data-testid="status-location-feedback">{locationStatus}</div>}
        </section>

        <div className="status-box" style={{ marginTop: 16 }} role="status" data-testid="status-emergency-demo">
          <div className="status-title">Demo only — no alert sent</div>
          <p className="status-copy">No emergency service, hospital, trusted contact, or nearby person has been contacted. Location is never transmitted by this demo.</p>
        </div>

        <div className="form-actions">
          <button className="button" type="button" onClick={saveDemoNote} disabled={saved} data-testid="button-save-emergency-note">
            <Check aria-hidden="true" /> {saved ? 'Demo note saved' : 'Save local demo note'}
          </button>
          <Link href="/" className="button secondary" data-testid="link-back-dashboard"><ArrowLeft aria-hidden="true" /> Back home</Link>
        </div>
        {saved && <div className="inline-notice" role="status" data-testid="status-emergency-saved">Your demo note was added to local activity. Nothing was sent.</div>}
      </div>
    </div>
  );
}
