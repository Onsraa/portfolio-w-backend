import { useTheme } from '@context/ThemeContext';

export default function SectionHeader({ title, count }) {
    const { colors } = useTheme();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: `1px solid ${colors.border}`
        }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <span style={{ color: colors.textDarkest, fontSize: '13px' }}>$</span>
                <h2 style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 400,
                    color: colors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    {title}
                </h2>
            </div>
            {count && (
                <span style={{ color: colors.textDarkest, fontSize: '12px' }}>
          {count}
        </span>
            )}
        </div>
    );
}