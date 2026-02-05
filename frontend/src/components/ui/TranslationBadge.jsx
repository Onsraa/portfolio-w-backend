import { useTheme } from '@context/ThemeContext';
import { useLanguage } from '@context/LanguageContext';

export default function TranslationBadge({ show }) {
    const { colors } = useTheme();
    const { language } = useLanguage();

    if (!show) return null;

    return (
        <span
            style={{
                marginLeft: '8px',
                padding: '2px 6px',
                fontSize: '9px',
                color: colors.textDarker,
                border: `1px dashed ${colors.borderLight}`,
                borderRadius: '2px',
                fontStyle: 'italic',
                opacity: 0.7,
            }}
            title={language === 'fr' ? 'English version not available yet' : 'Version française non disponible'}
        >
      {language === 'fr' ? 'FR' : 'EN'}
    </span>
    );
}