import {useState, useEffect} from 'react';

const config = {
    name: "Teddy Truong",
    title: "Développeur Rust",
    description: "Grimpeur, joueur, développeur. J'essaye encore de comprendre comment marche les lifetimes en Rust.",
    links: {
        github: "https://github.com/Onsraa",
        linkedin: "https://linkedin.com/in/teddy-truong",
        email: "teddytruong@protonmail.com",
        cv: "/cv.pdf"
    }
};

const experiences = [{
    period: '2025 — présent',
    company: 'UQAC',
    role: 'Développeur Unity',
    description: 'Développement du jeu sérieux Cogni-Actif qui a pour but de simplifier l\'intégration d\'activité physique en milieu scolaire. Les missions sont tenues secretes pour l\'instant !',
    tech: ['C#', 'Unity'],
    current: true,
    internship: false,
}, {
    period: '2023 — 2025',
    company: 'SNCF Réseau',
    role: 'Apprenti Ingénieur Logiciel',
    description: 'Développement d\'outils afin d\'accélérer la productivité des ingénieurs AutoCAD/BricsCAD. Mise en place d\'outils d\'analyses permettant d\'optimiser les dépenses. Création de bibliothèques graphiques en AutoLisp.',
    tech: ['C#', 'VB (.NET)', 'Lisp (AutoLisp)', 'AutoCAD', 'BricsCAD', 'Python', 'M (Power Query)', 'DAX', 'Power Automate'],
    current: false,
    internship: true,
}, {
    period: '2022 — 2023',
    company: 'Numérique Gagnant',
    role: 'Apprenti Développeur',
    description: 'Développement d\'applications et d\'outils pour améliorer la productivité des entreprises collaboratrices.',
    tech: ['PHP', 'NodeJS', 'MySQL', 'Powershell', 'VBA', 'Windev28', 'Power Automate'],
    current: false,
    internship: true,
}];

const projects = [{
    id: '001',
    title: 'Robozzle',
    description: 'Reproduction du jeu Robozzle créé par Igor Ostrovsky sous forme d\'un test technique.',
    tech: ['Rust', 'Bevy'],
    year: '2025',
    link: 'https://github.com/Onsraa/robozzle'
}, {
    id: '002',
    title: 'Particle Life Simulator',
    description: 'Simulateur de particules de vie en 3D avec pour objectif de déterminer la meilleure population qui pourrait survivre dans un environnement.',
    tech: ['Rust', 'Bevy', 'Algorithme génétique'],
    year: '2025',
    link: 'https://github.com/Onsraa/particle-life'
}, {
    id: '003',
    title: 'Machine Learning',
    description: 'Ce projet a été développé dans le cadre du cours "Machine Learning" et permet de tester différents algorithmes d\'apprentissage sur des cas d\'études simples ainsi que sur des tâches de classification d\'images.',
    tech: ['Rust', 'Bevy'],
    year: '2025',
    link: 'https://github.com/Onsraa/machine-learning'
}];

const skills = {
    langages: ['Rust', 'C++', 'C#'],
    crates: ['bevy', 'tokio', 'thiserror'],
    softwares: ['Unity', 'AutoCAD', 'BricsCAD'],
};

function Cursor() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => setVisible(v => !v), 530);
        return () => clearInterval(interval);
    }, []);

    return <span style={{opacity: visible ? 1 : 0}}>█</span>;
}

function TypedText({text, delay = 0}) {
    const [displayed, setDisplayed] = useState('');
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setStarted(true), delay);
        return () => clearTimeout(timeout);
    }, [delay]);

    useEffect(() => {
        if (!started) return;
        if (displayed.length < text.length) {
            const timeout = setTimeout(() => {
                setDisplayed(text.slice(0, displayed.length + 1));
            }, 25);
            return () => clearTimeout(timeout);
        }
    }, [displayed, text, started]);

    return <span>{displayed}</span>;
}

