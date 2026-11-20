import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import { Alert, Check } from '../components/Icons';
import api, { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// One request per token, even when React StrictMode runs the effect twice in development.
// (The backend clears the token after the first success, so a second call would fail.)
const pending = new Map();
const verifyOnce = (token) => {
  if (!pending.has(token)) pending.set(token, api.post('/auth/verify-email', { token }));
  return pending.get(token);
};

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { user, loading: authLoading, updateUser } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState(token ? 'verifying' : 'error'); // verifying | success | error
  const [error, setError] = useState(token ? '' : 'This link is missing its token.');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyOnce(token)
      .then(() => {
        if (cancelled) return;
        setStatus('success');
        updateUser({ emailVerified: true });
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setError(errorMessage(err, 'This link is invalid or has expired.'));
      });
    return () => {
      cancelled = true;
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const resend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification');
      toast.show({ message: `New link sent to ${user.email}`, variant: 'success' });
    } catch (err) {
      toast.show({ message: errorMessage(err, 'Couldn’t send the email. Try again.'), variant: 'error' });
    } finally {
      setResending(false);
    }
  };

  const loggedIn = !authLoading && !!user;

  return (
    <div className="flex min-h-screen flex-col bg-ground px-6 py-6 sm:px-10">
      <Logo />
      <main className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-[420px] rounded-2xl border border-line bg-white p-8 text-center" role="status" aria-live="polite">
          {status === 'verifying' && (
            <>
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent-tint border-t-accent" aria-hidden="true" />
              <h1 className="mt-5 font-display text-2xl font-semibold">Verifying your email…</h1>
              <p className="mt-2 text-[15px] text-muted">This only takes a second.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF3] text-[#067647]">
                <Check size={26} />
              </span>
              <h1 className="mt-5 font-display text-2xl font-semibold">Email verified</h1>
              <p className="mt-2 text-[15px] text-muted">Thanks! Your account is all set.</p>
              <Link
                to={loggedIn ? '/app' : '/login'}
                className="mt-7 flex min-h-[52px] items-center justify-center rounded-xl bg-accent font-semibold text-white hover:bg-accent-hover"
              >
                {loggedIn ? 'Go to my plan' : 'Log in'}
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF3F2] text-danger">
                <Alert size={26} />
              </span>
              <h1 className="mt-5 font-display text-2xl font-semibold">Link didn’t work</h1>
              <p className="mt-2 text-[15px] text-muted">{error}</p>
              {loggedIn && !user.emailVerified ? (
                <button
                  type="button"
                  onClick={resend}
                  disabled={resending}
                  className="mt-7 min-h-[52px] w-full rounded-xl bg-accent font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
                >
                  {resending ? 'Sending…' : 'Send me a new link'}
                </button>
              ) : (
                <Link
                  to={loggedIn ? '/app' : '/login'}
                  className="mt-7 flex min-h-[52px] items-center justify-center rounded-xl bg-accent font-semibold text-white hover:bg-accent-hover"
                >
                  {loggedIn ? 'Go to my plan' : 'Log in to get a new link'}
                </Link>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
