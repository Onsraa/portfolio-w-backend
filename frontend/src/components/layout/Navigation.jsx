import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@context/ThemeContext';
import { useLanguage } from '@context/LanguageContext';

export default function Navigation({ sections = [] }) {
  const location = useLocation();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const getActiveSection = () => {
    const path = location.pathname;
    if (path.startsWith('/articles')) return 'articles';
    if (path.startsWith('/projects')) return 'projects';
    return 'experience';
  };

  const activeSection = getActiveSection();

  const defaultSections = [
    { id: 'experience', label: t.experience, href: '/' },
    { id: 'projects', label: t.projects, href: '/projects' },
    { id: 'articles', label: t.articles, href: '/articles' },
  ];

  const navSections = sections.length > 0 ? sections : defaultSections;

  return (
    <nav style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0 24px',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      gap: '0'
    }}>
      {navSections.map((section) => (
        <Link
          key={section.id}
          to={section.href}
          style={{
            background: 'none',
            border: 'none',
            padding: '20px 24px',
            color: activeSection === section.id ? colors.accent : colors.textDarker,
            fontSize: '13px',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textDecoration: 'none',
            borderBottom: activeSection === section.id ? `1px solid ${colors.accent}` : '1px solid transparent',
            marginBottom: '-1px',
            transition: 'all 0.15s ease'
          }}
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
