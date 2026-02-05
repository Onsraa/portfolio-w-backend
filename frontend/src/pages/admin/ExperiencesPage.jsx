import { useState, useEffect } from 'react';
import { Button, Input, Loading } from '@components/ui';
import { useTheme } from '@context/ThemeContext';
import { experiencesApi } from '@config/api';

function ExperienceForm({ experience, onSave, onCancel }) {
    const { colors } = useTheme();
    const [editLang, setEditLang] = useState('fr');
    const [form, setForm] = useState(experience || {
        period: '',
        company: '',
        role_fr: '',
        role_en: '',
        description_fr: '',
        description_en: '',
        tech: [],
        is_current: false,
        is_internship: false,
    });
    const [techInput, setTechInput] = useState((experience?.tech || []).join(', '));
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                    <label style={labelStyle}>Période</label>
                    <input
                        type="text"
                        value={form.period}
                        onChange={(e) => setForm({ ...form, period: e.target.value })}
                        placeholder="2023 — présent"
                        required
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Entreprise</label>
                    <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Nom de l'entreprise"
                        required
                        style={inputStyle}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Poste ({editLang.toUpperCase()})</label>
                <input
                    type="text"
                    value={editLang === 'fr' ? form.role_fr : form.role_en}
                    onChange={(e) => setForm({
                        ...form,
                        [editLang === 'fr' ? 'role_fr' : 'role_en']: e.target.value
                    })}
                    placeholder="Développeur, Ingénieur..."
                    required
                    style={inputStyle}
                />
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Description ({editLang.toUpperCase()})</label>
                <textarea
                    value={editLang === 'fr' ? form.description_fr : form.description_en}
                    onChange={(e) => setForm({
                        ...form,
                        [editLang === 'fr' ? 'description_fr' : 'description_en']: e.target.value
                    })}
                    placeholder="Description du poste..."
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
                    placeholder="Rust, React, Node.js..."
                    style={inputStyle}
                />
            </div>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '14px' }}>
                    <input
                        type="checkbox"
                        checked={form.is_current}
                        onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
                    />
                    Poste actuel
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '14px' }}>
                    <input
                        type="checkbox"
                        checked={form.is_internship}
                        onChange={(e) => setForm({ ...form, is_internship: e.target.checked })}
                    />
                    Stage/Alternance
                </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <Button type="submit" variant="primary" loading={saving}>
                    {experience ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button type="button" onClick={onCancel}>
                    Annuler
                </Button>
            </div>
        </form>
    );
}

export default function ExperiencesPage() {
    const { colors } = useTheme();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null, 'new', ou id
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        loadExperiences();
    }, []);

    const loadExperiences = async () => {
        try {
            const { data } = await experiencesApi.list();
            setExperiences(data.experiences);
        } catch (err) {
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data) => {
        try {
            await experiencesApi.create(data);
            await loadExperiences();
            setEditing(null);
        } catch (err) {
            alert('Erreur: ' + err.message);
        }
    };

    const handleUpdate = async (data) => {
        try {
            await experiencesApi.update(editing, data);
            await loadExperiences();
            setEditing(null);
            setEditData(null);
        } catch (err) {
            alert('Erreur: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette expérience ?')) return;
        try {
            await experiencesApi.delete(id);
            setExperiences(experiences.filter(e => e.id !== id));
        } catch (err) {
            alert('Erreur: ' + err.message);
        }
    };

    const startEdit = (exp) => {
        setEditing(exp.id);
        setEditData(exp);
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
                    Expériences
                </h1>
                {editing !== 'new' && (
                    <Button variant="primary" onClick={() => setEditing('new')}>
                        + Nouvelle expérience
                    </Button>
                )}
            </div>

            {editing === 'new' && (
                <ExperienceForm
                    onSave={handleCreate}
                    onCancel={() => setEditing(null)}
                />
            )}

            {editing && editing !== 'new' && (
                <ExperienceForm
                    experience={editData}
                    onSave={handleUpdate}
                    onCancel={() => { setEditing(null); setEditData(null); }}
                />
            )}

            <div style={{ border: `1px solid ${colors.border}`, background: colors.bgSecondary }}>
                {experiences.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
                        Aucune expérience. Cliquez sur "+ Nouvelle expérience" pour en créer une.
                    </div>
                ) : experiences.map((exp, index) => (
                    <div
                        key={exp.id}
                        style={{
                            padding: '20px',
                            borderBottom: index < experiences.length - 1 ? `1px solid ${colors.border}` : 'none',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0, color: colors.text, fontSize: '16px', fontWeight: 400 }}>
                                    {exp.role_fr || exp.role_en || 'Sans poste'} <span style={{ color: colors.textDark }}>@</span> {exp.company}
                                </h3>
                                <p style={{ margin: '4px 0 0 0', color: colors.textMuted, fontSize: '13px' }}>
                                    {exp.period}
                                    {exp.is_current && <span style={{ marginLeft: '12px', color: '#5a8a5a' }}>● Actuel</span>}
                                    {exp.is_internship && <span style={{ marginLeft: '12px', color: '#5a5a8a' }}>● Stage</span>}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => startEdit(exp)}
                                    style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Éditer
                                </button>
                                <button
                                    onClick={() => handleDelete(exp.id)}
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