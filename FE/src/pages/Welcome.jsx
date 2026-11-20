import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const steps = [
  {
    title: 'Brain dump',
    body: 'Type tasks the moment they come to mind and press Enter. No dates needed. They wait in your inbox.',
  },
  {
    title: 'Time-block your day',
    body: 'Drag each task onto an hour between 6 AM and 11 PM. On your phone, tap Schedule and pick a time.',
  },
  {
    title: 'Check it off',
    body: 'Tick tasks as you finish them and move the rest when plans change. Everything saves as you go.',
  },
];

function PreviewRow({ label, now, children }) {
  return (
    <div className={`grid grid-cols-[48px_1fr] py-1.5 ${now ? 'border-t-2 border-now' : 'border-t border-[#EEF0F3]'}`}>
      <span className={`pt-2 text-xs ${now ? 'font-bold text-now' : 'text-muted'}`}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

export default function Welcome() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-ground">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <Logo />
        <nav aria-label="Account" className="flex items-center gap-2">
          <Link to="/login" className="rounded-xl px-4 py-2.5 text-[15px] font-medium text-ink hover:bg-white">
            Log in
          </Link>
          <Link to="/signup" className="hidden rounded-xl bg-accent px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-accent-hover sm:inline-block">
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-6 sm:px-8 sm:pt-14">
        <section className="flex flex-wrap items-center gap-12 lg:gap-16">
          <div className="min-w-0 flex-[1_1_420px]">
            <p className="mb-5 inline-block rounded-full bg-accent-tint px-3 py-1.5 text-sm font-semibold text-accent-ink">
              Your day, hour by hour
            </p>
            <h1 className="font-display text-[40px] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Turn your to-do list into a daily plan.
            </h1>
            <p className="mt-6 max-w-[500px] text-[17px] leading-relaxed text-muted sm:text-[19px]">
              Dump every task in one place, then drag each one onto an hour of your day. Your inbox and timeline stay in
              sync on every device.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="flex min-h-[52px] items-center justify-center rounded-xl bg-accent px-6 font-semibold text-white hover:bg-accent-hover"
              >
                Create your account
              </Link>
              <button
                type="button"
                onClick={loginWithGoogle}
                className="flex min-h-[52px] items-center justify-center rounded-xl border border-line-strong bg-white px-6 font-semibold text-ink hover:bg-ground"
              >
                Continue with Google
              </button>
            </div>
            <p className="mt-5 text-sm text-muted">
              Already planning with DayFlow?{' '}
              <Link to="/login" className="font-semibold text-accent-ink hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <div className="min-w-0 flex-[1_1_440px]" aria-hidden="true">
            <div className="flex flex-wrap gap-4 rounded-[20px] border border-line bg-white p-5 shadow-[0_24px_48px_-24px_rgba(20,23,31,0.18)]">
              <div className="flex flex-[1_1_160px] flex-col gap-2">
                <p className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-muted">Brain dump</p>
                <div className="rounded-xl border border-line px-3 py-2.5 text-sm">Reply to Tunde</div>
                <div className="rounded-xl border border-dashed border-accent-line bg-[#FAFAFF] px-3 py-2.5 text-sm text-muted">
                  Review budget draft
                </div>
                <div className="rounded-xl border border-line px-3 py-2.5 text-sm">Book dentist</div>
              </div>
              <div className="flex flex-[1.4_1_220px] flex-col">
                <p className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted">Today</p>
                <PreviewRow label="9 AM">
                  <div className="rounded-xl border border-line bg-ground px-3 py-2 text-sm text-done line-through">Team standup</div>
                </PreviewRow>
                <PreviewRow label="10 AM">
                  <div className="rounded-xl border border-accent-line bg-accent-tint px-3 py-2 text-sm font-medium text-accent-deep">
                    Write project proposal
                  </div>
                </PreviewRow>
                <PreviewRow label="11 AM" now>
                  <div className="rounded-xl border-[1.5px] border-dashed border-accent bg-[#F7F7FF] px-3 py-2 text-sm text-accent-ink">
                    Drop here
                  </div>
                </PreviewRow>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24" aria-labelledby="how">
          <h2 id="how" className="mb-7 font-display text-3xl font-semibold tracking-tight">
            Three steps to a planned day
          </h2>
          <div className="grid gap-5 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-line bg-white p-7">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-tint font-bold text-accent-ink">
                  {i + 1}
                </span>
                <h3 className="mb-2 mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-8 py-6 text-center text-sm text-muted">
        © {new Date().getFullYear()} DayFlow
      </footer>
    </div>
  );
}
