import { useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './TaskCard';
import { formatHour, formatTimeNow, HOURS } from '../lib/dates';
import { slotId } from '../hooks/useTasks';

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function HourRow({ hour, ids, byId, isNowHour, now, highlight, rowRef, cardProps }) {
  const id = slotId(hour);
  const { setNodeRef } = useDroppable({ id });
  const nowOffset = `${(now.getMinutes() / 60) * 100}%`;

  return (
    <li
      ref={rowRef}
      className="grid grid-cols-[56px_minmax(0,1fr)] border-t border-[#EEF0F3] sm:grid-cols-[76px_minmax(0,1fr)]"
    >
      <div className="pr-2 pt-3 text-right sm:pr-3">
        <p className={`text-xs sm:text-[13px] ${isNowHour ? 'font-bold text-now' : 'text-muted'}`}>{formatHour(hour)}</p>
        {isNowHour && <p className="mt-0.5 hidden text-xs font-semibold text-now sm:block">Now · {formatTimeNow(now)}</p>}
      </div>

      <div
        ref={setNodeRef}
        className={`relative flex min-h-16 flex-col gap-1.5 rounded-lg py-2 transition-colors ${
          highlight ? 'bg-[#F7F7FF] outline-2 -outline-offset-2 outline-dashed outline-accent' : ''
        }`}
      >
        {isNowHour && (
          <div aria-hidden="true" className="pointer-events-none absolute -left-1.5 right-0 z-10 h-0.5 bg-now" style={{ top: nowOffset }}>
            <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-now" />
          </div>
        )}

        <SortableContext id={id} items={ids} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-1.5">
            {ids.map((taskId) =>
              byId[taskId] ? (
                <SortableTaskCard key={taskId} task={byId[taskId]} container={id} variant="slot" {...cardProps} />
              ) : null
            )}
          </ul>
        </SortableContext>

      </div>
    </li>
  );
}

export default function Timeline({ groups, byId, isToday, loading, activeId, cardProps }) {
  const now = useNow();
  const nowRowRef = useRef(null);
  const scrolled = useRef(false);

  const scheduledIds = HOURS.flatMap((h) => groups[slotId(h)] || []);
  const total = scheduledIds.length;
  const done = scheduledIds.filter((id) => byId[id]?.completed).length;

  // On phones, jump to the current hour once the first load finishes
  useEffect(() => {
    if (scrolled.current || loading || !isToday) return;
    scrolled.current = true;
    if (window.innerWidth < 1024) nowRowRef.current?.scrollIntoView({ block: 'center' });
  }, [loading, isToday]);

  return (
    <section aria-labelledby="timeline-title" className="rounded-2xl border border-line bg-white px-3 pb-3 pt-4 sm:px-6 sm:pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4">
        <div>
          <h2 id="timeline-title" className="font-display text-[22px] font-semibold">
            {isToday ? 'Today’s timeline' : 'Timeline'}
          </h2>
          <p className="mt-1 text-sm text-muted">6 AM – 11 PM</p>
        </div>
        {total > 0 && (
          <div className="flex min-w-[200px] items-center gap-3">
            <span className="whitespace-nowrap text-sm text-muted">
              {done} of {total} done
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ECEEF2]" role="img" aria-label={`${done} of ${total} tasks done`}>
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(done / total) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {!loading && total === 0 && (
        <p className="mx-1 mb-3 rounded-xl bg-accent-tint px-3.5 py-3 text-sm leading-relaxed text-accent-ink">
          <span className="hidden lg:inline">Nothing planned yet. Drag tasks from your Brain dump onto an hour.</span>
          <span className="lg:hidden">Nothing planned yet. Open your Brain dump and tap Schedule on a task.</span>
        </p>
      )}

      <ol>
        {HOURS.map((h) => {
          const ids = groups[slotId(h)] || [];
          const isNowHour = isToday && now.getHours() === h;
          return (
            <HourRow
              key={h}
              hour={h}
              ids={ids}
              byId={byId}
              now={now}
              isNowHour={isNowHour}
              highlight={!!activeId && ids.includes(activeId)}
              rowRef={isNowHour ? nowRowRef : undefined}
              cardProps={cardProps}
            />
          );
        })}
      </ol>
    </section>
  );
}
