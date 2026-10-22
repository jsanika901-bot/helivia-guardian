import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  nearbySosAdapter,
  NEARBY_SOS_RADIUS_METERS,
  type NearbyAlertDelivery,
  type NearbyDetection,
} from '../lib/nearby-sos';

export type EmergencyType = 'red-help' | 'green-help' | 'yellow-help' | 'blue-check-in';
export type JourneyStatus = 'pending' | 'completed' | 'cancelled' | 'missed-demo';
export type JourneySource = 'manual' | 'guardian-assistant';

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
  type: EmergencyType | 'safe-arrival' | 'profile' | 'nearby-sos' | 'journey-check-in';
  title: string;
  createdAt: string;
  description: string;
};

export type JourneyCheckIn = {
  id: string;
  journey: string;
  destination: string;
  expectedArrivalAt: string;
  trustedContactId: string | null;
  status: JourneyStatus;
  createdAt: string;
  resolvedAt: string | null;
  source: JourneySource;
  simulated: true;
};

export type NearbySosEvent = {
  id: string;
  createdAt: string;
  radiusMeters: number;
  providerMode: 'demo' | 'bluetooth-le';
  detections: NearbyDetection[];
  deliveries: NearbyAlertDelivery[];
};

export type NewJourneyCheckIn = {
  journey: string;
  destination: string;
  expectedArrivalAt: string;
  trustedContactId: string | null;
  source?: JourneySource;
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
  journeys: JourneyCheckIn[];
  nearbySosEvents: NearbySosEvent[];
};

type AppStateContextValue = AppState & {
  updateContacts: (contacts: Contact[]) => void;
  updateMedicalProfile: (profile: MedicalProfile) => void;
  updatePrivacy: (privacy: PrivacySettings) => void;
  addActivity: (item: Omit<Activity, 'id' | 'createdAt'>) => void;
  clearActivity: () => void;
  clearDemoData: () => void;
  activateRedHelp: () => NearbySosEvent;
  createJourney: (journey: NewJourneyCheckIn) => JourneyCheckIn;
  completeJourney: (id?: string) => JourneyCheckIn | null;
  cancelJourney: (id?: string) => JourneyCheckIn | null;
  simulateMissedJourney: (id: string) => JourneyCheckIn | null;
  getPendingJourneys: () => JourneyCheckIn[];
  getRecentActivity: (limit?: number) => Activity[];
};

const STORAGE_KEY = 'helivia-demo-state-v1';

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeActivity(
  item: Omit<Activity, 'id' | 'createdAt'>,
  createdAt = new Date().toISOString(),
): Activity {
  return {
    ...item,
    id: createId('activity'),
    createdAt,
  };
}

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
  journeys: [],
  nearbySosEvents: [],
};

