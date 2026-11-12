import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import {
  loadMuted,
  playBeep,
  saveMuted,
  subscribeAudioState,
  isAudioUnlocked,
  unlockAudio,
} from "@/lib/alarmSound";
import {
  ONE_MINUTE_MS,
  addTimePatch,
  chronometerDisplay,
  countdownTotalMilliseconds,
  durationFromParts,
  elapsedMilliseconds,
  isAlarmActive,
  isCountdown,
  splitDuration,
} from "@/lib/chronometer";
import { AlarmClock, ArrowLeft, Loader2, Pause, Play, Plus, RotateCcw, Timer, Trash2, Volume2, VolumeX, X } from "lucide-react";

const inputClass =
  "w-full h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal";

export default function Evento() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [showForm, setShowForm] = useState(false);

  return (
    <AdminShell
      active="evento"
      onTab={(tab) => navigate("/admin", { state: { tab } })}
      action={
        eventId ? null : (
          <button
            onClick={() => setShowForm(true)}
            className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-orange text-white font-bold shadow-lg shadow-orange/30 hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" /> Novo evento
          </button>
        )
      }
    >
      {eventId ? <EventDetail eventId={eventId} /> : <EventList showForm={showForm} setShowForm={setShowForm} />}
    </AdminShell>
  );
}

function EventList({ showForm, setShowForm }) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*, event_children(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (event) => {
    if (!confirm(`Excluir o evento "${event.name}"? As crianças e os cronômetros deste evento também serão removidos.`)) return;
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    if (error) {
      alert("Erro ao excluir evento.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["events"] });
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-3xl">Evento</h1>
        <p className="text-white/50 mt-1">
          Cadastre um evento, adicione as crianças e acompanhe o cronômetro de cada uma.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange" />
        </div>
      ) : isError ? (
        <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-8 text-center">
          <p className="font-heading text-xl text-red-300">Não foi possível carregar os eventos</p>
          <p className="text-white/60 mt-2 text-sm">Confira se a migração do banco foi aplicada e tente novamente.</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-white/10 p-16 text-center">
          <p className="font-heading text-2xl text-white/40 mb-2">Nenhum evento cadastrado</p>
          <p className="text-white/50 mb-6">Crie o primeiro evento para começar a cronometrar as crianças.</p>
          <button onClick={() => setShowForm(true)} className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-orange text-white font-bold">
            <Plus className="w-5 h-5" /> Criar evento
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const count = event.event_children?.[0]?.count ?? 0;
            return (
              <div key={event.id} className="rounded-[2rem] bg-white/5 border border-white/10 p-6 flex flex-col gap-4">
                <div>
                  <h2 className="font-heading text-xl leading-tight">{event.name}</h2>
                  <p className="text-sm text-white/50 mt-1">
                    {event.event_date ? formatEventDate(event.event_date) : "Sem data"}
                    {" · "}
                    {childCountLabel(count)}
                  </p>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link
                    to={`/admin/evento/${event.id}`}
                    className="flex-1 h-10 inline-flex items-center justify-center rounded-full bg-orange text-white text-sm font-bold hover:scale-[1.02] transition-transform"
                  >
                    Abrir
                  </Link>
                  <button
                    onClick={() => handleDelete(event)}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                    title="Excluir evento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <EventFormModal
          onClose={() => setShowForm(false)}
          onCreated={(event) => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["events"] });
            navigate(`/admin/evento/${event.id}`);
          }}
        />
      )}
    </>
  );
}

function EventFormModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Informe o nome do evento.");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .insert({ name: trimmed, event_date: eventDate || null })
        .select()
        .single();
      if (error) throw error;
      onCreated(data);
    } catch (err) {
      alert("Erro ao criar evento. Tente novamente.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] bg-cobalt-soft border border-white/10 shadow-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="font-heading text-xl">Novo evento</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 flex flex-col gap-5">
          <label className="block">
            <span className="block text-sm font-bold text-white/80 mb-2">
              Nome do evento <span className="text-orange">*</span>
            </span>
            <input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Festa da Ana"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-bold text-white/80 mb-2">Data (opcional)</span>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </label>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="h-12 flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-orange text-white font-bold shadow-lg shadow-orange/30 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Criar evento
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-6 rounded-full bg-white/10 text-white font-bold hover:bg-white/15 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EventDetail({ eventId }) {
  const qc = useQueryClient();
  const [childName, setChildName] = useState("");
  const [adding, setAdding] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const eventQuery = useQuery({
    queryKey: ["events", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const childrenQuery = useQuery({
    queryKey: ["event-children", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_children")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const children = childrenQuery.data ?? [];
  const anyRunning = children.some((child) => child.started_at);
  const requestSeq = useRef({});
  const [muted, setMuted] = useState(loadMuted);
  const [audioUnlocked, setAudioUnlocked] = useState(isAudioUnlocked);
  const anyCountdownRunning = children.some((child) => child.started_at && isCountdown(child));

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    const unsubscribe = subscribeAudioState(setAudioUnlocked);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      unsubscribe();
    };
  }, []);

  const toggleMuted = () => {
    const next = !muted;
    unlockAudio();
    setMuted(next);
    saveMuted(next);
    if (!next) playBeep();
  };

  useEffect(() => {
    if (!anyRunning) return undefined;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [anyRunning]);

  const addChild = async (e) => {
    e.preventDefault();
    const trimmed = childName.trim();
    if (!trimmed) {
      alert("Informe o nome da criança.");
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("event_children").insert({
      event_id: eventId,
      name: trimmed,
    });
    setAdding(false);
    if (error) {
      alert("Erro ao adicionar criança.");
      return;
    }
    setChildName("");
    qc.invalidateQueries({ queryKey: ["event-children", eventId] });
    qc.invalidateQueries({ queryKey: ["events"] });
  };

  const removeChild = async (child) => {
    if (!confirm(`Remover "${child.name}" deste evento?`)) return;
    const { error } = await supabase.from("event_children").delete().eq("id", child.id);
    if (error) {
      alert("Erro ao remover criança.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["event-children", eventId] });
    qc.invalidateQueries({ queryKey: ["events"] });
  };

  const patchChild = async (child, patch) => {
    const key = ["event-children", eventId];
    const seq = (requestSeq.current[child.id] || 0) + 1;
    requestSeq.current[child.id] = seq;
    const previous = qc.getQueryData(key);
    qc.setQueryData(key, (rows = []) => rows.map((row) => (row.id === child.id ? { ...row, ...patch } : row)));
    const { data, error } = await supabase
      .from("event_children")
      .update(patch)
      .eq("id", child.id)
      .select()
      .single();
    if (requestSeq.current[child.id] !== seq) return;
    if (error) {
      qc.setQueryData(key, previous);
      alert("Erro ao atualizar o cronômetro.");
      return;
    }
    qc.setQueryData(key, (rows = []) => rows.map((row) => (row.id === child.id ? data : row)));
  };

  const start = (child) => {
    if (child.started_at) return;
    const startedAt = new Date().toISOString();
    setNow(Date.now());
    patchChild(child, { started_at: startedAt });
  };

  const pause = (child) => {
    if (!child.started_at) return;
    const pausedAt = Date.now();
    setNow(pausedAt);
    patchChild(child, {
      elapsed_ms: Math.round(elapsedMilliseconds(child, pausedAt)),
      started_at: null,
    });
  };

  const reset = (child) => {
    patchChild(child, { elapsed_ms: 0, started_at: null, added_ms: 0 });
  };

  const changeMode = (child, mode) => {
    if ((child.mode ?? "up") === mode) return;
    const hasProgress = Boolean(child.started_at) || elapsedMilliseconds(child) > 0 || Number(child.added_ms) > 0;
    if (hasProgress && !confirm(`Trocar o modo de "${child.name}"? O cronômetro desta criança será zerado.`)) return;
    patchChild(child, { mode, elapsed_ms: 0, started_at: null, added_ms: 0 });
  };

  const setDuration = (child, durationMs) => {
    patchChild(child, { duration_ms: durationMs, elapsed_ms: 0, started_at: null, added_ms: 0 });
  };

  const addTime = (child, ms) => {
    if (!(ms > 0)) return;
    setNow(Date.now());
    patchChild(child, addTimePatch(child, ms));
  };

  if (eventQuery.isLoading || childrenQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  if (eventQuery.isError || childrenQuery.isError || !eventQuery.data) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center">
        <p className="font-heading text-2xl text-white/70 mb-4">Evento não encontrado</p>
        <Link to="/admin/evento" className="inline-flex h-12 px-6 items-center rounded-full bg-orange text-white font-bold">
          Voltar para eventos
        </Link>
      </div>
    );
  }

  const event = eventQuery.data;

  return (
    <>
      <Link to="/admin/evento" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Eventos
      </Link>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">{event.name}</h1>
          <p className="text-white/50 mt-1">
            {event.event_date ? formatEventDate(event.event_date) : "Sem data"}
            {" · "}
            Cada criança tem o próprio cronômetro, progressivo ou regressivo.
          </p>
          <p className="text-white/40 text-sm mt-1">No regressivo, o alarme pulsa e apita no último minuto.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={toggleMuted}
            aria-pressed={muted}
            className={`h-11 px-5 inline-flex items-center gap-2 rounded-full text-sm font-bold transition-colors ${
              muted ? "bg-white/10 text-white/70 hover:bg-white/15" : "bg-teal/20 text-teal hover:bg-teal/30"
            }`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {muted ? "Som desligado" : "Som ligado"}
          </button>
          {!muted && !audioUnlocked && anyCountdownRunning && (
            <p className="text-xs text-orange" role="status">Clique em qualquer lugar da página para ativar o som do alarme.</p>
          )}
        </div>
      </div>

      <form onSubmit={addChild} className="rounded-[2rem] bg-white/5 border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row gap-3 mb-8">
        <label className="flex-1">
          <span className="sr-only">Nome da criança</span>
          <input
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Nome da criança"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          disabled={adding}
          className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-full bg-orange text-white font-bold disabled:opacity-50"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
          Adicionar criança
        </button>
      </form>

      {children.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-white/10 p-16 text-center">
          <p className="font-heading text-2xl text-white/40 mb-2">Nenhuma criança neste evento</p>
          <p className="text-white/50">Adicione um nome para liberar o cronômetro dessa criança.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {children.map((child) => (
            <ChildChronometer
              key={child.id}
              child={child}
              now={now}
              muted={muted}
              onStart={() => start(child)}
              onPause={() => pause(child)}
              onReset={() => reset(child)}
              onChangeMode={(mode) => changeMode(child, mode)}
              onSetDuration={(ms) => setDuration(child, ms)}
              onAddTime={(ms) => addTime(child, ms)}
              onRemove={() => removeChild(child)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ChildChronometer({ child, now, muted, onStart, onPause, onReset, onChangeMode, onSetDuration, onAddTime, onRemove }) {
  const running = Boolean(child.started_at);
  const countdown = isCountdown(child);
  const { label, finished, overtime } = chronometerDisplay(child, now);
  const noDuration = countdown && countdownTotalMilliseconds(child) <= 0;
  const alarming = isAlarmActive(child, now);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    if (!alarming) return undefined;
    const beep = () => {
      if (!mutedRef.current) playBeep();
    };
    beep();
    const id = setInterval(beep, 1000);
    return () => clearInterval(id);
  }, [alarming]);

  const statusText = finished
    ? "Tempo esgotado!"
    : alarming
      ? "Último minuto!"
      : running
      ? "Em andamento"
      : countdown && noDuration
        ? "Defina a duração"
        : "Pausado";
  const statusColor = finished ? "text-red-300" : alarming ? "text-orange" : running ? "text-teal" : "text-white/40";
  const displayColor = finished ? "text-red-400" : running ? "text-orange" : "text-white";

  return (
    <article
      className={`rounded-[2rem] border p-6 flex flex-col gap-5 transition-colors ${
        finished
          ? "bg-red-500/15 border-red-500/60 ring-2 ring-red-500/50"
          : alarming
            ? "bg-orange/10 border-orange/70 ring-2 ring-orange/50 animate-pulse"
            : "bg-white/5 border-white/10"
      }`}
      data-state={finished ? "finished" : alarming ? "alarm" : running ? "running" : "paused"}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl leading-tight">{child.name}</h2>
          <p className={`text-sm font-bold mt-1 ${statusColor}`} role={finished ? "alert" : undefined}>
            {statusText}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors shrink-0"
          title={`Remover ${child.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-white/5" role="group" aria-label={`Modo do cronômetro de ${child.name}`}>
        <ModeButton active={!countdown} disabled={running} onClick={() => onChangeMode("up")}>
          <Timer className="w-4 h-4" /> Progressivo
        </ModeButton>
        <ModeButton active={countdown} disabled={running} onClick={() => onChangeMode("down")}>
          <AlarmClock className="w-4 h-4" /> Regressivo
        </ModeButton>
      </div>

      {countdown && <DurationEditor child={child} disabled={running} onSet={onSetDuration} />}

      <p
        className={`font-mono text-5xl sm:text-6xl tracking-tight tabular-nums text-center ${displayColor}`}
        aria-label={`Cronômetro de ${child.name}: ${label}`}
      >
        {label}
      </p>
      {countdown && !noDuration && (
        <p className="text-center text-xs text-white/40 -mt-3">
          {overtime ? "Tempo além do limite" : "Tempo restante"} · total {formatMinutesSeconds(countdownTotalMilliseconds(child))}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <TimerButton onClick={onStart} disabled={running || noDuration} label="Iniciar">
          <Play className="w-4 h-4" /> Iniciar
        </TimerButton>
        <TimerButton onClick={onPause} disabled={!running} label="Pausar">
          <Pause className="w-4 h-4" /> Pausar
        </TimerButton>
        <TimerButton onClick={onReset} label="Zerar">
          <RotateCcw className="w-4 h-4" /> Zerar
        </TimerButton>
      </div>

      <AddTime child={child} countdown={countdown} onAdd={onAddTime} />
    </article>
  );
}

function ModeButton({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !active}
      aria-pressed={active}
      className={`h-9 inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-bold transition-colors ${
        active ? "bg-orange text-white" : "text-white/60 hover:text-white disabled:opacity-30 disabled:hover:text-white/60"
      }`}
    >
      {children}
    </button>
  );
}

function MinutesSecondsFields({ minutes, seconds, onMinutes, onSeconds, disabled, label }) {
  const fieldClass =
    "w-full h-11 px-3 rounded-2xl bg-white/5 border border-white/10 text-white text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-40";
  return (
    <>
      <label className="flex-1 min-w-0">
        <span className="sr-only">{label} (minutos)</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={minutes}
          disabled={disabled}
          onChange={(e) => onMinutes(e.target.value)}
          placeholder="min"
          className={fieldClass}
        />
      </label>
      <span className="text-white/40 font-bold">:</span>
      <label className="flex-1 min-w-0">
        <span className="sr-only">{label} (segundos)</span>
        <input
          type="number"
          min="0"
          max="59"
          inputMode="numeric"
          value={seconds}
          disabled={disabled}
          onChange={(e) => onSeconds(e.target.value)}
          placeholder="seg"
          className={fieldClass}
        />
      </label>
    </>
  );
}

function DurationEditor({ child, disabled, onSet }) {
  const initial = splitDuration(child.duration_ms);
  const [minutes, setMinutes] = useState(String(initial.minutes));
  const [seconds, setSeconds] = useState(String(initial.seconds));

  useEffect(() => {
    const parts = splitDuration(child.duration_ms);
    setMinutes(String(parts.minutes));
    setSeconds(String(parts.seconds));
  }, [child.duration_ms]);

  const submit = (e) => {
    e.preventDefault();
    const ms = durationFromParts(minutes, seconds);
    if (ms <= 0) {
      alert("Informe uma duração maior que zero.");
      return;
    }
    onSet(ms);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <span className="text-xs font-bold text-white/60">Duração inicial (min : seg)</span>
      <div className="flex items-center gap-2">
        <MinutesSecondsFields
          minutes={minutes}
          seconds={seconds}
          onMinutes={setMinutes}
          onSeconds={setSeconds}
          disabled={disabled}
          label={`Duração de ${child.name}`}
        />
        <button
          type="submit"
          disabled={disabled}
          className="h-11 px-4 rounded-full bg-teal/20 text-teal text-sm font-bold hover:bg-teal/30 transition-colors disabled:opacity-30"
        >
          Definir
        </button>
      </div>
    </form>
  );
}

function AddTime({ child, countdown, onAdd }) {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const addCustom = (e) => {
    e.preventDefault();
    const ms = durationFromParts(minutes, seconds);
    if (ms <= 0) {
      alert("Informe o tempo a adicionar.");
      return;
    }
    onAdd(ms);
    setMinutes("");
    setSeconds("");
  };

  return (
    <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
      <span className="text-xs font-bold text-white/60">
        {countdown ? "Adicionar tempo restante" : "Adicionar tempo ao cronômetro"}
      </span>
      <div className="grid grid-cols-2 gap-2">
        <TimerButton onClick={() => onAdd(ONE_MINUTE_MS)} label={`Adicionar 1 minuto para ${child.name}`}>
          +1 min
        </TimerButton>
        <TimerButton onClick={() => onAdd(5 * ONE_MINUTE_MS)} label={`Adicionar 5 minutos para ${child.name}`}>
          +5 min
        </TimerButton>
      </div>
      <form onSubmit={addCustom} className="flex items-center gap-2">
        <MinutesSecondsFields
          minutes={minutes}
          seconds={seconds}
          onMinutes={setMinutes}
          onSeconds={setSeconds}
          label={`Tempo personalizado para ${child.name}`}
        />
        <button
          type="submit"
          className="h-11 px-4 inline-flex items-center gap-1 rounded-full bg-orange/20 text-orange text-sm font-bold hover:bg-orange/30 transition-colors"
        >
          <Plus className="w-4 h-4" /> Outro
        </button>
      </form>
    </div>
  );
}

function TimerButton({ onClick, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="h-11 inline-flex items-center justify-center gap-1.5 rounded-full bg-white/10 text-sm font-bold hover:bg-white/15 transition-colors disabled:opacity-30 disabled:hover:bg-white/10"
    >
      {children}
    </button>
  );
}

function formatMinutesSeconds(ms) {
  const { minutes, seconds } = splitDuration(ms);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatEventDate(isoDate) {
  const [year, month, day] = String(isoDate).split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

function childCountLabel(count) {
  const n = Number(count) || 0;
  if (n === 0) return "Nenhuma criança";
  if (n === 1) return "1 criança";
  return `${n} crianças`;
}
