import { useState } from 'react';
import { Database, LockKeyhole, MapPin, ShieldCheck } from 'lucide-react';
import { PageHeading } from '../components/ui-parts';
import { useAppState } from '../context/app-state';

export default function PrivacyPage() {
  const { privacy, updatePrivacy, clearDemoData: clearAllData, contacts, activity } = useAppState();
  const [notice, setNotice] = useState('');

  function toggle(key: keyof typeof privacy, value: boolean) {
    updatePrivacy({ ...privacy, [key]: value });
    setNotice(key === 'localStorageEnabled'
      ? value
        ? 'Local storage enabled. Demo data can persist on this device.'
        : 'Local storage disabled. Stored demo data was removed; changes now remain in memory only.'
      : value
        ? 'Setting enabled. Location is still only requested after you choose it in a flow.'
        : 'Setting disabled.');
  }

  function clearDemoData() {
    if (!window.confirm('Remove saved demo data from this device? This clears contacts, activity, and your optional profile.')) {
      return;
    }
    clearAllData();
    setNotice('Contacts, profile details, and activity cleared from this device.');
  }

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="Your choices, clearly stated"
        title="Privacy controls"
        description="HELIVIA is a front-end demo. There is no account, backend, transmission, tracking, or emergency delivery."
      />
      <section className="panel panel-pad">
        <h2 className="section-title"><LockKeyhole size={19} style={{ verticalAlign: 'middle', marginRight: 8 }} />Your controls</h2>
        <p className="section-caption">All options begin with the most private choice.</p>
        <div style={{ marginTop: 14 }}>
          <div className="toggle-row">
            <div className="toggle-copy">
              <strong><MapPin size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />Allow optional location</strong>
              <span>Off by default. When on, a page may ask the browser for location only after you press its location button. It is displayed locally and never transmitted or tracked.</span>
            </div>
            <button className="switch" type="button" role="switch" aria-checked={privacy.locationEnabled} aria-label="Allow optional location" onClick={() => toggle('locationEnabled', !privacy.locationEnabled)} data-testid="switch-location-enabled" />
          </div>
          <div className="toggle-row">
            <div className="toggle-copy">
              <strong><ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />Medical sharing consent</strong>
              <span>Consent is explicit and separate from enabling your optional medical profile. No data sharing feature exists in this demo.</span>
            </div>
            <button className="switch" type="button" role="switch" aria-checked={privacy.medicalSharingConsent} aria-label="Medical sharing consent" onClick={() => toggle('medicalSharingConsent', !privacy.medicalSharingConsent)} data-testid="switch-privacy-medical-consent" />
          </div>
          <div className="toggle-row">
            <div className="toggle-copy">
              <strong><Database size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />Save demo data on this device</strong>
              <span>When enabled, contacts, activity, profile, and preferences use this browser’s local storage. Turn off to remove the saved copy and keep changes in memory only.</span>
            </div>
            <button className="switch" type="button" role="switch" aria-checked={privacy.localStorageEnabled} aria-label="Save demo data on this device" onClick={() => toggle('localStorageEnabled', !privacy.localStorageEnabled)} data-testid="switch-local-storage" />
          </div>
        </div>
      </section>

      <section className="panel panel-pad" style={{ marginTop: 16 }}>
        <h2 className="section-title">What stays here</h2>
        <div className="content-grid" style={{ marginTop: 16 }}>
          <div className="privacy-callout">
            <h3>Local demo details</h3>
            <p>{contacts.length} contact entries and {activity.length} activity entries currently shown. Medical details are optional. No value leaves this browser.</p>
          </div>
          <div className="privacy-callout">
            <h3>Not included</h3>
            <p>No automatic location, AI detection, dispatch, calls, texts, accounts, external services, or monitoring.</p>
          </div>
        </div>
        <div className="form-actions">
          <button className="button secondary" type="button" onClick={clearDemoData} data-testid="button-clear-demo-data">Clear saved demo data</button>
        </div>
      </section>
      {notice && <div className="inline-notice" role="status" data-testid="status-privacy-feedback">{notice}</div>}
      <div className="alert-note" style={{ marginTop: 16 }}>
        HELIVIA cannot request help on your behalf. If you are in immediate danger, contact local emergency services directly when it is safe to do so.
      </div>
    </div>
  );
}
