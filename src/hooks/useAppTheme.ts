import { useColorScheme } from 'react-native';
import { useDogStore } from '../store/dogStore';
import { darkColors, lightColors, ThemeColors } from '../constants/theme';

export function useAppTheme(): {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
} {
  const systemScheme = useColorScheme();
  const themeMode = useDogStore((state) => state.themeMode);
  const setThemeMode = useDogStore((state) => state.setThemeMode);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('system');
    else setThemeMode('light');
  };

  return { colors, isDark, themeMode, toggleTheme };
}
