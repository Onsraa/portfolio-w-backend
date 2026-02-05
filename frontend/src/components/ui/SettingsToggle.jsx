import { useTheme } from '@context/ThemeContext';
import { useLanguage } from '@context/LanguageContext';

export default function SettingsToggle() {
    const { theme, toggleTheme, colors } = useTheme();
    const { language, toggleLanguage } = useLanguage();

    const buttonStyle = {
        background: 'none',
        border: `1px solid ${colors.borderLight}`,
        padding: '6px 12px',
        color: colors.textMuted,
        fontSize: '11px',
        fontFamily: 'inherit',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    };

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                onClick={toggleTheme}
                style={buttonStyle}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
                onClick={toggleLanguage}
                style={buttonStyle}
                title={language === 'fr' ? 'Switch to English' : 'Passer en Français'}
            >
                {language.toUpperCase()}
            </button>
        </div>
    );
}