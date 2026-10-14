import { useState } from 'react';
import { Activity as ActivityIcon, Trash2 } from 'lucide-react';
import { PageHeading, SectionHeading } from '../components/ui-parts';
import { ActivityList } from '../components/activity-list';
import { useAppState } from '../context/app-state';

export default function ActivityPage() {
  const { activity, clearActivity } = useAppState();
  const [notice, setNotice] = useState('');

  function clearLocalActivity() {
    if (!window.confirm('Clear all activity from this demo on this device?')) {
      return;
    }
    clearActivity();
    setNotice('Local activity cleared.');
  }

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="On this device"
        title="Recent activity"
        description="A private timeline of demo actions. It is not monitored and cannot confirm that anyone has received a request."
      />
      <section className="panel panel-pad">
        <SectionHeading
          title="Your timeline"
          caption={`${activity.length} ${activity.length === 1 ? 'entry' : 'entries'} · local demo records only`}
          action={
            <button className="button secondary" onClick={clearLocalActivity} disabled={!activity.length} data-testid="button-clear-activity">
              <Trash2 aria-hidden="true" /> Clear
            </button>
          }
        />
        <ActivityList items={activity} />
        {notice && <div className="inline-notice" role="status" data-testid="status-activity-feedback">{notice}</div>}
      </section>
      <div className="alert-note" style={{ marginTop: 16 }}>
        <ActivityIcon size={17} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Demo activity is not a record of an emergency response. No responders or contacts can view this timeline.
      </div>
    </div>
  );
}
