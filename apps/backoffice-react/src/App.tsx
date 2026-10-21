import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { themes, type IThemeContext, type ThemeName } from './theme/themes';

export function App() {
  const [theme, setTheme] = useState<ThemeName>('Blue');

  useEffect(() => {
    document.documentElement.style.setProperty('--shop-color-primary', themes[theme]);
  }, [theme]);

  return (
    <>
      <header className="page-header">
        <h1>Shop Back Office</h1>
        <p>Act 2 · the React host. Angular and React components, loaded at runtime.</p>
        <nav className="page-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>

      <main>
        <Outlet context={{ theme, setTheme } satisfies IThemeContext} />
      </main>
    </>
  );
}
