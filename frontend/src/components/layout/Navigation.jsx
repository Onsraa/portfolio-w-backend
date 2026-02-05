import { Link, useLocation } from 'react-router-dom';

export default function Navigation({ sections = [] }) {
  const location = useLocation();

  // Déterminer la section active basée sur l'URL ou le hash
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.startsWith('/blog')) return 'articles';
    if (path === '/') {
      const hash = location.hash.replace('#', '');
      return hash || 'experience';
    }
    return 'experience';
  };

  const activeSection = getActiveSection();

  const defaultSections = [
    { id: 'experience', label: 'Expérience', href: '/#experience' },
    { id: 'projets', label: 'Projets', href: '/#projects' },
    { id: 'articles', label: 'Articles', href: '/blog' },
  ];

  const navSections = sections.length > 0 ? sections : defaultSections;

  return (
    <nav style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0 24px',
      borderBottom: '1px solid #1a1a1a',
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
            color: activeSection === section.id ? '#fff' : '#444',
            fontSize: '13px',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textDecoration: 'none',
            borderBottom: activeSection === section.id ? '1px solid #fff' : '1px solid transparent',
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
