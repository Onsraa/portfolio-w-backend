import {useState} from 'react';
import {useTheme} from '@context/ThemeContext';
import {useLanguage} from '@context/LanguageContext';
import {TranslationBadge} from '@components/ui';

export default function ExperienceCard({experience, isLast}) {
    const [hovered, setHovered] = useState(false);
    const {colors} = useTheme();
    const {t, getLocalized} = useLanguage();

    const role = getLocalized(experience, 'role');
    const description = getLocalized(experience, 'description');

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(100px, 20%, 160px) 1fr',
                gap: '24px',
                padding: '32px 0',
                borderBottom: `1px solid ${colors.borderLight}`,
                transition: 'all 0.2s ease',
                background: hovered ? `linear-gradient(90deg, ${colors.bgHover} 0%, transparent 100%)` : 'transparent',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{position: 'relative'}}>
        <span style={{
            color: colors.textDark,
            fontSize: '13px',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap'
        }}>
          {experience.period}
        </span>

                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '28px',
                    bottom: '-32px',
                    width: '1px',
                    background: colors.borderLight,
                    display: isLast ? 'none' : 'block'
                }}/>

                {experience.is_current && (
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '32px',
                        transform: 'translateX(-50%)',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: colors.accent,
                        boxShadow: `0 0 12px ${colors.accent}40`,
                        animation: 'pulse 2s ease-in-out infinite'
                    }}/>
                )}
            </div>

            <div>
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '12px',
                    marginBottom: '8px',
                    flexWrap: 'wrap'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '17px',
                        fontWeight: 400,
                        color: hovered ? colors.accent : colors.text,
                        transition: 'color 0.15s ease'
                    }}>
                        {role.value}
                        <TranslationBadge show={role.needsTranslation}/>
                    </h3>
                    <span style={{color: colors.textDarker}}>@</span>
                    <span style={{
                        color: experience.is_current ? colors.textSecondary : colors.textMuted,
                        fontSize: '15px',
                    }}>
            {experience.company}
                        {experience.is_current && (
                            <span style={{
                                marginLeft: '18px',
                                padding: '2px 8px',
                                fontSize: '11px',
                                color: colors.bg,
                                background: colors.accent,
                                letterSpacing: '0.05em'
                            }}>
                {t.now}
              </span>
                        )}
          </span>
                    {experience.is_internship && (
                        <span style={{
                            padding: '2px 8px',
                            fontSize: '11px',
                            color: '#f7f7f7',
                            background: '#3858c9',
                            letterSpacing: '0.05em'
                        }}>
              {t.internship}
            </span>
                    )}
                </div>

                <p style={{
                    margin: '12px 0 16px 0',
                    color: colors.textDark,
                    fontSize: '14px',
                    lineHeight: 1.7,
                    maxWidth: '600px'
                }}>
                    {description.value}
                    <TranslationBadge show={description.needsTranslation}/>
                </p>

                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    {(experience.tech || []).map((tech, i) => (
                        <span
                            key={i}
                            style={{
                                color: colors.textDark,
                                fontSize: '12px',
                                padding: '3px 10px',
                                border: `1px solid ${colors.borderLight}`,
                                background: hovered ? colors.border : 'transparent',
                                transition: 'all 0.15s ease'
                            }}
                        >
              {tech}
            </span>
                    ))}
                </div>
            </div>
        </div>
    );
}