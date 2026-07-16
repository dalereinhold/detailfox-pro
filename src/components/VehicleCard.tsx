import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Trash2, Play, Pause, RotateCcw, Timer, Pencil, Check, X, Sparkles } from 'lucide-react';
import { supabase, Vehicle, VehicleStatus, formatDuration } from '../lib/supabase';
import { SERVICE_TYPE_COLORS } from '../lib/serviceTypes';

interface VehicleCardProps {
  vehicle: Vehicle;
  onUpdated: () => void;
}

const CONDITION_COLORS: Record<string, string> = {
  Excellent: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-slate-900 dark:border-emerald-800',
  Good: 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-slate-900 dark:border-sky-800',
  Fair: 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-slate-900 dark:border-orange-800',
  Poor: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-slate-900 dark:border-rose-800',
};

const TYPE_COLORS: Record<string, string> = {
  New: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-slate-900 dark:border-emerald-800',
  Used: 'text-slate-400 bg-zinc-100 border-zinc-300 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700',
  Demo: 'text-sky-600 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-slate-900 dark:border-sky-800',
};



function formatCheckinTime(isoString: string): string {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} at ${timeStr}`;
}

function computeLiveSeconds(vehicle: Vehicle): number {
  const base = vehicle.net_work_seconds;
  if (vehicle.status === 'In Progress' && vehicle.started_at) {
    const elapsed = Math.floor((Date.now() - new Date(vehicle.started_at).getTime()) / 1000);
    return base + Math.max(0, elapsed);
  }
  return base;
}

function statusLeftBorder(status: VehicleStatus, pending: boolean): string {
  if (pending) return 'border-l-zinc-300';
  if (status === 'In Progress') return 'border-l-sky-500';
  if (status === 'On Break') return 'border-l-amber-400';
  return 'border-l-emerald-500';
}

export default function VehicleCard({ vehicle, onUpdated }: VehicleCardProps) {
  const [liveSeconds, setLiveSeconds] = useState(() => computeLiveSeconds(vehicle));
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(vehicle.notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (vehicle.status === 'In Progress' && vehicle.started_at) {
      setLiveSeconds(computeLiveSeconds(vehicle));
      intervalRef.current = setInterval(() => setLiveSeconds(computeLiveSeconds(vehicle)), 1000);
    } else {
      setLiveSeconds(vehicle.net_work_seconds);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [vehicle.status, vehicle.started_at, vehicle.net_work_seconds]);

  const isNotStarted = vehicle.status === 'In Progress' && vehicle.net_work_seconds === 0 && !vehicle.started_at;
  const isRunning = vehicle.status === 'In Progress' && !!vehicle.started_at;
  const isOnBreak = vehicle.status === 'On Break';
  const isCompleted = vehicle.status === 'Completed';

  async function handleStart() {
    setBusy(true);
    const now = new Date().toISOString();
    await supabase.from('vehicles').update({ status: 'In Progress', started_at: now, updated_at: now }).eq('id', vehicle.id);
    setBusy(false);
    onUpdated();
  }

  async function handleBreak() {
    setBusy(true);
    const now = new Date();
    const additionalSeconds = vehicle.started_at
      ? Math.max(0, Math.floor((now.getTime() - new Date(vehicle.started_at).getTime()) / 1000))
      : 0;
    await supabase.from('vehicles').update({
      status: 'On Break', started_at: null, break_started_at: now.toISOString(),
      net_work_seconds: vehicle.net_work_seconds + additionalSeconds, updated_at: now.toISOString(),
    }).eq('id', vehicle.id);
    setBusy(false);
    onUpdated();
  }

  async function handleResume() {
    setBusy(true);
    const now = new Date().toISOString();
    await supabase.from('vehicles').update({ status: 'In Progress', started_at: now, break_started_at: null, updated_at: now }).eq('id', vehicle.id);
    setBusy(false);
    onUpdated();
  }

  async function handleDone() {
    setBusy(true);
    const now = new Date();
    const additionalSeconds = vehicle.started_at
      ? Math.max(0, Math.floor((now.getTime() - new Date(vehicle.started_at).getTime()) / 1000))
      : 0;
    await supabase.from('vehicles').update({
      status: 'Completed', started_at: null, break_started_at: null,
      net_work_seconds: vehicle.net_work_seconds + additionalSeconds, updated_at: now.toISOString(),
    }).eq('id', vehicle.id);
    setBusy(false);
    onUpdated();
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    const trimmed = notesValue.trim();
    await supabase
      .from('vehicles')
      .update({ notes: trimmed || null, updated_at: new Date().toISOString() })
      .eq('id', vehicle.id);
    setSavingNotes(false);
    setEditingNotes(false);
    onUpdated();
  }

  function handleEditNotes() {
    setNotesValue(vehicle.notes ?? '');
    setEditingNotes(true);
    setTimeout(() => notesRef.current?.focus(), 0);
  }

  function handleCancelNotes() {
    setNotesValue(vehicle.notes ?? '');
    setEditingNotes(false);
  }

  async function handleDelete() {
    if (!confirm(`Remove ${vehicle.license_plate} from records?`)) return;
    setDeleting(true);
    await supabase.from('vehicles').delete().eq('id', vehicle.id);
    onUpdated();
  }

  const timerBg = isCompleted
    ? 'bg-emerald-50 border-emerald-200 dark:bg-slate-800 dark:border-emerald-800'
    : isOnBreak
    ? 'bg-orange-50 border-orange-200 dark:bg-slate-800 dark:border-orange-800'
    : isRunning
    ? 'bg-sky-50 border-sky-200 dark:bg-slate-800 dark:border-sky-800'
    : 'bg-zinc-50 border-zinc-200 dark:bg-slate-800 dark:border-slate-700';

  const timerColor = isCompleted
    ? 'text-emerald-600 dark:text-emerald-300'
    : isOnBreak
    ? 'text-orange-500 dark:text-orange-300'
    : isRunning
    ? 'text-sky-600 dark:text-sky-300'
    : 'text-slate-400';

  const timerLabel = isCompleted ? 'Net Work Time' : isOnBreak ? 'Paused' : isRunning ? 'Active' : 'Not Started';

  return (
    <div
      className={`relative bg-white border border-zinc-200 border-l-4 overflow-hidden transition-opacity duration-200 dark:bg-slate-800 dark:border-slate-700 ${statusLeftBorder(vehicle.status, isNotStarted)} ${deleting ? 'opacity-40 pointer-events-none' : ''}`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">License Plate</p>
            <h3 className="text-3xl font-black text-zinc-900 dark:text-slate-100 tracking-widest leading-none">{vehicle.license_plate}</h3>
          </div>
          <button
            onClick={handleDelete}
            className="text-slate-400 hover:text-rose-500 transition-colors p-1 mt-0.5 dark:text-slate-400 dark:hover:text-rose-400"
            aria-label="Remove vehicle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider ${TYPE_COLORS[vehicle.type]}`}>
            {vehicle.type}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider ${CONDITION_COLORS[vehicle.condition]}`}>
            {vehicle.condition}
          </span>
          {vehicle.service_type && (
            <span className={`text-xs font-bold px-2 py-0.5 border uppercase tracking-wider flex items-center gap-1 ${SERVICE_TYPE_COLORS[vehicle.service_type] || 'text-slate-400 bg-zinc-100 border-zinc-300 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700'}`}>
              <Sparkles className="w-3 h-3" />
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
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveNotes(); } if (e.key === 'Escape') handleCancelNotes(); }}
                rows={2}
                className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 resize-none focus:outline-none placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500"
                placeholder="Add a note..."
              />
              <div className="flex gap-1 mt-1">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  <Check className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={handleCancelNotes}
                  className="flex items-center gap-1.5 border border-slate-300 hover:border-slate-900 text-slate-500 hover:text-slate-900 text-xs font-bold uppercase tracking-widest px-3 py-1.5 transition-colors dark:border-slate-600 dark:hover:border-slate-400 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleEditNotes}
              className="group w-full text-left"
              aria-label="Edit notes"
            >
              {vehicle.notes ? (
                <div className="flex items-start gap-2 bg-zinc-50 border border-zinc-100 hover:border-zinc-300 px-3 py-2 transition-colors dark:bg-slate-700 dark:border-slate-600 dark:hover:border-slate-500">
                  <p className="text-slate-500 text-sm flex-1 line-clamp-2 dark:text-slate-400">{vehicle.notes}</p>
                  <Pencil className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-0.5 transition-colors dark:text-slate-500 dark:group-hover:text-slate-300" />
                </div>
              ) : (
                <div className="flex items-center gap-2 border border-dashed border-zinc-200 hover:border-zinc-400 px-3 py-2 transition-colors dark:border-slate-700 dark:hover:border-slate-600">
                  <Pencil className="w-3 h-3 text-slate-300 group-hover:text-slate-400 transition-colors dark:text-slate-500 dark:group-hover:text-slate-400" />
                  <span className="text-slate-400 group-hover:text-slate-500 text-xs uppercase tracking-widest font-semibold transition-colors dark:text-slate-500 dark:group-hover:text-slate-400">Add note</span>
                </div>
              )}
            </button>
          )}
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-3 border px-4 py-3 mb-4 ${timerBg}`}>
          <Timer className={`w-4 h-4 flex-shrink-0 ${timerColor}`} />
          <div className="flex-1 min-w-0">
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest leading-none mb-0.5">{timerLabel}</p>
            <p className={`text-xl font-black tabular-nums leading-none ${timerColor}`}>
              {isNotStarted ? '--' : formatDuration(liveSeconds)}
            </p>
          </div>
          {isRunning && <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse flex-shrink-0" />}
        </div>

        {/* Checkin */}
        <p className="text-slate-400 text-xs mb-5 dark:text-slate-500">
          Added <span className="font-semibold text-slate-600 dark:text-slate-400">{formatCheckinTime(vehicle.created_at)}</span>
        </p>

        {/* Actions */}
        {!isCompleted && (
          <div className="flex gap-2">
            {isNotStarted && (
              <button
                onClick={handleStart}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                <Play className="w-4 h-4 fill-white" />
                Start
              </button>
            )}
            {isRunning && (
              <>
                <button
                  onClick={handleBreak}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-300 disabled:opacity-40 text-white dark:text-slate-900 font-bold text-sm uppercase tracking-widest py-3 transition-colors dark:bg-orange-400 dark:hover:bg-orange-300"
                >
                  <Pause className="w-4 h-4" />
                  Break
                </button>
                <button
                  onClick={handleDone}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors dark:bg-emerald-600 dark:hover:bg-emerald-500"
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
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resume
                </button>
                <button
                  onClick={handleDone}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm uppercase tracking-widest py-3 transition-colors dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </button>
              </>
            )}
          </div>
        )}

        {/* Completed */}
        {isCompleted && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-3 dark:bg-slate-800 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 dark:text-emerald-300" />
            <p className="text-emerald-700 font-bold text-sm uppercase tracking-wide dark:text-emerald-300">Job Complete</p>
          </div>
        )}
      </div>
    </div>
  );
}