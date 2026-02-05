import { useTheme } from '@context/ThemeContext';
import { useLanguage } from '@context/LanguageContext';

export default function Footer({ siteName }) {
    const { colors } = useTheme();
    const { t } = useLanguage();

    return (
        <footer style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '40px 24px 80px',
            borderTop: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
        }}>
      <span style={{ color: colors.textDarkest, fontSize: '13px' }}>
        © {new Date().getFullYear()} · {siteName || 'Portfolio'}
      </span>
            <span style={{ color: colors.textDarkest, fontSize: '13px' }}>
        <span style={{ color: colors.textDarker }}>{t.lastLogin}:</span> {new Date().toLocaleDateString('fr-FR')}
      </span>
        </footer>
    );
}