import { useTheme } from '@context/ThemeContext';
import { useLanguage } from '@context/LanguageContext';

export default function SkillsBox({ skills }) {
    const { colors } = useTheme();
    const { t } = useLanguage();

    if (!skills || Object.keys(skills).length === 0) return null;

    return (
        <div style={{
            marginTop: '48px',
            padding: '24px',
            border: `1px solid ${colors.border}`,
            background: colors.bgSecondary
        }}>
            <div style={{
                fontSize: '12px',
                color: colors.textDarker,
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
            }}>
                {t.catSkills}
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px'
            }}>
                {Object.entries(skills).map(([category, items]) => (
                    <div key={category}>
                        <div style={{
                            color: colors.textDark,
                            fontSize: '11px',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            {category}
                        </div>
                        <div style={{
                            color: colors.textSecondary,
                            fontSize: '14px',
                            lineHeight: 1.8
                        }}>
                            {Array.isArray(items) ? items.join(', ') : items}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}