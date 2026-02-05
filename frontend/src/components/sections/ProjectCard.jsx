import {useState} from 'react';
import {useTheme} from '@context/ThemeContext';
import {useLanguage} from '@context/LanguageContext';
import {TranslationBadge} from '@components/ui';

export default function ProjectCard({project}) {
    const [hovered, setHovered] = useState(false);
    const {colors} = useTheme();
    const {getLocalized} = useLanguage();

    const title = getLocalized(project, 'title');
    const description = getLocalized(project, 'description');

    return (<a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
            display: 'block',
            padding: '24px 0',
            borderBottom: `1px solid ${colors.borderLight}`,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.15s ease',
            background: hovered ? colors.bgHover : 'transparent',
            marginLeft: hovered ? '8px' : '0',
            paddingLeft: hovered ? '16px' : '0',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
    >
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px'
        }}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: '16px'}}>
<span style={{
    color: colors.textDarker, fontFamily: 'inherit', fontSize: '14px'
}}>
    {project.project_id}
</span>
                <h3 style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: 400,
                    color: hovered ? colors.accent : colors.text,
                    transition: 'color 0.15s ease'
                }}>
                    {hovered && <span style={{color: colors.textDark}}>./</span>}
                    {title.value}
                    <TranslationBadge show={title.needsTranslation}/>
                </h3>
            </div>
            <span style={{color: colors.textDarker, fontSize: '13px'}}>
          {project.year}
        </span>
        </div>

        <p style={{
            margin: '0 0 16px 0', color: colors.textDark, fontSize: '14px', lineHeight: 1.7, maxWidth: '640px'
        }}>
            {description.value}
            <TranslationBadge show={description.needsTranslation}/>
        </p>

        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            {(project.tech || []).map((tech, i) => (<span
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
          </span>))}
        </div>
    </a>);
}