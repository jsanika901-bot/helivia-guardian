export const NEARBY_SOS_RADIUS_METERS = 10;

export type NearbyDetection = {
  userId: string;
  label: string;
  distanceMeters: number;
  detectedAt: string;
  simulated: boolean;
  source: 'demo-simulator' | 'bluetooth-le';
};

export type NearbyAlertDelivery = {
  id: string;
  userId: string;
  status: 'simulated-not-sent' | 'delivered' | 'failed';
  simulated: boolean;
  detail: string;
};

export interface NearbySosProximityAdapter {
  readonly mode: 'demo' | 'bluetooth-le';
  detectWithinRadius(radiusMeters: number): NearbyDetection[];
  prepareAlertWorkflow(eventId: string, detections: NearbyDetection[]): NearbyAlertDelivery[];
}

const simulatedNearbyUsers = [
  { userId: 'simulated-user-a', label: 'Simulated nearby user A', distanceMeters: 3.4 },
  { userId: 'simulated-user-b', label: 'Simulated nearby user B', distanceMeters: 8.1 },
];

export class DemoNearbySosAdapter implements NearbySosProximityAdapter {
  readonly mode = 'demo' as const;

  detectWithinRadius(radiusMeters: number): NearbyDetection[] {
    const detectedAt = new Date().toISOString();

    return simulatedNearbyUsers
      .filter((user) => user.distanceMeters <= radiusMeters)
      .map((user) => ({
        ...user,
        detectedAt,
        simulated: true,
        source: 'demo-simulator' as const,
      }));
  }

  prepareAlertWorkflow(eventId: string, detections: NearbyDetection[]): NearbyAlertDelivery[] {
    return detections.map((detection) => ({
      id: `${eventId}-${detection.userId}`,
      userId: detection.userId,
      status: 'simulated-not-sent',
      simulated: true,
      detail: 'Simulation only. No alert was sent.',
    }));
  }
}

// A future Android/BLE provider can implement this contract after permissions,
// device support, and nearby-user consent are designed and tested.
export const nearbySosAdapter: NearbySosProximityAdapter = new DemoNearbySosAdapter();
