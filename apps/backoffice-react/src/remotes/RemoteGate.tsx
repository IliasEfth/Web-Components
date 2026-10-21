import { useEffect, useState, type ReactNode } from 'react';

type RemoteState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'failed'; message: string };

interface IRemoteGateProps {
  name: string;
  load: () => Promise<void>;
  children: ReactNode;
}

export function RemoteGate({ name, load, children }: IRemoteGateProps) {
  const [state, setState] = useState<RemoteState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    load().then(
      () => {
        if (active) setState({ status: 'ready' });
      },
      (error: unknown) => {
        if (active) setState({ status: 'failed', message: String(error) });
      },
    );
    return () => {
      active = false;
    };
  }, [load, attempt]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt((count) => count + 1);
  };

  if (state.status === 'ready') {
    return children;
  }

  if (state.status === 'loading') {
    return <section className="card remote-card">Loading {name}…</section>;
  }

  return (
    <section className="card remote-card remote-card--failed" role="alert">
      <h2>{name} is unavailable</h2>
      <p>The rest of the back office keeps working.</p>
      <p className="remote-card__error">{state.message}</p>
      <button type="button" className="button" onClick={retry}>
        Retry
      </button>
    </section>
  );
}
