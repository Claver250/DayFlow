// Small stroke icons. All decorative (aria-hidden); the button around them carries the label.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ChevronLeft = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M15 18l-6-6 6-6" /></svg>
);
export const ChevronRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M9 18l6-6-6-6" /></svg>
);
export const ChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M6 9l6 6 6-6" /></svg>
);
export const Plus = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={2.4}><path d="M12 5v14M5 12h14" /></svg>
);
export const Clock = ({ size = 19 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const Pencil = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
);
export const Trash = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
);
export const More = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
);
export const Close = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const Grip = ({ size = 20 }) => (
  <svg width={(size * 14) / 20} height={size} viewBox="0 0 14 20" fill="currentColor" aria-hidden="true">
    <circle cx="4" cy="4" r="1.6" /><circle cx="10" cy="4" r="1.6" /><circle cx="4" cy="10" r="1.6" />
    <circle cx="10" cy="10" r="1.6" /><circle cx="4" cy="16" r="1.6" /><circle cx="10" cy="16" r="1.6" />
  </svg>
);
export const Inbox = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M4 13h4l2 3h4l2-3h4" /><path d="M5.5 5h13L21 13v6H3v-6z" /></svg>
);
export const Calendar = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 9h18M8 2v4M16 2v4M7 13h5M7 17h8" /></svg>
);
export const Eye = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const EyeOff = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M3 3l18 18" /><path d="M10.6 5.1A10.8 10.8 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4.2M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7a10 10 0 005.4-1.6" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></svg>
);
export const User = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>
);
export const Alert = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" /></svg>
);
export const Check = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={2.4}><path d="M5 12l5 5 9-10" /></svg>
);