function ExperienceCard({experience, index, isLast}) {
    const [hovered, setHovered] = useState(false);

    return (<div
            style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(100px, 20%, 160px) 1fr',
                gap: '24px',
                padding: '32px 0',
                borderBottom: '1px solid #222',
                transition: 'all 0.2s ease',
                background: hovered ? 'linear-gradient(90deg, #111 0%, transparent 100%)' : 'transparent',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{position: 'relative'}}>
        <span style={{
            color: '#555', fontSize: '13px', fontFamily: 'inherit', whiteSpace: 'nowrap'
        }}>
          {experience.period}
        </span>

                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '28px',
                    bottom: '-32px',
                    width: '1px',
                    background: '#222',
                    display: isLast ? 'none' : 'block'
                }}/>

                {experience.current && (<div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '32px',
                        transform: 'translateX(-50%)',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#fff',
                        boxShadow: '0 0 12px rgba(255,255,255,0.5)',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}/>)}
            </div>

        <div>
            <div style={{
                display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px', flexWrap: 'wrap'
            }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: 400,
                    color: hovered ? '#fff' : '#ccc',
                    transition: 'color 0.15s ease'
                }}>
                    {experience.role}
                </h3>
                <span style={{color: '#444'}}>@</span>
                <span style={{
                    color: experience.current ? '#888' : '#666', fontSize: '15px',
                }}>
            {experience.company}
                    {experience.current && (<span style={{
                            marginLeft: '18px',
                            padding: '2px 8px',
                            fontSize: '11px',
                            color: '#333',
                            background: '#fff',
                            letterSpacing: '0.05em'
                        }}>
                NOW
              </span>

                    )}
          </span>
                <span style={{
                    color: experience.internship ? '#888' : '#666', fontSize: '15px',
                }}>
                    {experience.internship && (<span style={{
                            padding: '2px 8px',
                            fontSize: '11px',
                            color: '#f7f7f7',
                            background: '#3858c9',
                            letterSpacing: '0.05em'
                        }}>
                INTERNSHIP
              </span>

                    )}
          </span>
            </div>


                <p style={{
                    margin: '12px 0 16px 0', color: '#777', fontSize: '14px', lineHeight: 1.7, maxWidth: '600px'
                }}>
                    {experience.description}
                </p>

                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    {experience.tech.map((t, i) => (<span
                            key={i}
                            style={{
                                color: '#555',
                                fontSize: '12px',
                                padding: '3px 10px',
                                border: '1px solid #2a2a2a',
                                background: hovered ? '#1a1a1a' : 'transparent',
                                transition: 'all 0.15s ease'
                            }}
                        >
              {t}
            </span>))}
                </div>
            </div>
        </div>);
}

function ProjectCard({project}) {
    const [hovered, setHovered] = useState(false);

    return (<a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'block',
                padding: '24px 0',
                borderBottom: '1px solid #222',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                background: hovered ? '#111' : 'transparent',
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
              color: '#444', fontFamily: 'inherit', fontSize: '14px'
          }}>
            {project.id}
          </span>
                    <h3 style={{
                        margin: 0,
                        fontSize: '17px',
                        fontWeight: 400,
                        color: hovered ? '#fff' : '#ccc',
                        transition: 'color 0.15s ease'
                    }}>
                        {hovered && <span style={{color: '#555'}}>./</span>}
                        {project.title}
                    </h3>
                </div>
                <span style={{color: '#444', fontSize: '13px'}}>
          {project.year}
        </span>
            </div>

            <p style={{
                margin: '0 0 16px 0', color: '#777', fontSize: '14px', lineHeight: 1.7, maxWidth: '640px'
            }}>
                {project.description}
            </p>

            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                {project.tech.map((t, i) => (<span
                        key={i}
                        style={{
                            color: '#555',
                            fontSize: '12px',
                            padding: '3px 10px',
                            border: '1px solid #2a2a2a',
                            background: hovered ? '#1a1a1a' : 'transparent',
                            transition: 'all 0.15s ease'
                        }}
                    >
            {t}
          </span>))}
            </div>
        </a>);
}

function SectionHeader({title, count}) {
    return (<div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid #1a1a1a'
        }}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: '16px'}}>
                <span style={{color: '#333', fontSize: '13px'}}>$</span>
                <h2 style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 400,
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    {title}
                </h2>
            </div>
            {count && (<span style={{color: '#333', fontSize: '12px'}}>
          {count}
        </span>)}
        </div>);
}

