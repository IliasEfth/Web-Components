import { useOutletContext } from 'react-router';
import { themeNames, type IThemeContext } from '../theme/themes';

export function SettingsPage() {
  const { theme, setTheme } = useOutletContext<IThemeContext>();

  return (
    <section className="card">
      <h2>Theme</h2>
      <p className="intro">
        Sets <code>--shop-color-primary</code> on <code>:root</code>. The custom property crosses
        every shadow root, so the Angular and React components recolour too.
      </p>
      <div className="toolbar">
        {themeNames.map((name) => (
          <button
            key={name}
            type="button"
            className="button"
            aria-pressed={name === theme}
            onClick={() => setTheme(name)}
          >
            {name}
          </button>
        ))}
      </div>
    </section>
  );
}
