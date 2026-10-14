import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type EmergencyType = 'red-help' | 'green-help' | 'yellow-help' | 'blue-check-in';

export type Contact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
};

export type MedicalProfile = {
  enabled: boolean;
  consent: boolean;
  bloodType: string;
  allergies: string;
  medications: string;
  conditions: string;
  notes: string;
};

export type Activity = {
  id: string;
  type: EmergencyType | 'safe-arrival' | 'profile';
  title: string;
  createdAt: string;
  description: string;
};

export type PrivacySettings = {
  locationEnabled: boolean;
  medicalSharingConsent: boolean;
  localStorageEnabled: boolean;
};

type AppState = {
  contacts: Contact[];
  medicalProfile: MedicalProfile;
  activity: Activity[];
  privacy: PrivacySettings;
};

type AppStateContextValue = AppState & {
  updateContacts: (contacts: Contact[]) => void;
  updateMedicalProfile: (profile: MedicalProfile) => void;
  updatePrivacy: (privacy: PrivacySettings) => void;
  addActivity: (item: Omit<Activity, 'id' | 'createdAt'>) => void;
  clearActivity: () => void;
  clearDemoData: () => void;
};

const STORAGE_KEY = 'helivia-demo-state-v1';

const initialState: AppState = {
  contacts: [
    { id: 'sample-1', name: 'Maya Chen', relationship: 'Sister', phone: '+1 (415) 555-0148' },
    { id: 'sample-2', name: 'Jordan Lee', relationship: 'Friend', phone: '+1 (415) 555-0183' },
  ],
  medicalProfile: {
    enabled: false,
    consent: false,
    bloodType: '',
    allergies: '',
    medications: '',
    conditions: '',
    notes: '',
  },
  activity: [
    {
      id: 'sample-activity-1',
      type: 'safe-arrival',
      title: 'Safe arrival check-in',
      createdAt: '2025-01-18T17:42:00.000Z',
      description: 'Sample activity shown for demonstration.',
    },
  ],
  privacy: {
    locationEnabled: false,
    medicalSharingConsent: false,
    localStorageEnabled: true,
  },
};

function readStoredState(): AppState {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...initialState, ...JSON.parse(stored) } : initialState;
  } catch {
    return initialState;
  }
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(readStoredState);

  useEffect(() => {
    if (!state.privacy.localStorageEnabled) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Local storage may be unavailable; the app continues in memory.
      }
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Local storage may be unavailable; the app continues in memory.
    }
  }, [state]);

  const value = useMemo<AppStateContextValue>(() => ({
    ...state,
    updateContacts: (contacts) => setState((current) => ({ ...current, contacts })),
    updateMedicalProfile: (medicalProfile) => setState((current) => ({ ...current, medicalProfile })),
    updatePrivacy: (privacy) => setState((current) => ({
      ...current,
      privacy,
      medicalProfile: {
        ...current.medicalProfile,
        consent: privacy.medicalSharingConsent,
      },
    })),
    addActivity: (item) => setState((current) => ({
      ...current,
      activity: [
        {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
        },
        ...current.activity,
      ],
    })),
    clearActivity: () => setState((current) => ({
      ...current,
      activity: [],
    })),
    clearDemoData: () => setState((current) => ({
      ...current,
      contacts: [],
      medicalProfile: {
        enabled: false,
        consent: false,
        bloodType: '',
        allergies: '',
        medications: '',
        conditions: '',
        notes: '',
      },
      activity: [],
      privacy: {
        ...current.privacy,
        medicalSharingConsent: false,
      },
    })),
  }), [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return value;
}