export default function App() {
    const [loaded, setLoaded] = useState(false);
    const [activeSection, setActiveSection] = useState('experience');

    useEffect(() => {
        setLoaded(true);
    }, []);

    const yearsOfExperience = new Date().getFullYear() - 2022;

    return (<div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#e0e0e0',
            fontFamily: '"IBM Plex Mono", "SF Mono", "Fira Code", monospace',
            fontSize: '15px',
            lineHeight: 1.7,
        }}>
            {/* Header */}
            <header style={{
                padding: '80px 24px 60px', maxWidth: '900px', margin: '0 auto', borderBottom: '1px solid #1a1a1a'
            }}>
                <div style={{
                    color: '#333', fontSize: '13px', marginBottom: '24px', fontWeight: 300
                }}>
                    <TypedText text="~/portfolio $" delay={200}/>
                </div>

                <h1 style={{
                    margin: '0 0 24px 0',
                    fontSize: 'clamp(32px, 6vw, 48px)',
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    color: '#fff'
                }}>
                    <TypedText text={config.name} delay={600}/>
                    <span style={{color: '#333'}}><Cursor/></span>
                </h1>

                <p style={{
                    margin: 0,
                    color: '#666',
                    fontSize: '15px',
                    maxWidth: '560px',
                    lineHeight: 1.8,
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.6s ease 1.2s'
                }}>
                    {config.description}
                </p>

                <div style={{
                    marginTop: '32px',
                    display: 'flex',
                    gap: '24px',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.6s ease 1.5s',
                    flexWrap: 'wrap'
                }}>
                    <a href={config.links.github} target="_blank" rel="noopener noreferrer"
                       style={{color: '#666', textDecoration: 'none', fontSize: '14px'}}>
                        <span style={{color: '#333'}}>→</span> github
                    </a>
                    <a href={config.links.linkedin} target="_blank" rel="noopener noreferrer"
                       style={{color: '#666', textDecoration: 'none', fontSize: '14px'}}>
                        <span style={{color: '#333'}}>→</span> linkedin
                    </a>
                    <a href={config.links.email} style={{color: '#666', textDecoration: 'none', fontSize: '14px'}}>
                        <span style={{color: '#333'}}>→</span> email
                    </a>
                    <a href={config.links.cv} target="_blank" rel="noopener noreferrer"
                       style={{color: '#666', textDecoration: 'none', fontSize: '14px'}}>
                        <span style={{color: '#333'}}>→</span> cv.pdf
                    </a>
                </div>
            </header>

            {/* Navigation */}
            <nav style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '0 24px',
                borderBottom: '1px solid #1a1a1a',
                display: 'flex',
                gap: '0'
            }}>
                {['experience', 'projets'].map((section) => (<button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '20px 24px',
                            color: activeSection === section ? '#fff' : '#444',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            borderBottom: activeSection === section ? '1px solid #fff' : '1px solid transparent',
                            marginBottom: '-1px',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        {section}
                    </button>))}
            </nav>

            {/* Main Content */}
            <main style={{
                maxWidth: '900px', margin: '0 auto', padding: '48px 24px 60px'
            }}>
                {/* Experience Section */}
                {activeSection === 'experience' && (<section style={{
                        opacity: loaded ? 1 : 0,
                        transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'all 0.5s ease'
                    }}>
                        <SectionHeader
                            title="Expérience"
                            count={`${experiences.length} postes · ${yearsOfExperience} ans`}
                        />

                        <div style={{marginTop: '8px'}}>
                            {experiences.map((exp, index) => (<ExperienceCard
                                    key={index}
                                    experience={exp}
                                    index={index}
                                    isLast={index === experiences.length - 1}
                                />))}
                        </div>

                        {/* Skills */}
                        <div style={{
                            marginTop: '48px', padding: '24px', border: '1px solid #1a1a1a', background: '#0d0d0d'
                        }}>
                            <div style={{
                                fontSize: '12px',
                                color: '#444',
                                marginBottom: '16px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                $ cat skills.txt
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '24px'
                            }}>
                                <div>
                                    <div style={{
                                        color: '#555',
                                        fontSize: '11px',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}>
                                        Langages
                                    </div>
                                    <div style={{color: '#888', fontSize: '14px', lineHeight: 1.8}}>
                                        {skills.langages.join(', ')}
                                    </div>
                                </div>
                                <div>
                                    <div style={{
                                        color: '#555',
                                        fontSize: '11px',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}>
                                        Crates
                                    </div>
                                    <div style={{color: '#888', fontSize: '14px', lineHeight: 1.8}}>
                                        {skills.crates.join(', ')}
                                    </div>
                                </div>
                                <div>
                                    <div style={{
                                        color: '#555',
                                        fontSize: '11px',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em'
                                    }}>
                                        Softwares
                                    </div>
                                    <div style={{color: '#888', fontSize: '14px', lineHeight: 1.8}}>
                                        {skills.softwares.join(', ')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>)}

                {/* Projects Section */}
                {activeSection === 'projets' && (<section style={{
                        opacity: loaded ? 1 : 0,
                        transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'all 0.5s ease'
                    }}>
                        <SectionHeader
                            title="Projets"
                            count={`${projects.length} entries`}
                        />

                        <div>
                            {projects.map((project) => (<ProjectCard key={project.id} project={project}/>))}
                        </div>
                    </section>)}
            </main>

            {/* Footer */}
            <footer style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '40px 24px 80px',
                borderTop: '1px solid #1a1a1a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
        <span style={{color: '#333', fontSize: '13px'}}>
          © {new Date().getFullYear()} · Teddy Truong
        </span>
                <span style={{color: '#333', fontSize: '13px'}}>
          <span style={{color: '#444'}}>last login:</span> {new Date().toLocaleDateString('fr-FR')}
        </span>
            </footer>
        </div>);
}
