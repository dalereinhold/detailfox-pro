import { useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase, type VehicleType, type VehicleCondition, type VehicleServiceType } from '@/lib/supabase';
import { SERVICE_TYPES } from '@/lib/service-types';

interface IntakeFormProps {
  onVehicleAdded: () => void;
}

const VEHICLE_TYPES: VehicleType[] = ['New', 'Used', 'Demo'];
const CONDITIONS: VehicleCondition[] = ['Excellent', 'Good', 'Fair', 'Poor'];

export default function IntakeForm({ onVehicleAdded }: IntakeFormProps) {
  const [licensePlate, setLicensePlate] = useState('');
  const [type, setType] = useState<VehicleType>('New');
  const [condition, setCondition] = useState<VehicleCondition>('Excellent');
  const [serviceType, setServiceType] = useState<VehicleServiceType>('Full Detail');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLicensePlateChange(val: string) {
    const clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    let formatted = clean;
    if (clean.length > 3) {
      formatted = `${clean.slice(0, 3)} ${clean.slice(3, 6)}`;
    } else {
      formatted = clean.slice(0, 3);
    }

    setLicensePlate(formatted);
  }

  function handleTypeChange(newType: VehicleType) {
    setType(newType);

    if (newType === 'New') {
      setCondition('Excellent');
      setServiceType('Full Detail');
    } else if (newType === 'Used') {
      setCondition('Fair');
      setServiceType('Full Detail');
    } else if (newType === 'Demo') {
      setCondition('Good');
      setServiceType('Quick Detail');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = licensePlate.trim();

    if (!trimmed) {
      setError('License plate is required.');
      return;
    }

    const swedishPlateRegex = /^[A-Z]{3} \d{2}[A-Z0-9]$/;
    if (!swedishPlateRegex.test(trimmed)) {
      setError('Please enter a valid Swedish license plate (e.g., ABC 123 or ABC 12A).');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: dbError } = await supabase.from('vehicles').insert({
      license_plate: trimmed,
      type,
      condition,
      service_type: serviceType,
      notes: notes.trim() || null,
      status: 'In Progress',
    });

    setLoading(false);
    if (dbError) { setError(dbError.message); return; }

    setLicensePlate('');
    setType('New');
    setCondition('Excellent');
    setServiceType('Full Detail');
    setNotes('');
    onVehicleAdded();
  }

  const inputClass =
    'w-full bg-background border border-input text-foreground text-base rounded-md px-3 py-3 focus:outline-none focus:ring-1 focus:ring-ring transition-colors placeholder:text-muted-foreground';
  const labelClass = 'block text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1.5';

  return (
    <section className="border border-border bg-card text-card-foreground rounded-lg overflow-hidden">
      <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Vehicle Intake</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelClass} htmlFor="licensePlate">License Plate</label>
            <input
              id="licensePlate"
              type="text"
              className={`${inputClass} uppercase tracking-widest font-bold text-lg`}
              placeholder="ABC 123"
              value={licensePlate}
              onChange={(e) => handleLicensePlateChange(e.target.value)}
              maxLength={7}
              autoComplete="off"
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="type">Vehicle Type</label>
            <select
              id="type"
              className={`${inputClass} cursor-pointer`}
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as VehicleType)}
            >
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="condition">Condition</label>
            <select
              id="condition"
              className={`${inputClass} cursor-pointer`}
              value={condition}
              onChange={(e) => setCondition(e.target.value as VehicleCondition)}
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="serviceType">Service Type</label>
            <select
              id="serviceType"
              className={`${inputClass} cursor-pointer`}
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as VehicleServiceType)}
            >
              {SERVICE_TYPES.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-5">
          <label className={labelClass} htmlFor="notes">
            Notes <span className="text-muted-foreground normal-case tracking-normal font-normal">— optional</span>
          </label>
          <input
            id="notes"
            type="text"
            className={inputClass}
            placeholder="Special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm rounded-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm uppercase tracking-widest px-6 py-3 transition-colors rounded-md"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Adding...' : 'Add Vehicle'}
        </button>
      </form>
    </section>
  );
}
