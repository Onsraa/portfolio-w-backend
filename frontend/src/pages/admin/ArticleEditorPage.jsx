import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@context/ThemeContext';
import { articlesApi } from '@config/api';
import { Loading } from '@components/ui';

export default function ArticleEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { colors } = useTheme();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editLang, setEditLang] = useState('fr');

    const [article, setArticle] = useState({
        title_fr: '',
        title_en: '',
        slug: '',
        excerpt_fr: '',
        excerpt_en: '',
        content_fr: [],
        content_en: [],
        cover_image: '',
        tags: [],
        is_published: false,
    });

    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (isEditing) {
            loadArticle();
        }
    }, [id]);

    const loadArticle = async () => {
        try {
            const { data } = await articlesApi.getById(id);
            const loadedArticle = data.article;

            // Synchroniser les structures si nécessaire
            const contentFr = loadedArticle.content_fr || [];
            const contentEn = loadedArticle.content_en || [];
            const maxLength = Math.max(contentFr.length, contentEn.length);

            // S'assurer que les deux arrays ont la même longueur
            while (contentFr.length < maxLength) {
                contentFr.push({ type: 'paragraph', content: '' });
            }
            while (contentEn.length < maxLength) {
                contentEn.push({ type: 'paragraph', content: '' });
            }

            // Convertir tous les null en chaînes vides pour éviter les warnings React
            setArticle({
                title_fr: loadedArticle.title_fr || '',
                title_en: loadedArticle.title_en || '',
                slug: loadedArticle.slug || '',
                excerpt_fr: loadedArticle.excerpt_fr || '',
                excerpt_en: loadedArticle.excerpt_en || '',
                content_fr: contentFr,
                content_en: contentEn,
                cover_image: loadedArticle.cover_image || '',
                tags: loadedArticle.tags || [],
                is_published: Boolean(loadedArticle.is_published),
            });
        } catch (err) {
            console.error('Erreur chargement article:', err);
            setError('Article non trouvé');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setArticle(prev => ({ ...prev, [field]: value }));
    };

    const currentContent = editLang === 'fr' ? article.content_fr : article.content_en;
    const currentTitle = editLang === 'fr' ? article.title_fr : article.title_en;
    const currentExcerpt = editLang === 'fr' ? article.excerpt_fr : article.excerpt_en;

    const setCurrentTitle = (title) => {
        handleChange(editLang === 'fr' ? 'title_fr' : 'title_en', title);
    };

    const setCurrentExcerpt = (excerpt) => {
        handleChange(editLang === 'fr' ? 'excerpt_fr' : 'excerpt_en', excerpt);
    };

    // Ajouter un bloc dans les DEUX langues
    const addBlock = (type) => {
        const newBlockFr = { type, content: '' };
        const newBlockEn = { type, content: '' };

        if (type === 'list') {
            newBlockFr.items = [''];
            newBlockEn.items = [''];
        }
        if (type === 'heading') {
            newBlockFr.level = 2;
            newBlockEn.level = 2;
        }
        if (type === 'code') {
            newBlockFr.language = 'javascript';
            newBlockEn.language = 'javascript';
        }
        if (type === 'image') {
            newBlockFr.url = '';
            newBlockFr.alt = '';
            newBlockEn.url = '';
            newBlockEn.alt = '';
        }

        setArticle(prev => ({
            ...prev,
            content_fr: [...prev.content_fr, newBlockFr],
            content_en: [...prev.content_en, newBlockEn],
        }));
    };

    // Mettre à jour un bloc (seulement dans la langue courante, sauf pour certains champs partagés)
    const updateBlock = (index, updates) => {
        const sharedFields = ['type', 'level', 'language']; // Champs synchronisés
        const imageFields = ['url', 'alt']; // Images partagées entre langues

        setArticle(prev => {
            const newContentFr = [...prev.content_fr];
            const newContentEn = [...prev.content_en];

            // Mettre à jour la langue courante
            if (editLang === 'fr') {
                newContentFr[index] = { ...newContentFr[index], ...updates };
            } else {
                newContentEn[index] = { ...newContentEn[index], ...updates };
            }

            // Synchroniser les champs partagés
            sharedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    newContentFr[index] = { ...newContentFr[index], [field]: updates[field] };
                    newContentEn[index] = { ...newContentEn[index], [field]: updates[field] };
                }
            });

            // Synchroniser les images (URL et alt partagés)
            if (newContentFr[index]?.type === 'image') {
                imageFields.forEach(field => {
                    if (updates[field] !== undefined) {
                        newContentFr[index] = { ...newContentFr[index], [field]: updates[field] };
                        newContentEn[index] = { ...newContentEn[index], [field]: updates[field] };
                    }
                });
            }

            return { ...prev, content_fr: newContentFr, content_en: newContentEn };
        });
    };

    // Supprimer un bloc des DEUX langues
    const removeBlock = (index) => {
        setArticle(prev => ({
            ...prev,
            content_fr: prev.content_fr.filter((_, i) => i !== index),
            content_en: prev.content_en.filter((_, i) => i !== index),
        }));
    };

    // Déplacer un bloc dans les DEUX langues
    const moveBlock = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= currentContent.length) return;

        setArticle(prev => {
            const newContentFr = [...prev.content_fr];
            const newContentEn = [...prev.content_en];

            [newContentFr[index], newContentFr[newIndex]] = [newContentFr[newIndex], newContentFr[index]];
            [newContentEn[index], newContentEn[newIndex]] = [newContentEn[newIndex], newContentEn[index]];

            return { ...prev, content_fr: newContentFr, content_en: newContentEn };
        });
    };

    const addTag = () => {
        if (tagInput.trim() && !article.tags.includes(tagInput.trim())) {
            handleChange('tags', [...article.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        handleChange('tags', article.tags.filter(t => t !== tag));
    };

    const handleSave = async (publish = false) => {
        setSaving(true);
        setError(null);

        try {
            const cleanContent = (content) => content.map(block => {
                if (block.type === 'list') {
                    return { ...block, items: (block.items || []).filter(item => item.trim() !== '') };
                }
                return block;
            });

            // Créer l'objet avec seulement les champs nécessaires
            const articleData = {
                title_fr: article.title_fr,
                title_en: article.title_en,
                slug: article.slug,
                excerpt_fr: article.excerpt_fr,
                excerpt_en: article.excerpt_en,
                content_fr: cleanContent(article.content_fr),
                content_en: cleanContent(article.content_en),
                cover_image: article.cover_image || null,
                tags: article.tags,
                is_published: publish ? true : article.is_published,
            };

            let response;
            if (isEditing) {
                response = await articlesApi.update(id, articleData);
                navigate('/admin/articles');
            } else {
                response = await articlesApi.create(articleData);
                if (response.data.article?.id) {
                    navigate(`/admin/articles/${response.data.article.id}/edit`, { replace: true });
                } else {
                    navigate('/admin/articles');
                }
            }
        } catch (err) {
            console.error('Erreur sauvegarde:', err);
            setError(err.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading />;

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

    const buttonStyle = {
        padding: '10px 20px',
        fontSize: '13px',
        fontFamily: 'inherit',
        cursor: 'pointer',
        border: `1px solid ${colors.border}`,
        transition: 'all 0.15s ease',
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
            }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 400, color: colors.accent }}>
                    {isEditing ? 'Modifier l\'article' : 'Nouvel article'}
                </h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/admin/articles')}
                        style={{
                            ...buttonStyle,
                            background: 'transparent',
                            color: colors.textMuted,
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        style={{
                            ...buttonStyle,
                            background: colors.bgSecondary,
                            color: colors.text,
                        }}
                    >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    {!article.is_published && (
                        <button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            style={{
                                ...buttonStyle,
                                background: colors.accent,
                                color: colors.bg,
                                border: `1px solid ${colors.accent}`,
                            }}
                        >
                            Publier
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div style={{
                    padding: '12px 16px',
                    marginBottom: '24px',
                    background: '#331111',
                    border: '1px solid #552222',
                    color: '#ff6666',
                    fontSize: '14px',
                }}>
                    {error}
                </div>
            )}

            {/* Statut */}
            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Statut</label>
                <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    background: article.is_published ? '#113311' : '#332211',
                    border: `1px solid ${article.is_published ? '#225522' : '#554422'}`,
                    color: article.is_published ? '#66ff66' : '#ffaa66',
                    fontSize: '12px',
                }}>
          {article.is_published ? 'Publié' : 'Brouillon'}
        </span>
            </div>

            {/* Sélecteur de langue */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '32px',
                padding: '16px',
                background: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
            }}>
        <span style={{ color: colors.textMuted, fontSize: '13px' }}>
          Éditer en :
        </span>
                {['fr', 'en'].map(lang => (
                    <button
                        key={lang}
                        onClick={() => setEditLang(lang)}
                        style={{
                            padding: '8px 16px',
                            background: editLang === lang ? colors.accent : 'transparent',
                            color: editLang === lang ? colors.bg : colors.textMuted,
                            border: `1px solid ${editLang === lang ? colors.accent : colors.border}`,
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {lang === 'fr' ? 'Français' : 'English'}
                    </button>
                ))}
            </div>

            {/* Titre */}
            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>
                    Titre ({editLang.toUpperCase()})
                </label>
                <input
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder={`Titre de l'article (${editLang === 'fr' ? 'Français' : 'Anglais'})`}
                    style={inputStyle}
                />
            </div>

            {/* Slug */}
            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Slug (URL)</label>
                <input
                    type="text"
                    value={article.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="mon-article (auto-généré si vide)"
                    style={inputStyle}
                />
            </div>

            {/* Extrait */}
            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>
                    Extrait ({editLang.toUpperCase()})
                </label>
                <textarea
                    value={currentExcerpt}
                    onChange={(e) => setCurrentExcerpt(e.target.value)}
                    placeholder={`Court résumé de l'article (${editLang === 'fr' ? 'Français' : 'Anglais'})`}
                    style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: '80px',
                    }}
                />
            </div>

            {/* Image de couverture */}
            <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Image de couverture</label>
                <input
                    type="text"
                    value={article.cover_image}
                    onChange={(e) => handleChange('cover_image', e.target.value)}
                    placeholder="URL de l'image..."
                    style={inputStyle}
                />
                {article.cover_image && (
                    <img
                        src={article.cover_image}
                        alt="Aperçu"
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            height: 'auto',
                            marginTop: '12px',
                            border: `1px solid ${colors.border}`,
                        }}
                    />
                )}
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '32px' }}>
                <label style={labelStyle}>Tags</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                        placeholder="Ajouter un tag..."
                        style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                        onClick={addTag}
                        style={{
                            ...buttonStyle,
                            background: colors.bgSecondary,
                            color: colors.textMuted,
                            padding: '12px 16px',
                        }}
                    >
                        +
                    </button>
                </div>
                {article.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {article.tags.map(tag => (
                            <span
                                key={tag}
                                style={{
                                    padding: '6px 10px',
                                    background: colors.bg,
                                    border: `1px solid ${colors.border}`,
                                    color: colors.textMuted,
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                #{tag}
                                <button
                                    onClick={() => removeTag(tag)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ff6666',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        padding: 0,
                                        lineHeight: 1,
                                    }}
                                >
                  ×
                </button>
              </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Contenu */}
            <div style={{ marginBottom: '32px' }}>
                <label style={labelStyle}>
                    Contenu ({editLang.toUpperCase()})
                </label>

                {/* Blocs de contenu */}
                {currentContent.map((block, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: '16px',
                            padding: '20px',
                            background: colors.bgSecondary,
                            border: `1px solid ${colors.border}`,
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                        }}>
              <span style={{
                  color: colors.textDark,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
              }}>
                {block.type}
              </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => moveBlock(index, -1)}
                                    disabled={index === 0}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: index === 0 ? colors.textDarkest : colors.textMuted,
                                        cursor: index === 0 ? 'default' : 'pointer',
                                        fontSize: '16px',
                                        padding: '4px 8px',
                                    }}
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => moveBlock(index, 1)}
                                    disabled={index === currentContent.length - 1}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: index === currentContent.length - 1 ? colors.textDarkest : colors.textMuted,
                                        cursor: index === currentContent.length - 1 ? 'default' : 'pointer',
                                        fontSize: '16px',
                                        padding: '4px 8px',
                                    }}
                                >
                                    ↓
                                </button>
                                <button
                                    onClick={() => removeBlock(index)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ff6666',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        padding: '4px 8px',
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Rendu selon le type */}
                        {block.type === 'paragraph' && (
                            <textarea
                                value={block.content || ''}
                                onChange={(e) => updateBlock(index, { content: e.target.value })}
                                placeholder="Texte du paragraphe..."
                                style={{
                                    ...inputStyle,
                                    background: colors.bg,
                                    resize: 'vertical',
                                    minHeight: '120px',
                                }}
                            />
                        )}

                        {block.type === 'heading' && (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                                <select
                                    value={block.level || 2}
                                    onChange={(e) => updateBlock(index, { level: parseInt(e.target.value) })}
                                    style={{
                                        ...inputStyle,
                                        background: colors.bg,
                                        width: 'auto',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value={1}>H1</option>
                                    <option value={2}>H2</option>
                                    <option value={3}>H3</option>
                                    <option value={4}>H4</option>
                                </select>
                                <input
                                    type="text"
                                    value={block.content || ''}
                                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                                    placeholder="Texte du titre..."
                                    style={{ ...inputStyle, background: colors.bg, flex: 1 }}
                                />
                            </div>
                        )}

                        {block.type === 'code' && (
                            <div>
                                <input
                                    type="text"
                                    value={block.language || ''}
                                    onChange={(e) => updateBlock(index, { language: e.target.value })}
                                    placeholder="Langage (js, python, rust...)"
                                    style={{ ...inputStyle, background: colors.bg, marginBottom: '8px' }}
                                />
                                <textarea
                                    value={block.content || ''}
                                    onChange={(e) => updateBlock(index, { content: e.target.value })}
                                    placeholder="Code..."
                                    style={{
                                        ...inputStyle,
                                        background: colors.bg,
                                        fontFamily: 'monospace',
                                        fontSize: '13px',
                                        resize: 'vertical',
                                        minHeight: '150px',
                                    }}
                                />
                            </div>
                        )}

                        {block.type === 'quote' && (
                            <textarea
                                value={block.content || ''}
                                onChange={(e) => updateBlock(index, { content: e.target.value })}
                                placeholder="Citation..."
                                style={{
                                    ...inputStyle,
                                    background: colors.bg,
                                    fontStyle: 'italic',
                                    resize: 'vertical',
                                    minHeight: '80px',
                                }}
                            />
                        )}

                        {block.type === 'list' && (
                            <textarea
                                value={(block.items || []).join('\n')}
                                onChange={(e) => updateBlock(index, { items: e.target.value.split('\n') })}
                                placeholder="Un élément par ligne..."
                                style={{
                                    ...inputStyle,
                                    background: colors.bg,
                                    resize: 'vertical',
                                    minHeight: '120px',
                                }}
                            />
                        )}

                        {block.type === 'image' && (
                            <div>
                                <input
                                    type="text"
                                    value={block.url || ''}
                                    onChange={(e) => updateBlock(index, { url: e.target.value })}
                                    placeholder="URL de l'image..."
                                    style={{ ...inputStyle, background: colors.bg, marginBottom: '8px' }}
                                />
                                <input
                                    type="text"
                                    value={block.alt || ''}
                                    onChange={(e) => updateBlock(index, { alt: e.target.value })}
                                    placeholder="Texte alternatif..."
                                    style={{ ...inputStyle, background: colors.bg }}
                                />
                                {block.url && (
                                    <img
                                        src={block.url}
                                        alt={block.alt || ''}
                                        style={{
                                            width: '100%',
                                            maxWidth: '300px',
                                            height: 'auto',
                                            marginTop: '12px',
                                            border: `1px solid ${colors.border}`,
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Boutons d'ajout */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    padding: '20px',
                    background: colors.bgSecondary,
                    border: `1px dashed ${colors.border}`,
                }}>
          <span style={{ color: colors.textMuted, fontSize: '12px', marginRight: '8px', alignSelf: 'center' }}>
            Ajouter :
          </span>
                    {['paragraph', 'heading', 'code', 'quote', 'list', 'image'].map(type => (
                        <button
                            key={type}
                            onClick={() => addBlock(type)}
                            style={{
                                padding: '8px 14px',
                                background: 'transparent',
                                border: `1px solid ${colors.border}`,
                                color: colors.textMuted,
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            + {type}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}