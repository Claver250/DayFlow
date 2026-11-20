import { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Grip, More } from './Icons';

/**
 * One task. `variant` is 'inbox' (white card) or 'slot' (indigo card on the timeline).
 * Presentational: SortableTaskCard below adds drag-and-drop.
 */
export function TaskCard({
  task,
  variant = 'inbox',
  onToggle,
  onRename,
  onDelete,
  onSchedule,
  onUnschedule,
  dragHandleProps,
  setHandleRef,
  isOverlay = false,
  isPlaceholder = false,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const saving = !!task._temp;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  // Close the menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => !menuRef.current?.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const startEdit = () => {
    if (saving) return;
    setDraft(task.title);
    setEditing(true);
    setMenuOpen(false);
  };

  const finishEdit = (save) => {
    const title = draft.trim();
    if (save && title) onRename?.(task.id, title);
    setEditing(false);
  };

  if (isPlaceholder) {
    return (
      <div className="flex min-h-[52px] items-center rounded-xl border-[1.5px] border-dashed border-accent-line bg-[#FAFAFF] px-4 text-sm text-muted">
        {task.title}
      </div>
    );
  }

  const done = task.completed;
  const tone =
    variant === 'slot'
      ? done
        ? 'border-line bg-ground'
        : 'border-accent-line bg-accent-tint'
      : 'border-line bg-white hover:border-accent-line';

  return (
    <div
      className={[
        'group relative flex items-center gap-1 rounded-xl border pl-1 pr-1',
        variant === 'slot' ? 'min-h-[48px]' : 'min-h-[54px]',
        tone,
        isOverlay && 'rotate-[-1.5deg] cursor-grabbing border-accent-line bg-white shadow-[0_18px_32px_-12px_rgba(20,23,31,0.35)]',
        saving && 'opacity-70',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        ref={setHandleRef}
        aria-label={`Move “${task.title}”`}
        disabled={saving}
        className="flex h-11 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-[#9AA0AC] hover:text-accent active:cursor-grabbing disabled:cursor-default"
        {...dragHandleProps}
      >
        <Grip />
      </button>

      <input
        type="checkbox"
        checked={!!done}
        disabled={saving}
        onChange={() => onToggle?.(task.id)}
        aria-label={done ? `Mark “${task.title}” as not done` : `Mark “${task.title}” as done`}
        className="h-5 w-5 shrink-0 cursor-pointer"
      />

      <div className="min-w-0 flex-1 pl-2">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => finishEdit(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') finishEdit(true);
              if (e.key === 'Escape') finishEdit(false);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Task title"
            maxLength={255}
            className="min-h-10 w-full rounded-lg border-2 border-accent bg-white px-2.5 text-[15px] text-ink outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            title="Click to edit"
            className={[
              'block w-full truncate rounded-md py-2.5 text-left text-[15px]',
              done ? 'text-done line-through' : variant === 'slot' ? 'font-medium text-accent-deep' : 'text-ink',
            ].join(' ')}
          >
            {task.title}
          </button>
        )}
      </div>

      {!editing && !isOverlay && (
        <>
          {variant === 'inbox' && (
            <button
              type="button"
              onClick={() => onSchedule?.(task)}
              disabled={saving}
              aria-label={`Schedule “${task.title}”`}
              className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-tint max-lg:bg-accent-tint lg:text-muted lg:hover:text-accent-ink"
            >
              <Clock size={17} />
              <span className="lg:hidden">Schedule</span>
            </button>
          )}

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              disabled={saving}
              aria-label={`More actions for “${task.title}”`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={`flex h-11 w-10 items-center justify-center rounded-lg hover:bg-black/5 ${
                variant === 'slot' && !done ? 'text-accent-ink' : 'text-done'
              }`}
            >
              <More />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-line bg-white p-1.5 shadow-[0_16px_32px_-12px_rgba(20,23,31,0.25)]"
              >
                <MenuItem onClick={startEdit}>Edit title</MenuItem>
                <MenuItem
                  onClick={() => {
                    setMenuOpen(false);
                    onSchedule?.(task);
                  }}
                >
                  {variant === 'slot' ? 'Change time…' : 'Schedule…'}
                </MenuItem>
                {variant === 'slot' && (
                  <MenuItem
                    onClick={() => {
                      setMenuOpen(false);
                      onUnschedule?.(task.id);
                    }}
                  >
                    Move back to inbox
                  </MenuItem>
                )}
                <MenuItem
                  danger
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(task.id);
                  }}
                >
                  Delete
                </MenuItem>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ children, onClick, danger }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium hover:bg-ground ${
        danger ? 'text-danger' : 'text-ink'
      }`}
    >
      {children}
    </button>
  );
}

/** TaskCard + drag-and-drop. `container` is 'inbox' or 'slot-<hour>'. */
export function SortableTaskCard({ task, container, ...props }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { container },
    disabled: !!task._temp,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? 'relative z-0' : 'relative'}
    >
      <TaskCard
        task={task}
        isPlaceholder={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        setHandleRef={setActivatorNodeRef}
        {...props}
      />
    </li>
  );
}
