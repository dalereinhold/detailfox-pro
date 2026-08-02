import { supabase } from '@/lib/supabase';
import type { VehicleType, VehicleCondition, VehicleStatus, VehicleServiceType } from '@/lib/supabase';

export const generateSeedData = (count: number = 20) => {
  const generatedVehicles = [];
  const now = new Date();
  const TYPES: VehicleType[] = ['New', 'Used', 'Demo'];
  const NOTES_POOL = [
    'Full exterior wash and wax requested.',
    'Interior vacuum and leather conditioning.',
    'Remove pet hair from trunk.',
    'Engine bay detailing.',
    'Paint correction on hood scratch.',
    'Windshield water repellent treatment.',
    'Odor eliminator treatment.',
    null,
    null,
  ];

  for (let i = 0; i < count; i++) {
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];

    let condition: VehicleCondition = 'Good';
    let serviceType: VehicleServiceType = 'Full Detail';

    if (type === 'New') {
      condition = 'Excellent';
      serviceType = 'Full Detail';
    } else if (type === 'Used') {
      condition = 'Fair';
      serviceType = 'Full Detail';
    } else if (type === 'Demo') {
      condition = 'Good';
      serviceType = 'Quick Detail';
    }

    const randStatus = Math.random();
    const status: VehicleStatus = randStatus < 0.7 ? 'Completed' : randStatus < 0.85 ? 'In Progress' : 'On Break';

    const netWorkSeconds = Math.floor(Math.random() * (5400 - 900 + 1)) + 900;
    const notes = NOTES_POOL[Math.floor(Math.random() * NOTES_POOL.length)];

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';

    const randomLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randomDigits = Array.from({ length: 2 }, () => digits[Math.floor(Math.random() * digits.length)]).join('');

    const lastChar = Math.random() < 0.8
      ? digits[Math.floor(Math.random() * digits.length)]
      : letters[Math.floor(Math.random() * letters.length)];

    const licensePlate = `${randomLetters} ${randomDigits}${lastChar}`;

    const hoursAgo = Math.random() * 24;
    const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

    generatedVehicles.push({
      license_plate: licensePlate,
      type,
      condition,
      service_type: serviceType,
      status,
      notes,
      net_work_seconds: status === 'Completed' ? netWorkSeconds : Math.floor(netWorkSeconds / 2),
      started_at: status === 'In Progress' ? new Date(now.getTime() - 10 * 60 * 1000).toISOString() : null,
      break_started_at: status === 'On Break' ? new Date(now.getTime() - 5 * 60 * 1000).toISOString() : null,
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  return generatedVehicles;
};

export const seedData = async (refetch: () => void) => {
  if (!confirm('Are you sure you want to add 20 randomized vehicles to the database?')) return;

  const generatedVehicles = generateSeedData(20);
  const { error: seedError } = await supabase.from('vehicles').insert(generatedVehicles);

  if (seedError) {
    alert(`Failed to seed data: ${seedError.message}`);
  } else {
    refetch();
  }
};
