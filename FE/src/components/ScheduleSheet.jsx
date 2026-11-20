import { useEffect, useRef, useState } from 'react';
import { Close } from './Icons';
import { addDays, formatDayShort, formatHour, HOURS, todayKey } from '../lib/dates';
import { describeSlot, slotId } from '../hooks/useTasks';

/**
 * Quick-assign: pick a day + hour for a task. Bottom sheet on phones, centred dialog on desktop.
 * `viewDate` is the day the timeline shows; `groups` gives the task count per hour for that day.
 */
export default function ScheduleSheet({ task, viewDate, groups, onClose, onPick, onUnschedule }) {
  const today = todayKey();
  const tomorrow = addDays(today, 1);
  const startDate = task.scheduledDate || viewDate;

  const [date, setDate] = useState(startDate);
  const [hour, setHour] = useState(task.scheduledDate ? task.slotHour : null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  const dayChoice = date === today ? 'today' : date === tomorrow ? 'tomorrow' : 'custom';
  const isScheduled = task.scheduledDate != null;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Escape closes; focus starts on the close button and stays inside the dialog
  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll('button:not([disabled]), input');
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus(); // give focus back
    };
  }, []);

  const countFor = (h) => {
    if (date !== viewDate) return null; // we only know counts for the day on screen
    return (groups[slotId(h)] || []).filter((id) => id !== task.id).length;
  };

  const nowHour = new Date().getHours();
  const unchanged = isScheduled && date === task.scheduledDate && hour === task.slotHour;

  const dayButton = (key, label, value) => (
    <button
      key={key}
      type="button"
      role="radio"
      aria-checked={dayChoice === key}
      onClick={() => value && setDate(value)}
      className={`min-h-11 rounded-xl text-sm ${
        dayChoice === key
          ? 'border-[1.5px] border-accent bg-accent-tint font-semibold text-accent-ink'
          : 'border border-line-strong bg-white font-medium text-ink hover:bg-ground'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center lg:items-center">
      <div className="absolute inset-0 bg-ink/45" onClick={onClose} aria-hidden="true" />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-2.5 shadow-2xl lg:max-w-md lg:rounded-3xl lg:pt-5"
      >
        <div aria-hidden="true" className="mx-auto mb-3.5 h-1.5 w-10 rounded-full bg-line-strong lg:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="sheet-title" className="font-display text-[22px] font-semibold">
              {isScheduled ? 'Change time' : 'Schedule task'}
            </h2>
            <p className="mt-1 truncate text-[15px] text-muted">{task.title}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2.5 -mt-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-ground"
          >
            <Close />
          </button>
        </div>

        <div role="radiogroup" aria-label="Day" className="mt-4 grid grid-cols-3 gap-2">
          {dayButton('today', 'Today', today)}
          {dayButton('tomorrow', 'Tomorrow', tomorrow)}
          <label
            className={`relative flex min-h-11 cursor-pointer items-center justify-center rounded-xl text-sm ${
              dayChoice === 'custom'
                ? 'border-[1.5px] border-accent bg-accent-tint font-semibold text-accent-ink'
                : 'border border-line-strong bg-white font-medium text-ink hover:bg-ground'
            }`}
          >
            {dayChoice === 'custom' ? formatDayShort(date) : 'Pick date'}
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              aria-label="Pick a date"
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>

        <p className="mb-2 mt-5 text-[13px] font-semibold uppercase tracking-wider text-muted">Pick an hour</p>
        <div role="radiogroup" aria-label="Hour" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {HOURS.map((h) => {
            const selected = hour === h;
            const isNow = date === today && h === nowHour;
            const count = countFor(h);
            const sub = selected ? 'Selected' : isNow ? 'Now' : count == null ? '' : count === 0 ? 'Free' : `${count} task${count > 1 ? 's' : ''}`;
            return (
              <button
                key={h}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setHour(h)}
                className={`flex min-h-12 flex-col items-center justify-center rounded-xl text-[15px] ${
                  selected
                    ? 'bg-accent font-semibold text-white'
                    : isNow
                      ? 'border-[1.5px] border-now bg-white font-medium text-ink'
                      : 'border border-line bg-white font-medium text-ink hover:border-accent-line hover:bg-accent-tint'
                }`}
              >
                {formatHour(h)}
                {sub && (
                  <span
                    className={`text-[11px] ${
                      selected ? 'font-medium text-[#E0E2FF]' : isNow ? 'font-semibold text-now' : 'font-normal text-muted'
                    }`}
                  >
                    {sub}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={hour == null || unchanged}
          onClick={() => onPick(task.id, date, hour)}
          className="mt-5 min-h-[52px] w-full rounded-2xl bg-accent text-base font-semibold text-white hover:bg-accent-hover disabled:bg-line disabled:text-muted"
        >
          {hour == null ? 'Pick an hour' : `Schedule for ${describeSlot(date, hour)}`}
        </button>

        {isScheduled && (
          <button
            type="button"
            onClick={() => onUnschedule(task.id)}
            className="mt-2 min-h-11 w-full rounded-xl text-[15px] font-semibold text-accent-ink hover:bg-accent-tint"
          >
            Move back to inbox
          </button>
        )}
      </section>
    </div>
  );
}