function readStoredState(): AppState {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initialState;
    }

    const parsed = JSON.parse(stored) as Partial<AppState>;
    return {
      ...initialState,
      ...parsed,
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : initialState.contacts,
      medicalProfile: {
        ...initialState.medicalProfile,
        ...parsed.medicalProfile,
      },
      activity: Array.isArray(parsed.activity) ? parsed.activity : initialState.activity,
      privacy: {
        ...initialState.privacy,
        ...parsed.privacy,
      },
      journeys: Array.isArray(parsed.journeys) ? parsed.journeys : [],
      nearbySosEvents: Array.isArray(parsed.nearbySosEvents) ? parsed.nearbySosEvents : [],
    };
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
      activity: [makeActivity(item), ...current.activity],
    })),
    clearActivity: () => setState((current) => ({
      ...current,
      activity: [],
    })),
    activateRedHelp: () => {
      const createdAt = new Date().toISOString();
      const id = createId('red-help');
      const detections = nearbySosAdapter.detectWithinRadius(NEARBY_SOS_RADIUS_METERS);
      const event: NearbySosEvent = {
        id,
        createdAt,
        radiusMeters: NEARBY_SOS_RADIUS_METERS,
        providerMode: nearbySosAdapter.mode,
        detections,
        deliveries: nearbySosAdapter.prepareAlertWorkflow(id, detections),
      };
      const simulatedCount = detections.filter((detection) => detection.simulated).length;

      setState((current) => ({
        ...current,
        nearbySosEvents: [event, ...current.nearbySosEvents],
        activity: [
          makeActivity({
            type: 'nearby-sos',
            title: 'RED HELP demo event',
            description: `10-Meter Nearby SOS · ${simulatedCount} simulated profiles · no alert sent`,
          }, createdAt),
          ...current.activity,
        ],
      }));

      return event;
    },
    createJourney: (journey) => {
      const createdAt = new Date().toISOString();
      const record: JourneyCheckIn = {
        ...journey,
        id: createId('journey'),
        expectedArrivalAt: new Date(journey.expectedArrivalAt).toISOString(),
        status: 'pending',
        createdAt,
        resolvedAt: null,
        source: journey.source ?? 'manual',
        simulated: true,
      };

      setState((current) => ({
        ...current,
        journeys: [record, ...current.journeys],
        activity: [
          makeActivity({
            type: 'journey-check-in',
            title: `Journey check-in started: ${record.journey}`,
            description: `${record.destination} · pending demo check-in · no contact notified`,
          }, createdAt),
          ...current.activity,
        ],
      }));

      return record;
    },
    completeJourney: (id) => {
      const target = state.journeys.find((journey) => (
        journey.status === 'pending' && (!id || journey.id === id)
      ));
      if (!target) {
        return null;
      }

      const resolvedAt = new Date().toISOString();
      const updated = { ...target, status: 'completed' as const, resolvedAt };
      setState((current) => ({
        ...current,
        journeys: current.journeys.map((journey) => journey.id === target.id && journey.status === 'pending' ? updated : journey),
        activity: [
          makeActivity({
            type: 'journey-check-in',
            title: `Journey completed: ${target.journey}`,
            description: 'Completed locally · no contact was notified',
          }, resolvedAt),
          ...current.activity,
        ],
      }));

      return updated;
    },
    cancelJourney: (id) => {
      const target = state.journeys.find((journey) => (
        journey.status === 'pending' && (!id || journey.id === id)
      ));
      if (!target) {
        return null;
      }

      const resolvedAt = new Date().toISOString();
      const updated = { ...target, status: 'cancelled' as const, resolvedAt };
      setState((current) => ({
        ...current,
        journeys: current.journeys.map((journey) => journey.id === target.id && journey.status === 'pending' ? updated : journey),
        activity: [
          makeActivity({
            type: 'journey-check-in',
            title: `Journey cancelled: ${target.journey}`,
            description: 'Cancelled locally · no contact was notified',
          }, resolvedAt),
          ...current.activity,
        ],
      }));

      return updated;
    },
    simulateMissedJourney: (id) => {
      const target = state.journeys.find((journey) => journey.id === id && journey.status === 'pending');
      if (!target) {
        return null;
      }

      const resolvedAt = new Date().toISOString();
      const updated = { ...target, status: 'missed-demo' as const, resolvedAt };
      setState((current) => ({
        ...current,
        journeys: current.journeys.map((journey) => journey.id === target.id && journey.status === 'pending' ? updated : journey),
        activity: [
          makeActivity({
            type: 'journey-check-in',
            title: `Missed check-in test: ${target.journey}`,
            description: 'Simulated status only · no timer or monitoring · no contact notified',
          }, resolvedAt),
          ...current.activity,
        ],
      }));

      return updated;
    },
    getPendingJourneys: () => state.journeys.filter((journey) => journey.status === 'pending'),
    getRecentActivity: (limit = 10) => state.activity.slice(0, limit),
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
      journeys: [],
      nearbySosEvents: [],
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
