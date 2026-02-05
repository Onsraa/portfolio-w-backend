import { useState, useEffect } from 'react';
import { Button, Input, Loading } from '@components/ui';
import { useTheme } from '@context/ThemeContext';
import { projectsApi } from '@config/api';

function ProjectForm({ project, onSave, onCancel }) {
    const { colors } = useTheme();
    const [editLang, setEditLang] = useState('fr');
    const [form, setForm] = useState(project || {
        project_id: '',
        title_fr: '',
        title_en: '',
        description_fr: '',
        description_en: '',
        tech: [],
        year: new Date().getFullYear().toString(),
        link: '',
        is_featured: false,
    });
    const [techInput, setTechInput] = useState((project?.tech || []).join(', '));
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave({
                ...form,
                tech: techInput.split(',').map(t => t.trim()).filter(Boolean),
            });
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: colors.bgSecondary,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: '14px',
        fontFamily: 'inherit',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        color: colors.textMuted,
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };

    return (
        <form onSubmit={handleSubmit} style={{
            padding: '24px',
            background: colors.bgSecondary,
            border: `1px solid ${colors.border}`,
            marginBottom: '24px',
        }}>
            {/* Sélecteur de langue */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: `1px solid ${colors.border}`,
            }}>
                <span style={{ color: colors.textMuted, fontSize: '13px' }}>Éditer en :</span>
                {['fr', 'en'].map(lang => (
                    <button
                        key={lang}
                        type="button"
                        onClick={() => setEditLang(lang)}
                        style={{
                            padding: '6px 14px',
                            background: editLang === lang ? colors.accent : 'transparent',
                            color: editLang === lang ? colors.bg : colors.textMuted,
                            border: `1px solid ${editLang === lang ? colors.accent : colors.border}`,
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            textTransform: 'uppercase',
                        }}
                    >
                        {lang === 'fr' ? 'Français' : 'English'}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px', gap: '16px', marginBottom: '16px' }}>
                <div>
                    <label style={labelStyle}>ID</label>
                    <input
                        type="text"
                        value={form.project_id}
                        onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                        placeholder="001"
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Titre ({editLang.toUpperCase()})</label>
                    <input
                        type="text"
                        value={editLang === 'fr' ? form.title_fr : form.title_en}
                        onChange={(e) => setForm({
                            ...form,
                            [editLang === 'fr' ? 'title_fr' : 'title_en']: e.target.value
                        })}
                        placeholder="Nom du projet"
                        required
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Année</label>
                    <input
                        type="text"
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                        placeholder="2025"
                        style={inputStyle}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Description ({editLang.toUpperCase()})</label>
                <textarea
                    value={editLang === 'fr' ? form.description_fr : form.description_en}
                    onChange={(e) => setForm({
                        ...form,
                        [editLang === 'fr' ? 'description_fr' : 'description_en']: e.target.value
                    })}
                    placeholder="Description du projet..."
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Technologies (séparées par virgules)</label>
                <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="Rust, Bevy, WebAssembly..."
                    style={inputStyle}
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Lien GitHub/Demo</label>
                <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="https://github.com/..."
                    style={inputStyle}
                />
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '14px' }}>
                    <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    />
                    Projet mis en avant
                </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <Button type="submit" variant="primary" loading={saving}>
                    {project ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button type="button" onClick={onCancel}>Annuler</Button>
            </div>
        </form>
    );
}

export default function ProjectsPage() {
    const { colors } = useTheme();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const { data } = await projectsApi.list();
            setProjects(data.projects);
        } catch (err) {
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data) => {
        try {
            await projectsApi.create(data);
            await loadProjects();
            setEditing(null);
        } catch (err) {
            alert('Erreur: ' + err.message);
        }
    };

    const handleUpdate = async (data) => {
        try {
            await projectsApi.update(editing, data);
            await loadProjects();
            setEditing(null);
            setEditData(null);
        } catch (err) {
            alert('Erreur: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce projet ?')) return;
        try {
            await projectsApi.delete(id);
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) {
            alert('Erreur: ' + err.message);
        }
    };

    if (loading) return <Loading />;

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
            }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 400, color: colors.accent }}>
                    Projets
                </h1>
                {editing !== 'new' && (
                    <Button variant="primary" onClick={() => setEditing('new')}>
                        + Nouveau projet
                    </Button>
                )}
            </div>

            {editing === 'new' && (
                <ProjectForm onSave={handleCreate} onCancel={() => setEditing(null)} />
            )}

            {editing && editing !== 'new' && (
                <ProjectForm
                    project={editData}
                    onSave={handleUpdate}
                    onCancel={() => { setEditing(null); setEditData(null); }}
                />
            )}

            <div style={{ border: `1px solid ${colors.border}`, background: colors.bgSecondary }}>
                {projects.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
                        Aucun projet. Cliquez sur "+ Nouveau projet" pour en créer un.
                    </div>
                ) : projects.map((proj, index) => (
                    <div
                        key={proj.id}
                        style={{
                            padding: '20px',
                            borderBottom: index < projects.length - 1 ? `1px solid ${colors.border}` : 'none',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0, color: colors.text, fontSize: '16px', fontWeight: 400 }}>
                                    <span style={{ color: colors.textDark, marginRight: '12px' }}>{proj.project_id}</span>
                                    {proj.title_fr || proj.title_en || 'Sans titre'}
                                    {proj.is_featured && <span style={{ marginLeft: '12px', color: colors.accent }}>★</span>}
                                </h3>
                                <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '13px' }}>
                                    {proj.year} · {proj.tech?.join(', ')}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => { setEditing(proj.id); setEditData(proj); }}
                                    style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Éditer
                                </button>
                                <button
                                    onClick={() => handleDelete(proj.id)}
                                    style={{ background: 'none', border: 'none', color: '#664444', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Suppr.
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}