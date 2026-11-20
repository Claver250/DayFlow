import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Alert, Check, ChevronLeft, Eye, EyeOff, User } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';

const inputClass =
  'min-h-[50px] w-full rounded-xl border border-line-strong bg-white px-3.5 text-base text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-[#E0E2FF] aria-[invalid=true]:border-[#D92D20]';

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(params.get('error') || '');
  const [busy, setBusy] = useState(false);

  // Green message passed from signup ("Account created…"); only shown on the login tab
  const notice = !isSignup ? location.state?.notice : '';

  // /signup and /login reuse this same component, so refresh the fields when we move between them
  useEffect(() => {
    setPassword('');
    setShowPassword(false);
    if (location.state?.email) setEmail(location.state.email);
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isSignup) {
        await signup(name.trim(), email.trim(), password);
        navigate('/login', {
          replace: true,
          state: { email: email.trim(), notice: 'Account created. Log in to continue.' },
        });
      } else {
        await login(email.trim(), password);
        navigate('/app', { replace: true });
      }
    } catch (err) {
      setError(errorMessage(err, isSignup ? 'Could not create your account' : 'Login failed'));
    } finally {
      setBusy(false);
    }
  };

  const switchTo = (to) => {
    setError('');
    navigate(to, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-wrap bg-ground">
      <div className="flex min-w-0 flex-[1_1_520px] flex-col px-6 pb-10 pt-3 sm:px-10 sm:pt-7">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            aria-label="Back to home"
            className="-ml-2.5 flex h-11 w-11 items-center justify-center rounded-xl text-ink hover:bg-white sm:hidden"
          >
            <ChevronLeft size={22} />
          </Link>
          <div className="hidden sm:block">
            <Logo />
          </div>
        </div>

        <div className="flex flex-1 items-start justify-center pt-4 sm:items-center sm:pt-10">
          <form onSubmit={onSubmit} className="flex w-full max-w-[400px] flex-col gap-4" aria-labelledby="auth-title" noValidate>
            <div>
              <h1 id="auth-title" className="font-display text-[30px] font-semibold tracking-tight sm:text-[34px]">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-1.5 text-[15px] text-muted sm:text-base">
                {isSignup ? 'Start turning your to-do list into a plan.' : 'Log in to pick up your plan where you left it.'}
              </p>
            </div>

            <div role="tablist" aria-label="Account" className="grid grid-cols-2 rounded-xl bg-[#ECEEF2] p-1">
              {[
                ['login', 'Log in', '/login'],
                ['signup', 'Sign up', '/signup'],
              ].map(([key, label, to]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={mode === key}
                  onClick={() => switchTo(to)}
                  className={`min-h-11 rounded-[9px] text-[15px] ${
                    mode === key ? 'bg-white font-semibold text-ink shadow-sm' : 'font-medium text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={loginWithGoogle}
              className="flex min-h-[50px] items-center justify-center gap-2.5 rounded-xl border border-line-strong bg-white text-[15px] font-semibold text-ink hover:bg-ground"
            >
              <User />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 text-[13px] text-muted">
              <span className="h-px flex-1 bg-line" />
              or with email
              <span className="h-px flex-1 bg-line" />
            </div>

            {notice && !error && (
              <div role="status" className="flex items-start gap-2.5 rounded-xl border border-[#ABEFC6] bg-[#ECFDF3] px-3.5 py-3 text-sm text-[#05603A]">
                <span className="mt-px shrink-0"><Check /></span>
                {notice}
              </div>
            )}

            {error && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-[#FECDCA] bg-[#FEF3F2] px-3.5 py-3 text-sm text-[#912018]">
                <span className="mt-px shrink-0 text-danger"><Alert /></span>
                {error}
              </div>
            )}

            {isSignup && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <input id="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error}
                  className={`${inputClass} pr-13`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0.5 top-0.5 flex h-[46px] w-11 items-center justify-center text-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-1 min-h-[52px] rounded-xl bg-accent text-base font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {busy ? (isSignup ? 'Creating account…' : 'Logging in…') : isSignup ? 'Create account' : 'Log in'}
            </button>

            <p className="text-center text-sm text-muted">
              {isSignup ? 'Already have an account? ' : 'New to DayFlow? '}
              <button type="button" onClick={() => switchTo(isSignup ? '/login' : '/signup')} className="font-semibold text-accent-ink hover:underline">
                {isSignup ? 'Log in' : 'Create an account'}
              </button>
            </p>
          </form>
        </div>
      </div>

      <aside className="hidden min-w-0 flex-[1_1_480px] flex-col justify-center gap-8 bg-accent px-12 py-14 text-white lg:flex" aria-hidden="true">
        <div className="max-w-[460px]">
          <h2 className="font-display text-[34px] font-semibold leading-tight tracking-tight">
            Your inbox and timeline, right where you left them.
          </h2>
          <p className="mt-3.5 leading-relaxed text-[#E0E2FF]">Log in on your laptop, phone or tablet and see the same plan.</p>
        </div>
        <div className="max-w-[460px] rounded-[18px] bg-white p-[18px] text-ink">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[15px] font-semibold">Today</span>
            <span className="text-[13px] text-muted">3 of 6 done</span>
          </div>
          {[
            ['9 AM', 'Team standup', true],
            ['10 AM', 'Write project proposal', false],
            ['1 PM', 'Lunch with Ada', false],
          ].map(([h, t, done]) => (
            <div key={h} className="grid grid-cols-[52px_1fr] border-t border-[#EEF0F3] py-2">
              <span className="pt-2 text-xs text-muted">{h}</span>
              <div
                className={`rounded-xl border px-3 py-2 text-sm ${
                  done ? 'border-line bg-ground text-done line-through' : 'border-accent-line bg-accent-tint font-medium text-accent-deep'
                }`}
              >
                {t}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
