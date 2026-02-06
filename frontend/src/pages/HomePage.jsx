import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SectionHeader, Loading } from '@components/ui';
import { ExperienceCard, ProjectCard, SkillsBox } from '@components/sections';
import { experiencesApi, projectsApi, skillsApi } from '@config/api';
import { useLanguage } from '@context/LanguageContext';

export default function HomePage({ section = 'experience' }) {
    const { loaded } = useOutletContext();
    const { t } = useLanguage();
    const [experiences, setExperiences] = useState([]);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const [expRes, projRes, skillsRes] = await Promise.all([
                    experiencesApi.list(),
                    projectsApi.list(),
                    skillsApi.list(),
                ]);
                if (isMounted) {
                    setExperiences(expRes.data.experiences);
                    setProjects(projRes.data.projects);
                    setSkills(skillsRes.data.skills);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Erreur chargement données:', err);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const yearsOfExperience = new Date().getFullYear() - 2022;

    if (loading) return <Loading />;

    return (
        <div style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease'
        }}>
            {/* Section Experience */}
            {section === 'experience' && (
                <section>
                    <SectionHeader
                        title={t.experience}
                        count={`${experiences.length} ${t.posts} · ${yearsOfExperience} ${t.years}`}
                    />
                    <div style={{ marginTop: '8px' }}>
                        {experiences.map((exp, index) => (
                            <ExperienceCard
                                key={exp.id}
                                experience={exp}
                                isLast={index === experiences.length - 1}
                            />
                        ))}
                    </div>
                    <SkillsBox skills={skills} />
                </section>
            )}

            {/* Section Projects */}
            {section === 'projects' && (
                <section>
                    <SectionHeader
                        title={t.projects}
                        count={`${projects.length} ${t.entries}`}
                    />
                    <div>
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
