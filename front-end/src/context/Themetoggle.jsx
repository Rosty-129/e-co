import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const icon = 'absolute transition-all duration-500 ease-out';

  const handleClick = () => {
    // lets colors fade instead of snapping (styles live in theme.css)
    const root = document.documentElement;
    root.classList.add('theme-anim');
    setTimeout(() => root.classList.remove('theme-anim'), 700);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative grid place-items-center h-10 w-10 rounded-full overflow-hidden hover:bg-neutral-200/70 transition-colors"
    >
      <Sun
        size={20}
        className={`${icon} ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
      />
      <Moon
        size={19}
        className={`${icon} ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
      />
    </button>
  );
}