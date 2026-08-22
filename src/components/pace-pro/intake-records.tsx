import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Clock,
  Coffee,
  CheckCircle2,
  Hourglass,
} from "lucide-react";
import { supabase, type Vehicle, type VehicleStatus } from "@/lib/supabase";
import {
  STATUS_ORDER,
  getDisplayStatus,
  isPending,
} from "@/lib/pace-pro/vehicle";
import VehicleCard from "./vehicle-card";

interface IntakeProps {
  refreshTrigger: number;
  onVehiclesUpdated?: () => void;
}

type FilterValue = VehicleStatus | "All" | "Pending";

const STATUS_FILTERS: {
  label: string;
  value: FilterValue;
  icon: React.ReactNode;
}[] = [
  { label: "All", value: "All", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  {
    label: "Pending",
    value: "Pending",
    icon: <Hourglass className="w-3.5 h-3.5" />,
  },
  {
    label: "In Progress",
    value: "In Progress",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  {
    label: "On Break",
    value: "On Break",
    icon: <Coffee className="w-3.5 h-3.5" />,
  },
  {
    label: "Completed",
    value: "Completed",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
];

export default function IntakeRecords({
  refreshTrigger,
  onVehiclesUpdated,
}: IntakeProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>("All");

  async function fetchVehicles() {
    setLoading(true);
    setError(null);
    const { data, error: dbError } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      setError(dbError.message);
    } else {
      setVehicles((data as Vehicle[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchVehicles();
  }, [refreshTrigger]);

  const filtered =
    filter === "All"
      ? [...vehicles].sort(
          (a, b) =>
            STATUS_ORDER[getDisplayStatus(a)] -
            STATUS_ORDER[getDisplayStatus(b)],
        )
      : filter === "Pending"
        ? vehicles.filter(isPending)
        : vehicles.filter((v) => v.status === filter && !isPending(v));

  return (
    <section>
      {/* Condensed Filter Tabs */}
      <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1 mb-4">
        {STATUS_FILTERS.map(({ label, value, icon }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            title={label}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              filter === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm rounded-sm mb-6">
          Failed to load vehicles: {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border border-border h-72 animate-pulse bg-muted rounded-lg"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-border bg-card rounded-lg">
          <LayoutGrid className="w-8 h-8 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
            No Vehicles
          </p>
          <p className="text-muted-foreground/70 text-xs mt-1">
            {filter === "All"
              ? "Add a vehicle using the intake form above."
              : filter === "Pending"
                ? "No vehicles waiting to be started."
                : `No vehicles with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onUpdated={fetchVehicles}
            />
          ))}
        </div>
      )}
    </section>
  );
}
