import { useState } from "react";
import { Plus } from "lucide-react";
import {
  supabase,
  type VehicleType,
  type VehicleCondition,
  type VehicleServiceType,
} from "@/lib/supabase";
import {
  DEFAULTS_BY_VEHICLE_TYPE,
  VEHICLE_CONDITIONS,
  VEHICLE_TYPES,
  formatLicensePlateInput,
  isValidSwedishPlate,
} from "@/lib/pace-pro/intake";
import { SERVICE_TYPES } from "@/lib/pace-pro/services";

interface IntakeFormProps {
  onVehicleAdded: () => void;
}

export default function IntakeForm({ onVehicleAdded }: IntakeFormProps) {
  const [licensePlate, setLicensePlate] = useState("");
  const [type, setType] = useState<VehicleType>("New");
  const [condition, setCondition] = useState<VehicleCondition>("Excellent");
  const [serviceType, setServiceType] =
    useState<VehicleServiceType>("Full Detail");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLicensePlateChange(val: string) {
    setLicensePlate(formatLicensePlateInput(val));
  }

  function handleTypeChange(newType: VehicleType) {
    setType(newType);
    const defaults = DEFAULTS_BY_VEHICLE_TYPE[newType];
    setCondition(defaults.condition);
    setServiceType(defaults.serviceType);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = licensePlate.trim();

    if (!trimmed) {
      setError("License plate is required.");
      return;
    }

    if (!isValidSwedishPlate(trimmed)) {
      setError(
        "Please enter a valid Swedish license plate (e.g., ABC 123 or ABC 12A).",
      );
      return;
    }

    setLoading(true);
    setError(null);

    const { error: dbError } = await supabase.from("vehicles").insert({
      license_plate: trimmed,
      type,
      condition,
      service_type: serviceType,
      notes: notes.trim() || null,
      status: "In Progress",
    });

    setLoading(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }

    setLicensePlate("");
    setType("New");
    setCondition("Excellent");
    setServiceType("Full Detail");
    setNotes("");
    onVehicleAdded();
  }

  const inputClass =
    "w-full bg-background border border-input text-foreground text-base rounded-md px-3 py-3 focus:outline-none focus:ring-1 focus:ring-ring transition-colors placeholder:text-muted-foreground";
  const labelClass =
    "block text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1.5";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className={labelClass} htmlFor="licensePlate">
            License Plate
          </label>
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
          <label className={labelClass} htmlFor="type">
            Vehicle Type
          </label>
          <select
            id="type"
            className={`${inputClass} cursor-pointer`}
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as VehicleType)}
          >
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="condition">
            Condition
          </label>
          <select
            id="condition"
            className={`${inputClass} cursor-pointer`}
            value={condition}
            onChange={(e) => setCondition(e.target.value as VehicleCondition)}
          >
            {VEHICLE_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="serviceType">
            Service Type
          </label>
          <select
            id="serviceType"
            className={`${inputClass} cursor-pointer`}
            value={serviceType}
            onChange={(e) =>
              setServiceType(e.target.value as VehicleServiceType)
            }
          >
            {SERVICE_TYPES.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-5">
        <label className={labelClass} htmlFor="notes">
          Notes{" "}
          <span className="text-muted-foreground normal-case tracking-normal font-normal">
            — optional
          </span>
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
        {loading ? "Adding..." : "Add Vehicle"}
      </button>
    </form>
  );
}
