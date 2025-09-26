import React, { createContext, useContext, useState, useEffect } from 'react';
import { TinyColor } from '@ctrl/tinycolor';

const generateThemeFromColor = (baseColor) => {
  const color = new TinyColor(baseColor);

  return {
    name: 'Custom',
    colors: {
      // Primary palette - based on selected color
      primary: {
        50: color.clone().lighten(45).toHexString(),
        100: color.clone().lighten(40).toHexString(),
        200: color.clone().lighten(30).toHexString(),
        300: color.clone().lighten(20).toHexString(),
        400: color.clone().lighten(10).toHexString(),
        500: color.toHexString(),
        600: color.clone().darken(10).toHexString(),
        700: color.clone().darken(20).toHexString(),
        800: color.clone().darken(30).toHexString(),
        900: color.clone().darken(40).toHexString(),
      },

      // Complementary colors
      secondary: {
        50: color.clone().complement().lighten(40).toHexString(),
        100: color.clone().complement().lighten(35).toHexString(),
        200: color.clone().complement().lighten(25).toHexString(),
        300: color.clone().complement().lighten(15).toHexString(),
        400: color.clone().complement().lighten(5).toHexString(),
        500: color.clone().complement().toHexString(),
        600: color.clone().complement().darken(5).toHexString(),
        700: color.clone().complement().darken(15).toHexString(),
        800: color.clone().complement().darken(25).toHexString(),
        900: color.clone().complement().darken(35).toHexString(),
      },

      // Semantic colors
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },

      warning: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
      },

      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },

      info: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },

      // Neutral/gray colors
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
      }
    }
  };
};

// Predefined themes
const predefinedThemes = {
  blue: {
    name: 'Ocean Blue',
    baseColor: '#3b82f6',
    colors: {
      primary: {
        50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
        400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
        800: '#1e40af', 900: '#1e3a8a'
      },
      secondary: {
        50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
        400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
        800: '#075985', 900: '#0c4a6e'
      },
      success: {
        50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
        400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
        800: '#166534', 900: '#14532d'
      },
      warning: {
        50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
        400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
        800: '#9a3412', 900: '#7c2d12'
      },
      error: {
        50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
        400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
        800: '#991b1b', 900: '#7f1d1d'
      },
      info: {
        50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
        400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
        800: '#075985', 900: '#0c4a6e'
      },
      neutral: {
        50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4',
        400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040',
        800: '#262626', 900: '#171717'
      }
    }
  },

  green: {
    name: 'Forest Green',
    baseColor: '#22c55e',
    colors: {
      primary: {
        50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
        400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
        800: '#166534', 900: '#14532d'
      },
      secondary: {
        50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
        400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
        800: '#075985', 900: '#0c4a6e'
      },
      success: {
        50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
        400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
        800: '#166534', 900: '#14532d'
      },
      warning: {
        50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
        400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
        800: '#9a3412', 900: '#7c2d12'
      },
      error: {
        50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
        400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
        800: '#991b1b', 900: '#7f1d1d'
      },
      info: {
        50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
        400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
        800: '#075985', 900: '#0c4a6e'
      },
      neutral: {
        50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4',
        400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040',
        800: '#262626', 900: '#171717'
      }
    }
  },

  purple: {
    name: 'Royal Purple',
    baseColor: '#a855f7',
    colors: {
      primary: {
        50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
        400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7c3aed',
        800: '#6b21a8', 900: '#581c87'
      },
      secondary: {
        50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047',
        400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207',
        800: '#854d0e', 900: '#713f12'
      },
      success: {
        50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
        400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
        800: '#166534', 900: '#14532d'
      },
      warning: {
        50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
        400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
        800: '#9a3412', 900: '#7c2d12'
      },
      error: {
        50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
        400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
        800: '#991b1b', 900: '#7f1d1d'
      },
      info: {
        50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
        400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
        800: '#075985', 900: '#0c4a6e'
      },
      neutral: {
        50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4',
        400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040',
        800: '#262626', 900: '#171717'
      }
    }
  }
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themes, setThemes] = useState(predefinedThemes);
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved && predefinedThemes[saved] ? saved : 'blue';
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const theme = themes[currentTheme];

    // Apply theme colors to CSS custom properties
    const root = document.documentElement;

    // Apply all color palettes
    Object.entries(theme.colors).forEach(([paletteName, palette]) => {
      Object.entries(palette).forEach(([key, value]) => {
        root.style.setProperty(`--color-${paletteName}-${key}`, value);
      });
    });

    // Apply dark mode classes
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme, darkMode, themes]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const createCustomTheme = (baseColor) => {
    const customTheme = generateThemeFromColor(baseColor);
    const themeKey = `custom-${Date.now()}`;

    setThemes(prev => ({
      ...prev,
      [themeKey]: customTheme
    }));

    setCurrentTheme(themeKey);
    return themeKey;
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const value = {
    currentTheme,
    darkMode,
    themes,
    changeTheme,
    createCustomTheme,
    toggleDarkMode,
    themeColors: themes[currentTheme].colors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
