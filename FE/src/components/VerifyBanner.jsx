import { useState } from 'react';
import api, { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Close } from './Icons';

/** Shown at the top of the workspace until the user verifies their email. */
export default function VerifyBanner({ email }) {
  const toast = useToast();
  const [hidden, setHidden] = useState(() => sessionStorageGet('dayflow:hideVerify') === '1');
  const [state, setState] = useState('idle'); // idle | sending | sent

  if (hidden) return null;

  const resend = async () => {
    setState('sending');
    try {
      await api.post('/auth/resend-verification');
      setState('sent');
    } catch (err) {
      setState('idle');
      toast.show({ message: errorMessage(err, 'Couldn’t send the email. Try again.'), variant: 'error' });
    }
  };

  const dismiss = () => {
    sessionStorageSet('dayflow:hideVerify', '1'); // hidden until the browser tab is closed
    setHidden(true);
  };

  return (
    <div className="border-b border-[#FEDF89] bg-[#FFFAEB]">
      <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-4 py-2 sm:px-8">
        <p className="flex-1 text-sm text-[#7A2E0E]">
          {state === 'sent' ? (
            <>New link sent. Check your inbox (and spam folder).</>
          ) : (
            <>
              Verify your email: we sent a link to <span className="font-semibold">{email}</span>.
            </>
          )}
        </p>
        {state !== 'sent' && (
          <button
            type="button"
            onClick={resend}
            disabled={state === 'sending'}
            className="min-h-10 shrink-0 rounded-lg px-3 text-sm font-semibold text-[#7A2E0E] underline-offset-2 hover:bg-[#FEF0C7] hover:underline disabled:opacity-60"
          >
            {state === 'sending' ? 'Sending…' : 'Resend'}
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide this message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#7A2E0E] hover:bg-[#FEF0C7]"
        >
          <Close size={18} />
        </button>
      </div>
    </div>
  );
}

// sessionStorage can throw in some private-browsing modes
function sessionStorageGet(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function sessionStorageSet(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}
