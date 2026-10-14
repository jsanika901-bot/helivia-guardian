import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, UsersRound, X } from 'lucide-react';
import { PageHeading, SectionHeading } from '../components/ui-parts';
import { useAppState, type Contact } from '../context/app-state';

const blankContact = { name: '', relationship: '', phone: '' };

export default function ContactsPage() {
  const { contacts, updateContacts } = useAppState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankContact);
  const [notice, setNotice] = useState('');

  function startAdd() {
    setEditingId('new');
    setForm(blankContact);
    setNotice('');
  }

  function startEdit(contact: Contact) {
    setEditingId(contact.id);
    setForm({ name: contact.name, relationship: contact.relationship, phone: contact.phone });
    setNotice('');
  }

  function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setNotice('Add a name and phone number to save this contact.');
      return;
    }

    if (editingId === 'new') {
      updateContacts([...contacts, { ...form, id: `contact-${Date.now()}` }]);
    } else {
      updateContacts(contacts.map((contact) => contact.id === editingId ? { ...contact, ...form } : contact));
    }

    setEditingId(null);
    setNotice('Demo contact saved on this device.');
  }

  function removeContact(id: string) {
    const contact = contacts.find((entry) => entry.id === id);
    if (!contact || !window.confirm(`Remove ${contact.name} from this demo list?`)) {
      return;
    }
    updateContacts(contacts.filter((entry) => entry.id !== id));
    setNotice('Contact removed from this device.');
  }

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="People you choose"
        title="Trusted contacts"
        description="Keep important details nearby for your own reference. Saving a contact here does not notify or share it with them."
      />
      <section className="panel panel-pad">
        <SectionHeading
          title="Contact list"
          caption="All seeded entries are clearly labeled sample data."
          action={
            <button className="button" onClick={startAdd} data-testid="button-add-contact">
              <Plus aria-hidden="true" /> Add contact
            </button>
          }
        />
        {contacts.length ? (
          <div className="activity-list">
            {contacts.map((contact) => (
              <div className="contact-card panel" key={contact.id} data-testid={`contact-card-${contact.id}`}>
                <span className="contact-avatar" aria-hidden="true">{contact.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
                <div className="contact-detail">
                  <div className="contact-name" data-testid={`contact-name-${contact.id}`}>{contact.name}</div>
                  <div className="contact-sub">{contact.relationship || 'Relationship not set'} · {contact.phone}</div>
                  {contact.id.startsWith('sample-') && <span className="sample-tag">Sample data</span>}
                </div>
                <button className="icon-button" aria-label={`Edit ${contact.name}`} onClick={() => startEdit(contact)} data-testid={`button-edit-contact-${contact.id}`}>
                  <Pencil size={17} />
                </button>
                <button className="icon-button" aria-label={`Remove ${contact.name}`} onClick={() => removeContact(contact.id)} data-testid={`button-remove-contact-${contact.id}`}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><UsersRound size={22} /><br />No contacts saved. Add one when you are ready.</div>
        )}
      </section>

      {editingId && (
        <div className="panel form-card" style={{ marginTop: 20 }}>
          <SectionHeading
            title={editingId === 'new' ? 'Add a contact' : 'Edit contact'}
            caption="This information stays local to your demo."
            action={<button className="icon-button" onClick={() => setEditingId(null)} aria-label="Close contact form" data-testid="button-close-contact-form"><X size={18} /></button>}
          />
          <form onSubmit={saveContact}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="contact-name">Name</label>
                <input id="contact-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" required data-testid="input-contact-name" />
              </div>
              <div className="field">
                <label htmlFor="contact-relationship">Relationship</label>
                <input id="contact-relationship" value={form.relationship} onChange={(event) => setForm({ ...form, relationship: event.target.value })} placeholder="Friend, family, neighbor…" data-testid="input-contact-relationship" />
              </div>
              <div className="field full-span">
                <label htmlFor="contact-phone">Phone number</label>
                <input id="contact-phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="For your own reference" required data-testid="input-contact-phone" />
                <span className="field-help">HELIVIA will not call or message this number.</span>
              </div>
            </div>
            {notice && <div className="inline-notice" role="status">{notice}</div>}
            <div className="form-actions">
              <button className="button" type="submit" data-testid="button-save-contact">Save contact</button>
              <button className="button secondary" type="button" onClick={() => setEditingId(null)} data-testid="button-cancel-contact">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {!editingId && notice && <div className="inline-notice" role="status" data-testid="status-contact-feedback">{notice}</div>}
    </div>
  );
}
