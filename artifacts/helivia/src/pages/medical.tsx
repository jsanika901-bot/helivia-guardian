import { useEffect, useState, type FormEvent } from 'react';
import { HeartPulse, Save } from 'lucide-react';
import { PageHeading } from '../components/ui-parts';
import { useAppState, type MedicalProfile } from '../context/app-state';

export default function MedicalPage() {
  const { medicalProfile, privacy, updateMedicalProfile, updatePrivacy } = useAppState();
  const [form, setForm] = useState<MedicalProfile>(medicalProfile);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setForm(medicalProfile);
  }, [medicalProfile]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateMedicalProfile({ ...form, consent: privacy.medicalSharingConsent });
    setNotice('Medical demo profile saved on this device.');
  }

  function setConsent(checked: boolean) {
    updatePrivacy({ ...privacy, medicalSharingConsent: checked });
    setForm((current) => ({ ...current, consent: checked }));
  }

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="Optional by design"
        title="Medical profile"
        description="Add details only if you want them in this local demo. No profile is shared, delivered, or used to make decisions."
      />
      <form className="panel form-card" onSubmit={submit}>
        <div className="alert-note" role="note">
          <HeartPulse size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
          This is not a medical record. All example values are labeled sample data; blank fields are yours to fill in.
        </div>
        <div style={{ height: 22 }} />
        <div className="toggle-row">
          <div className="toggle-copy">
            <strong>Enable optional medical profile</strong>
            <span>Keep the fields below available in this demo. Off by default.</span>
          </div>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={form.enabled}
            aria-label="Enable optional medical profile"
            onClick={() => setForm({ ...form, enabled: !form.enabled })}
            data-testid="switch-medical-enabled"
          />
        </div>
        <div className="toggle-row">
          <div className="toggle-copy">
            <strong>Consent to medical sharing</strong>
            <span>Explicit consent control for this concept only. No sharing or transmission happens in this demo.</span>
          </div>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={privacy.medicalSharingConsent}
            aria-label="Consent to medical sharing"
            onClick={() => setConsent(!privacy.medicalSharingConsent)}
            data-testid="switch-medical-consent"
          />
        </div>
        <div style={{ height: 22 }} />
        <div className="form-grid">
          <div className="field">
            <label htmlFor="blood-type">Blood type</label>
            <input id="blood-type" value={form.bloodType} onChange={(event) => setForm({ ...form, bloodType: event.target.value })} placeholder="Optional" disabled={!form.enabled} data-testid="input-blood-type" />
          </div>
          <div className="field">
            <label htmlFor="allergies">Allergies</label>
            <input id="allergies" value={form.allergies} onChange={(event) => setForm({ ...form, allergies: event.target.value })} placeholder="Optional" disabled={!form.enabled} data-testid="input-allergies" />
          </div>
          <div className="field">
            <label htmlFor="medications">Medications</label>
            <input id="medications" value={form.medications} onChange={(event) => setForm({ ...form, medications: event.target.value })} placeholder="Optional" disabled={!form.enabled} data-testid="input-medications" />
          </div>
          <div className="field">
            <label htmlFor="conditions">Conditions</label>
            <input id="conditions" value={form.conditions} onChange={(event) => setForm({ ...form, conditions: event.target.value })} placeholder="Optional" disabled={!form.enabled} data-testid="input-conditions" />
          </div>
          <div className="field full-span">
            <label htmlFor="medical-notes">Notes</label>
            <textarea id="medical-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Anything you may want to remember…" disabled={!form.enabled} data-testid="input-medical-notes" />
          </div>
        </div>
        {notice && <div className="inline-notice" role="status" data-testid="status-medical-feedback">{notice}</div>}
        <div className="form-actions">
          <button className="button" type="submit" data-testid="button-save-medical"><Save aria-hidden="true" /> Save profile</button>
        </div>
      </form>
    </div>
  );
}
