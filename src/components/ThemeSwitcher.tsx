import React from 'react';
import styles from './ThemeSwitcher.module.css';

const THEMES = ['light', 'dark', 'minecraft'];

interface ThemeSwitcherProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Theme</h2>
      <div className={styles.themeGrid}>
        {THEMES.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`${styles.themeButton} ${theme === t ? styles.themeButtonActive : ''}`}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
