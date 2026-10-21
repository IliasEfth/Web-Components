import { useRouteError } from 'react-router';

export function ErrorPage() {
  const error = useRouteError();

  return (
    <section className="card remote-card remote-card--failed" role="alert">
      <h2>This page could not load</h2>
      <p className="remote-card__error">{String(error)}</p>
    </section>
  );
}
