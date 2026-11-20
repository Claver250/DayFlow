import { Link } from 'react-router-dom';

export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#4F46E5" />
      <path d="M9 11h14M9 16h10M9 21h6" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function Logo({ to = '/', size = 30 }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 text-ink no-underline">
      <LogoMark size={size} />
      <span className="font-display text-xl font-bold tracking-tight">DayFlow</span>
    </Link>
  );
}
