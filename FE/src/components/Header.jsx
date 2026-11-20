import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { ChevronDown, ChevronLeft, ChevronRight } from './Icons';
import { formatDayLong, formatDayShort, relativeDayName } from '../lib/dates';

const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';

function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user?.name || 'you'}`}
        className="flex min-h-11 items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 text-[15px] font-medium hover:bg-ground"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
          {initials(user?.name)}
        </span>
        <span className="hidden max-w-[140px] truncate sm:inline">{user?.name}</span>
        <span className="hidden text-muted sm:inline"><ChevronDown /></span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-1.5 w-64 rounded-xl border border-line bg-white p-1.5 shadow-[0_16px_32px_-12px_rgba(20,23,31,0.25)]">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-[13px] text-muted">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-danger hover:bg-ground"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({ date, isToday, onPrev, onNext, onToday, user, onLogout }) {
  const relative = relativeDayName(date);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2 sm:px-8 sm:py-3">
        <Logo to="/app" size={28} />

        <nav aria-label="Change day" className="order-last flex w-full items-center justify-between gap-1.5 sm:order-none sm:w-auto sm:justify-center">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous day"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white hover:bg-ground"
          >
            <ChevronLeft />
          </button>
          <div className="min-w-[160px] text-center sm:min-w-[210px]" aria-live="polite">
            <p className="font-semibold sm:hidden">{relative || formatDayShort(date)}</p>
            <p className="hidden font-semibold sm:block">{formatDayLong(date)}</p>
            <p className="mt-0.5 text-[13px] text-muted">
              <span className="sm:hidden">{relative ? formatDayShort(date) : ' '}</span>
              <span className="hidden sm:inline">{relative || ' '}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next day"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white hover:bg-ground"
          >
            <ChevronRight />
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={onToday}
              className="ml-1 min-h-11 rounded-xl border border-accent-line bg-accent-tint px-3.5 text-sm font-semibold text-accent-ink hover:bg-[#E3E6FF]"
            >
              Today
            </button>
          )}
        </nav>

        <AccountMenu user={user} onLogout={onLogout} />
      </div>
    </header>
  );
}
