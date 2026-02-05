import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
    dark: {
        bg: '#0a0a0a',
        bgSecondary: '#0d0d0d',
        bgHover: '#111',
        border: '#1a1a1a',
        borderLight: '#222',
        text: '#e0e0e0',
        textSecondary: '#888',
        textMuted: '#666',
        textDark: '#555',
        textDarker: '#444',
        textDarkest: '#333',
        accent: '#fff',
    },
    light: {
        bg: '#fafafa',
        bgSecondary: '#f0f0f0',
        bgHover: '#e8e8e8',
        border: '#e0e0e0',
        borderLight: '#d0d0d0',
        text: '#1a1a1a',
        textSecondary: '#555',
        textMuted: '#666',
        textDark: '#777',
        textDarker: '#888',
        textDarkest: '#999',
        accent: '#000',
    },
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const colors = themes[theme];

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}