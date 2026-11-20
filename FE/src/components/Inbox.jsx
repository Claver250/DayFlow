import { forwardRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './TaskCard';
import { Plus } from './Icons';
import { INBOX } from '../hooks/useTasks';

const Inbox = forwardRef(function Inbox({ ids, byId, loading, isDropTarget, onAdd, cardProps }, inputRef) {
  const [title, setTitle] = useState('');
  const { setNodeRef } = useDroppable({ id: INBOX });

  const submit = (e) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    onAdd(value);
    setTitle('');
    inputRef?.current?.focus();
  };

  return (
    <section
      ref={setNodeRef}
      aria-labelledby="inbox-title"
      className={`rounded-2xl border bg-white p-4 transition-colors sm:p-5 ${
        isDropTarget ? 'border-accent bg-[#FAFAFF]' : 'border-line'
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 id="inbox-title" className="font-display text-[22px] font-semibold">Brain dump</h2>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent-tint px-2 text-sm font-semibold text-accent-ink">
          {ids.length}
        </span>
      </div>
      <p className="mb-4 mt-1 text-sm text-muted">Tasks waiting for a time slot</p>

      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="new-task" className="sr-only">Add a task</label>
        <input
          id="new-task"
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task and press Enter"
          maxLength={255}
          autoComplete="off"
          enterKeyHint="done"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-line-strong bg-[#FAFBFC] px-3.5 text-base outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-[#E0E2FF] sm:text-[15px]"
        />
        <button
          type="submit"
          aria-label="Add task"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-hover"
        >
          <Plus />
        </button>
      </form>

      {loading && ids.length === 0 ? (
        <div className="mt-4 flex flex-col gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[54px] animate-pulse rounded-xl bg-[#F1F2F5]" />
          ))}
        </div>
      ) : ids.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border-[1.5px] border-dashed border-line px-6 py-8 text-center">
          <svg width="48" height="48" viewBox="0 0 56 56" fill="none" aria-hidden="true">
            <rect x="6" y="10" width="44" height="36" rx="10" fill="#EEF0FF" />
            <path d="M18 24h20M18 31h12" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <h3 className="mb-1 mt-3 font-semibold">Your mind is clear</h3>
          <p className="max-w-[260px] text-sm leading-relaxed text-muted">
            Type anything you need to do and press Enter. You can give it a time later.
          </p>
        </div>
      ) : (
        <SortableContext id={INBOX} items={ids} strategy={verticalListSortingStrategy}>
          <ul className="mt-4 flex flex-col gap-2">
            {ids.map((id) =>
              byId[id] ? <SortableTaskCard key={id} task={byId[id]} container={INBOX} variant="inbox" {...cardProps} /> : null
            )}
          </ul>
        </SortableContext>
      )}

      <p className="mt-4 rounded-xl bg-ground px-3.5 py-3 text-[13px] leading-relaxed text-muted">
        <span className="hidden lg:inline">
          Drag a task onto the timeline, or press the clock to pick an hour. Drop a timeline task back here to unschedule it.
        </span>
        <span className="lg:hidden">Tap Schedule to give a task an hour. Tap a title to edit it.</span>
      </p>
    </section>
  );
});

export default Inbox;
