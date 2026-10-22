import type { IActivityFeedContract } from '@shop/insights-contract';
import type { ComponentProps } from '../../models/component-props';
import './activity-feed.css';

type ActivityFeedProps = ComponentProps<IActivityFeedContract>;

export function ActivityFeed({ entries = [], onCleared }: ActivityFeedProps) {
  return (
    <section className="activity-feed">
      <header className="activity-feed__header">
        <h2 className="activity-feed__title">Activity</h2>
        <button
          type="button"
          className="activity-feed__clear"
          disabled={entries.length === 0}
          onClick={() => onCleared?.({})}
        >
          Clear
        </button>
      </header>

      {entries.length === 0 ? (
        <p className="activity-feed__message">Nothing yet. Pick a statistic or refresh them.</p>
      ) : (
        <ul className="activity-feed__list">
          {entries.map((entry) => (
            <li key={entry.id} className="activity-feed__entry">
              <time className="activity-feed__time">{entry.at}</time>
              {entry.text}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
