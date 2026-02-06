import {useState, useEffect} from 'react';
import {useTheme} from '@context/ThemeContext';
import {useLanguage} from '@context/LanguageContext';
import {TranslationBadge} from '@components/ui';

function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
        const handler = (e) => setIsMobile(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [breakpoint]);

    return isMobile;
}

export default function ExperienceCard({experience, isLast}) {
    const [hovered, setHovered] = useState(false);
    const {colors} = useTheme();
    const {t, getLocalized} = useLanguage();
    const isMobile = useIsMobile();

    const role = getLocalized(experience, 'role');
    const description = getLocalized(experience, 'description');

    const period = experience.period?.replace(/présent/i, t.present) || '';

    if (isMobile) {
        return (
            <div
                style={{
                    padding: '24px 0',
                    borderBottom: `1px solid ${colors.borderLight}`,
                }}
            >
                {/* Title row: role + period on the right */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '8px',
                    marginBottom: '6px',
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: 400,
                        color: colors.text,
                        flex: '1 1 0',
                        minWidth: 0,
                    }}>
                        {role.value}
                        <TranslationBadge show={role.needsTranslation}/>
                    </h3>
                    <span style={{
                        color: colors.textDark,
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}>
                        {period}
                    </span>
                </div>

                {/* Company + badges */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                    flexWrap: 'wrap',
                }}>
                    <span style={{color: colors.textDarker, fontSize: '13px'}}>@</span>
                    <span style={{
                        color: experience.is_current ? colors.textSecondary : colors.textMuted,
                        fontSize: '14px',
                    }}>
                        {experience.company}
                    </span>
                    {experience.is_current && (
                        <span style={{
                            padding: '2px 8px',
                            fontSize: '10px',
                            color: colors.bg,
                            background: colors.accent,
                            letterSpacing: '0.05em'
                        }}>
                            {t.now}
                        </span>
                    )}
                    {experience.is_apprenticeship && (
                        <span style={{
                            padding: '2px 8px',
                            fontSize: '10px',
                            color: '#f7f7f7',
                            background: '#3858c9',
                            letterSpacing: '0.05em'
                        }}>
                            {t.apprenticeship}
                        </span>
                    )}
                    {experience.is_internship && (
                        <span style={{
                            padding: '2px 8px',
                            fontSize: '10px',
                            color: '#f7f7f7',
                            background: '#2e7d32',
                            letterSpacing: '0.05em'
                        }}>
                            {t.internship}
                        </span>
                    )}
                </div>

                {description.value && (
                    <p style={{
                        margin: '0 0 12px 0',
                        color: colors.textDark,
                        fontSize: '13px',
                        lineHeight: 1.7,
                    }}>
                        {description.value}
                        <TranslationBadge show={description.needsTranslation}/>
                    </p>
                )}

                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                    {(experience.tech || []).map((tech, i) => (
                        <span
                            key={i}
                            style={{
                                color: colors.textDark,
                                fontSize: '11px',
                                padding: '2px 8px',
                                border: `1px solid ${colors.borderLight}`,
                            }}
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    // Desktop layout (unchanged)
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(70px, 15%, 150px) 1fr',
                gap: 'clamp(12px, 3vw, 24px)',
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
                    fontSize: 'clamp(10px, 2.5vw, 13px)',
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap'
                }}>
                    {period}
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
                    {experience.is_apprenticeship && (
                        <span style={{
                            padding: '2px 8px',
                            fontSize: '11px',
                            color: '#f7f7f7',
                            background: '#3858c9',
                            letterSpacing: '0.05em'
                        }}>
                            {t.apprenticeship}
                        </span>
                    )}
                    {experience.is_internship && (
                        <span style={{
                            padding: '2px 8px',
                            fontSize: '11px',
                            color: '#f7f7f7',
                            background: '#2e7d32',
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
