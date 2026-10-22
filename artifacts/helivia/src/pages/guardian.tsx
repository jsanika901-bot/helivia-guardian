import { useState, type FormEvent } from 'react';
import { MessageCircle, Send, Route, Check, Clock3, Activity as ActivityIcon } from 'lucide-react';
import { PageHeading } from '../components/ui-parts';
import { useAppState, type Activity, type JourneyCheckIn } from '../context/app-state';
import { Link } from 'wouter';

type AssistantReply = {
  id: number;
  command: string;
  text: string;
  journeys?: JourneyCheckIn[];
  activity?: Activity[];
};

function formatWhen(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Time unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function GuardianPage() {
  const {
    contacts, createJourney, completeJourney, cancelJourney,
    getPendingJourneys, getRecentActivity, simulateMissedJourney,
  } = useAppState();
  const [command, setCommand] = useState('');
  const [replies, setReplies] = useState<AssistantReply[]>([]);
  const [counter, setCounter] = useState(0);

  function respond(rawCommand: string) {
    const normalized = rawCommand.trim().toLowerCase().replace(/[.!?]+$/g, '');
    if (!normalized) return;
    let text: string;
    let journeys: JourneyCheckIn[] | undefined;
    let activity: Activity[] | undefined;

    if (normalized.includes('start my') && normalized.includes('journey check-in')) {
      const durationMatch = normalized.match(/(\d+)\s*-\s*(minute|min|hour|hr)/) ?? normalized.match(/(\d+)\s*(minute|min|hour|hr)/);
      const unit = durationMatch?.[2] ?? 'minute';
      const amount = durationMatch ? Number(durationMatch[1]) : 30;
      const durationMinutes = unit.startsWith('hour') || unit === 'hr' ? amount * 60 : amount;
      const safeDuration = Math.max(1, Math.min(durationMinutes, 7 * 24 * 60));
      const firstContact = contacts[0] ?? null;
      const record = createJourney({
        journey: `Assistant journey check-in · ${safeDuration} minutes`,
        destination: 'Not specified',
        expectedArrivalAt: new Date(Date.now() + safeDuration * 60 * 1000).toISOString(),
        trustedContactId: firstContact?.id ?? null,
        source: 'guardian-assistant',
      });
      text = `Started “${record.journey}”. Expected arrival: ${formatWhen(record.expectedArrivalAt)}. Destination: ${record.destination}. Status: ${record.status}. Demo contact: ${firstContact?.name ?? 'none saved'}. This is a local demo check-in; no contact was notified.`;
    } else if (normalized === 'i have arrived safely') {
      const pending = getPendingJourneys();
      const updated = pending.length ? completeJourney(pending[0].id) : null;
      text = updated
        ? `Marked “${updated.journey}” as ${updated.status} at ${formatWhen(updated.resolvedAt ?? new Date().toISOString())}. Completed locally; no contact was notified.`
        : 'There are no pending journey check-ins to complete. Your separate one-tap Safe arrival page is still available.';
    } else if (normalized === 'show pending check-ins') {
      journeys = getPendingJourneys();
      text = journeys.length
        ? `Found ${journeys.length} pending local ${journeys.length === 1 ? 'check-in' : 'check-ins'}. No check-ins are being monitored.`
        : 'There are no pending journey check-ins. No check-ins are being monitored.';
    } else if (normalized === 'show recent activity') {
      activity = getRecentActivity(10);
      text = activity.length ? `Showing ${activity.length} recent local activity ${activity.length === 1 ? 'item' : 'items'}.` : 'There is no recent local activity to show.';
    } else if (normalized === 'cancel my journey check-in') {
      const pending = getPendingJourneys();
      const updated = pending.length ? cancelJourney(pending[0].id) : null;
      text = updated
        ? `Cancelled “${updated.journey}”. Its status is ${updated.status}; this change is local and no contact was notified.`
        : 'There is no pending journey check-in to cancel.';
    } else if (normalized.includes('simulate missed check-in') || normalized.includes('simulate a missed check-in')) {
      const pending = getPendingJourneys();
      const updated = pending.length ? simulateMissedJourney(pending[0].id) : null;
      text = updated
        ? `Manual simulation complete: “${updated.journey}” is now ${updated.status}. This was not automatically detected; there is no timer or monitoring, and no contact was notified.`
        : 'There is no pending check-in to use for this manual missed-state test.';
    } else {
      text = 'I did not recognize that command. Try “Start my 30-minute journey check-in”, “I have arrived safely”, “Show pending check-ins”, “Show recent activity”, or “Cancel my journey check-in”. You can also say “Simulate missed check-in” for a manual test.';
    }
    setCounter((value) => value + 1);
    setReplies((current) => [{ id: counter + 1, command: rawCommand.trim(), text, journeys, activity }, ...current]);
  }

  function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    respond(command);
    setCommand('');
  }

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="Local command prototype"
        title="Guardian Assistant"
        description="Try a typed command to create or update local journey check-ins and read saved activity. Nothing is monitored or sent."
      />
      <div className="assistant-disclaimer" data-testid="assistant-prototype-disclaimer">
        <MessageCircle size={18} aria-hidden="true" />
        <strong>Simulated Alexa+ style prototype — not an official Amazon integration.</strong>
      </div>
      <div className="assistant-layout">
        <section className="panel assistant-console" aria-label="Guardian Assistant command console">
          <div className="assistant-console-head">
            <span className="assistant-mark"><MessageCircle size={19} aria-hidden="true" /></span>
            <div><strong>HELIVIA Assistant</strong><small>Commands run locally in this demo</small></div>
            <span className="assistant-local-tag">LOCAL ONLY</span>
          </div>
          <div className="assistant-transcript" aria-live="polite">
            {!replies.length ? (
              <div className="assistant-empty" data-testid="assistant-empty-state">
                <span className="assistant-empty-icon"><MessageCircle size={22} aria-hidden="true" /></span>
                <h2>What would you like to do?</h2>
                <p>Use a command below. The assistant will act on your saved demo records and show the result.</p>
              </div>
            ) : replies.map((reply) => <article className="assistant-turn" key={reply.id} data-testid={`assistant-response-${reply.id}`}>
              <div className="assistant-user-command">{reply.command}</div>
              <div className="assistant-response-copy">{reply.text}</div>
              {reply.journeys && reply.journeys.length > 0 && <div className="assistant-result-list">
                {reply.journeys.map((record) => <div key={record.id} className="assistant-result" data-testid={`assistant-journey-result-${record.id}`}>
                  <Route size={15} aria-hidden="true" /><span><strong>{record.journey}</strong><small>{record.destination} · expected {formatWhen(record.expectedArrivalAt)} · {record.status}</small></span>
                </div>)}
              </div>}
              {reply.activity && reply.activity.length > 0 && <div className="assistant-result-list">
                {reply.activity.map((item) => <div key={item.id} className="assistant-result" data-testid={`assistant-activity-result-${item.id}`}>
                  <ActivityIcon size={15} aria-hidden="true" /><span><strong>{item.title}</strong><small>{item.description} · {formatWhen(item.createdAt)}</small></span>
                </div>)}
              </div>}
            </article>)}
          </div>
          <form className="assistant-input-row" onSubmit={submitCommand}>
            <label className="sr-only" htmlFor="assistant-command">Type a command</label>
            <input id="assistant-command" value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Type a command…" data-testid="input-assistant-command" />
            <button className="button" type="submit" disabled={!command.trim()} aria-label="Run command" data-testid="button-run-assistant-command"><Send size={17} aria-hidden="true" /><span>Run</span></button>
          </form>
        </section>
        <aside className="assistant-guidance">
          <div className="assistant-guidance-card">
            <div className="eyebrow">Try a command</div>
            <h2 className="section-title">A few useful phrases</h2>
            <ul className="command-examples">
              <li>Start my 30-minute journey check-in</li>
              <li>I have arrived safely</li>
              <li>Show pending check-ins</li>
              <li>Show recent activity</li>
              <li>Cancel my journey check-in</li>
              <li>Simulate missed check-in</li>
            </ul>
          </div>
          <div className="assistant-truth-note">
            <Check size={17} aria-hidden="true" />
            <p>Journey check-ins are separate from emergency help and the one-tap Safe arrival page. No command contacts a person or emergency service.</p>
          </div>
          <div className="assistant-guidance-links">
            <Link href="/journeys" data-testid="link-assistant-journeys"><Route size={16} aria-hidden="true" /> View journey records</Link>
            <Link href="/activity" data-testid="link-assistant-activity"><Clock3 size={16} aria-hidden="true" /> Open activity history</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
