import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { supabase, type Vehicle } from "@/lib/supabase";
import {
  TYPE_COLORS,
  CONDITION_COLORS,
  SERVICE_TYPE_COLORS,
  FALLBACK_BADGE_COLOR,
} from "@/lib/pace-pro/colors";
import {
  computeLiveSeconds,
  elapsedSecondsSince,
  formatCheckinTime,
  formatDuration,
  isPending,
  statusLeftBorder,
} from "@/lib/pace-pro/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  onUpdated: () => void;
}

export default function VehicleCard({ vehicle, onUpdated }: VehicleCardProps) {
  const [liveSeconds, setLiveSeconds] = useState(() =>
    computeLiveSeconds(vehicle),
  );
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(vehicle.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (vehicle.status === "In Progress" && vehicle.started_at) {
      setLiveSeconds(computeLiveSeconds(vehicle));
      intervalRef.current = setInterval(
        () => setLiveSeconds(computeLiveSeconds(vehicle)),
        1000,
      );
    } else {
      setLiveSeconds(vehicle.net_work_seconds);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [vehicle.status, vehicle.started_at, vehicle.net_work_seconds]);

  const isNotStarted = isPending(vehicle);
  const isRunning = vehicle.status === "In Progress" && !!vehicle.started_at;
  const isOnBreak = vehicle.status === "On Break";
  const isCompleted = vehicle.status === "Completed";

  async function handleStart() {
    setBusy(true);
    const now = new Date().toISOString();
    await supabase
      .from("vehicles")
      .update({ status: "In Progress", started_at: now, updated_at: now })
      .eq("id", vehicle.id);
    setBusy(false);
    onUpdated();
  }

  async function handleBreak() {
    setBusy(true);
    const now = new Date();
    const additionalSeconds = elapsedSecondsSince(vehicle.started_at, now);
    await supabase
      .from("vehicles")
      .update({
        status: "On Break",
        started_at: null,
        break_started_at: now.toISOString(),
        net_work_seconds: vehicle.net_work_seconds + additionalSeconds,
        updated_at: now.toISOString(),
      })
      .eq("id", vehicle.id);
    setBusy(false);
    onUpdated();
  }

  async function handleResume() {
    setBusy(true);
    const now = new Date().toISOString();
    await supabase
      .from("vehicles")
      .update({
        status: "In Progress",
        started_at: now,
        break_started_at: null,
        updated_at: now,
      })
      .eq("id", vehicle.id);
    setBusy(false);
    onUpdated();
  }

  async function handleDone() {
    setBusy(true);
    const now = new Date();
    const additionalSeconds = elapsedSecondsSince(vehicle.started_at, now);
    await supabase
      .from("vehicles")
      .update({
        status: "Completed",
        started_at: null,
        break_started_at: null,
        net_work_seconds: vehicle.net_work_seconds + additionalSeconds,
        updated_at: now.toISOString(),
      })
      .eq("id", vehicle.id);
    setBusy(false);
    onUpdated();
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    const trimmed = notesValue.trim();
    await supabase
      .from("vehicles")
      .update({ notes: trimmed || null, updated_at: new Date().toISOString() })
      .eq("id", vehicle.id);
    setSavingNotes(false);
    setEditingNotes(false);
    onUpdated();
  }

  function handleEditNotes() {
    setNotesValue(vehicle.notes ?? "");
    setEditingNotes(true);
    setTimeout(() => notesRef.current?.focus(), 0);
  }

  function handleCancelNotes() {
    setNotesValue(vehicle.notes ?? "");
    setEditingNotes(false);
  }

  async function handleDelete() {
    if (!confirm(`Remove ${vehicle.license_plate} from records?`)) return;
    setDeleting(true);
    await supabase.from("vehicles").delete().eq("id", vehicle.id);
    onUpdated();
  }

  const timerBg = isCompleted
    ? "bg-emerald-500/10 border-emerald-500/20"
    : isOnBreak
      ? "bg-amber-500/10 border-amber-500/20"
      : isRunning
        ? "bg-sky-500/10 border-sky-500/20"
        : "bg-muted/50 border-border";

  const timerColor = isCompleted
    ? "text-emerald-600 dark:text-emerald-400"
    : isOnBreak
      ? "text-amber-600 dark:text-amber-400"
      : isRunning
        ? "text-sky-600 dark:text-sky-400"
        : "text-muted-foreground";

  const timerLabel = isCompleted
    ? "Net Work Time"
    : isOnBreak
      ? "On Break"
      : isRunning
        ? "Active"
        : "Not Started";

  return (
    <div
      className={`relative bg-card text-card-foreground border border-border border-l-4 rounded-lg overflow-hidden transition-opacity duration-200 ${statusLeftBorder(vehicle.status, isNotStarted)} ${deleting ? "opacity-40 pointer-events-none" : ""}`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1">
              License Plate
            </p>
            <h3 className="text-3xl font-black text-foreground tracking-widest leading-none">
              {vehicle.license_plate}
            </h3>
          </div>
          <button
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 mt-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Remove vehicle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span
            className={`text-xs font-bold px-2 py-0.5 border rounded-sm uppercase tracking-wider ${TYPE_COLORS[vehicle.type]}`}
          >
            {vehicle.type}
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 border rounded-sm uppercase tracking-wider ${CONDITION_COLORS[vehicle.condition]}`}
          >
            {vehicle.condition}
          </span>
          {vehicle.service_type && (
            <span
              className={`text-xs font-bold px-2 py-0.5 border rounded-sm uppercase tracking-wider flex items-center gap-1 ${SERVICE_TYPE_COLORS[vehicle.service_type] || FALLBACK_BADGE_COLOR}`}
            >
              {vehicle.service_type}
            </span>
          )}
        </div>

        {/* Notes */}
        <div className="mb-4">
          {editingNotes ? (
            <div>
              <textarea
                ref={notesRef}
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveNotes();
                  }
                  if (e.key === "Escape") handleCancelNotes();
                }}
                rows={2}
                className="w-full bg-background border border-input text-foreground rounded-lg text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                placeholder="Add a note..."
              />
              <div className="flex gap-1.5 mt-1.5">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-widest px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Check className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={handleCancelNotes}
                  className="flex items-center gap-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground rounded-lg text-xs font-bold uppercase tracking-widest px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleEditNotes}
              className="group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              aria-label="Edit notes"
            >
              {vehicle.notes ? (
                <div className="flex items-start gap-2 bg-muted/40 border border-border/60 hover:border-border rounded-lg px-3 py-2 transition-colors">
                  <p className="text-muted-foreground text-sm flex-1 line-clamp-2">
                    {vehicle.notes}
                  </p>
                  <Pencil className="w-3 h-3 text-muted-foreground/60 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
                </div>
              ) : (
                <div className="flex items-center gap-2 border border-dashed border-border hover:border-ring rounded-lg px-3 py-2 transition-colors">
                  <Pencil className="w-3 h-3 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
                  <span className="text-muted-foreground/60 group-hover:text-muted-foreground text-xs uppercase tracking-widest font-semibold transition-colors">
                    Add note
                  </span>
                </div>
              )}
            </button>
          )}
        </div>

        {/* Footer info: Timer & Checkin */}
        <div className="flex items-center justify-between gap-4 text-xs mt-5">
          <div className="flex items-center gap-2">
            <Timer className={`w-3.5 h-3.5 ${timerColor}`} />
            <span className={`font-black tabular-nums ${timerColor}`}>
              {isNotStarted ? "--" : formatDuration(liveSeconds)}
            </span>
            {isRunning && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            )}
          </div>
          <p className="text-muted-foreground">
            {formatCheckinTime(vehicle.created_at)}
          </p>
        </div>

        {/* Actions */}
        {!isCompleted && (
          <div className="flex gap-2 mt-4">
            {isNotStarted && (
              <button
                onClick={handleStart}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-bold text-sm uppercase tracking-widest py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Play className="w-4 h-4 fill-primary-foreground" />
                Start
              </button>
            )}
            {isRunning && (
              <>
                <button
                  onClick={handleBreak}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 disabled:opacity-40 text-black font-bold text-sm uppercase tracking-widest py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Pause className="w-4 h-4" />
                  Break
                </button>
                <button
                  onClick={handleDone}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </button>
              </>
            )}
            {isOnBreak && (
              <>
                <button
                  onClick={handleResume}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-bold text-sm uppercase tracking-widest py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resume
                </button>
                <button
                  onClick={handleDone}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
