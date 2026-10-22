import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { Check, Clock3, MapPin, Route, UserRound, X, TriangleAlert } from 'lucide-react';
import { PageHeading, SectionHeading } from '../components/ui-parts';
import { useAppState, type JourneyCheckIn, type JourneyStatus } from '../context/app-state';

function localDateTimeValue(date: Date) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 16);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Time unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function nextAction(status: JourneyStatus) {
  if (status === 'pending') {
    return 'Next action: check in when you arrive, or cancel this local plan. The missed-state button is a manual demo test.';
  }
  if (status === 'completed') {
    return 'Next action: no further step is needed for this local demo record.';
  }
  if (status === 'cancelled') {
    return 'Next action: create a new journey plan whenever you are ready.';
  }
  return 'Next action: this was a manual test only. Create a new plan if you need another check-in.';
}

const statusLabels: Record<JourneyStatus, string> = {
  pending: 'Pending check-in',
  completed: 'Completed locally',
  cancelled: 'Cancelled locally',
  'missed-demo': 'Missed check-in · manual demo',
};

export default function JourneysPage() {
  const { contacts, journeys, createJourney, completeJourney, cancelJourney, simulateMissedJourney } = useAppState();
  const [journey, setJourney] = useState('');
  const [destination, setDestination] = useState('');
  const [expectedArrivalAt, setExpectedArrivalAt] = useState(() => localDateTimeValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [trustedContactId, setTrustedContactId] = useState('');
  const [notice, setNotice] = useState('');

  function submitJourney(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contacts.length || !trustedContactId) {
      setNotice('Choose a saved demo trusted contact before creating a journey.');
      return;
    }
    if (!journey.trim() || !destination.trim() || !expectedArrivalAt) return;
    const record = createJourney({
      journey: journey.trim(),
      destination: destination.trim(),
      expectedArrivalAt: new Date(expectedArrivalAt).toISOString(),
      trustedContactId,
      source: 'manual',
    });
    setJourney('');
    setDestination('');
    setNotice(`“${record.journey}” is now a pending local check-in. No contact was notified.`);
  }

  function resolve(action: 'complete' | 'cancel' | 'missed', record: JourneyCheckIn) {
    const updated = action === 'complete'
      ? completeJourney(record.id)
      : action === 'cancel'
        ? cancelJourney(record.id)
        : simulateMissedJourney(record.id);
    if (!updated) {
      setNotice('This check-in is no longer pending.');
      return;
    }
    setNotice(action === 'missed'
      ? `Manual test recorded “${updated.journey}” as missed-demo. No monitoring occurred and no contact was notified.`
      : `“${updated.journey}” is ${updated.status} locally. No contact was notified.`);
  }

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="A plan, not a promise"
        title="Journey check-ins"
        description="Keep a planned destination and expected arrival in one place. These local demo records are not monitored and never notify a contact."
      />
      <div className="journey-layout">
        <section className="panel panel-pad journey-create-panel">
          <SectionHeading title="Plan a journey" caption="A simple check-in you can complete or cancel yourself." />
          {!contacts.length ? (
            <div className="empty-state journey-contact-empty" data-testid="empty-journey-contacts">
              <UserRound size={22} aria-hidden="true" />
              <p>Add a trusted contact before creating a journey check-in. The contact is for your reference only and will not be notified.</p>
              <Link href="/contacts" className="button secondary" data-testid="link-journey-add-contact">Go to Trusted contacts</Link>
            </div>
          ) : (
            <form onSubmit={submitJourney} data-testid="form-create-journey">
              <div className="form-grid journey-form-grid">
                <div className="field full-span">
                  <label htmlFor="journey-name">Journey name</label>
                  <input id="journey-name" value={journey} onChange={(event) => setJourney(event.target.value)} placeholder="For example, Evening class" required data-testid="input-journey-name" />
                </div>
                <div className="field full-span">
                  <label htmlFor="journey-destination">Destination</label>
                  <input id="journey-destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="A place for your own reference" required data-testid="input-journey-destination" />
                </div>
                <div className="field full-span">
                  <label htmlFor="journey-arrival">Expected arrival</label>
                  <input id="journey-arrival" type="datetime-local" value={expectedArrivalAt} onChange={(event) => setExpectedArrivalAt(event.target.value)} required data-testid="input-journey-arrival" />
                </div>
                <div className="field full-span">
                  <label htmlFor="journey-contact">Demo trusted contact</label>
                  <select id="journey-contact" value={trustedContactId} onChange={(event) => setTrustedContactId(event.target.value)} required data-testid="select-journey-contact">
                    <option value="">Choose a saved contact</option>
                    {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name} · {contact.relationship || 'Contact'}</option>)}
                  </select>
                  <span className="field-help">This selection is stored only in the local demo record. Nothing is sent or shared.</span>
                </div>
              </div>
              {notice && <div className="inline-notice" role="status" data-testid="status-journey-feedback">{notice}</div>}
              <div className="form-actions">
                <button className="button" type="submit" disabled={!contacts.length || !trustedContactId} data-testid="button-create-journey">
                  <Route aria-hidden="true" /> Create local check-in
                </button>
              </div>
            </form>
          )}
          {!contacts.length && notice && <div className="inline-notice" role="status">{notice}</div>}
        </section>
        <aside className="journey-side-note">
          <div className="eyebrow">Useful to know</div>
          <h2 className="section-title">You stay in control.</h2>
          <p>Expected arrival times are saved for you; HELIVIA does not watch the clock, detect a missed arrival, or contact your selected person.</p>
          <div className="journey-note-rule" />
          <p><strong>Manual missed test</strong><br />Use the test action on a pending record to explore the missed-demo state. It is not an automatic alert.</p>
        </aside>
      </div>

      <section className="journey-records-section" aria-labelledby="journey-records-title">
        <SectionHeading title="Your journey records" caption={`${journeys.length} local ${journeys.length === 1 ? 'record' : 'records'} · newest first`} />
        {!journeys.length ? (
          <div className="empty-state" data-testid="empty-journeys">
            <Route size={23} aria-hidden="true" /><br />No journey check-ins yet. Create one when you have a plan to keep visible.
          </div>
        ) : (
          <div className="journey-record-list">
            {journeys.map((record) => {
              const contact = contacts.find((entry) => entry.id === record.trustedContactId);
              return <article className={`journey-record journey-${record.status}`} key={record.id} data-testid={`journey-record-${record.id}`}>
                <div className="journey-record-top">
                  <span className={`journey-status status-${record.status}`} data-testid={`journey-status-${record.id}`}>{statusLabels[record.status]}</span>
                  <span className="journey-source">{record.source === 'guardian-assistant' ? 'Assistant demo' : 'Manual plan'}</span>
                </div>
                <h3 data-testid={`journey-name-${record.id}`}>{record.journey}</h3>
                <div className="journey-details">
                  <span><MapPin size={15} aria-hidden="true" />{record.destination}</span>
                  <span><Clock3 size={15} aria-hidden="true" />Expected {formatDate(record.expectedArrivalAt)}</span>
                  <span><UserRound size={15} aria-hidden="true" />{contact?.name ?? 'Contact no longer saved'} · not notified</span>
                </div>
                <p className="journey-next-action" data-testid={`journey-next-action-${record.id}`}>{nextAction(record.status)}</p>
                {record.status === 'missed-demo' && <p className="missed-demo-note" data-testid={`journey-manual-test-${record.id}`}><TriangleAlert size={15} aria-hidden="true" />Manual simulation only — no timer, monitoring, or contact notification.</p>}
                {record.status === 'pending' && <div className="journey-actions">
                  <button className="button" type="button" onClick={() => resolve('complete', record)} data-testid={`button-complete-journey-${record.id}`}><Check aria-hidden="true" /> I arrived</button>
                  <button className="button secondary" type="button" onClick={() => resolve('cancel', record)} data-testid={`button-cancel-journey-${record.id}`}><X aria-hidden="true" /> Cancel</button>
                  <button className="journey-test-button" type="button" onClick={() => resolve('missed', record)} data-testid={`button-simulate-missed-${record.id}`}>Test missed state</button>
                </div>}
                {record.resolvedAt && <div className="journey-resolved-at" data-testid={`journey-resolved-at-${record.id}`}>Updated {formatDate(record.resolvedAt)}</div>}
              </article>;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
