import { LogoMark } from './Logo';

export default function FullPageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ground" role="status">
      <div className="animate-pulse">
        <LogoMark size={44} />
      </div>
      <span className="text-sm text-muted">Loading your plan…</span>
    </div>
  );
}
