import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loading, TranslationBadge } from '@components/ui';
import { articlesApi } from '@config/api';
import { useTheme } from '@context/ThemeContext';
import { useLanguage } from '@context/LanguageContext';

function ContentBlock({ block }) {
    const { colors } = useTheme();
    const { getLocalized } = useLanguage();

    switch (block.type) {
        case 'paragraph':
            return (
                <p style={{
                    margin: '0 0 24px 0',
                    color: colors.textSecondary,
                    fontSize: '15px',
                    lineHeight: 1.8,
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                }}>
                    {block.content}
                </p>
            );

        case 'heading':
            const Tag = `h${block.level || 2}`;
            const sizes = { 1: '28px', 2: '22px', 3: '18px', 4: '16px' };
            return (
                <Tag style={{
                    margin: '48px 0 16px 0',
                    color: colors.accent,
                    fontSize: sizes[block.level] || '22px',
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                }}>
          <span style={{ color: colors.textDarkest, marginRight: '12px' }}>
            {'#'.repeat(block.level || 2)}
          </span>
                    {block.content}
                </Tag>
            );

        case 'code':
            return (
                <div style={{
                    margin: '24px 0',
                    background: colors.bgHover,
                    border: `1px solid ${colors.borderLight}`,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '8px 16px',
                        background: colors.bgSecondary,
                        borderBottom: `1px solid ${colors.borderLight}`,
                        fontSize: '11px',
                        color: colors.textDark,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                    }}>
                        {block.language || 'code'}
                    </div>
                    <pre style={{
                        margin: 0,
                        padding: '16px',
                        overflow: 'auto',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        color: colors.textSecondary,
                    }}>
            <code>{block.content}</code>
          </pre>
                </div>
            );

        case 'quote':
            return (
                <blockquote style={{
                    margin: '32px 0',
                    padding: '16px 24px',
                    borderLeft: `2px solid ${colors.textDarkest}`,
                    color: colors.textSecondary,
                    fontStyle: 'italic',
                    fontSize: '15px',
                    lineHeight: 1.7,
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                }}>
                    {block.content}
                </blockquote>
            );

        case 'image':
            return (
                <figure style={{ margin: '32px 0' }}>
                    <img
                        src={block.url}
                        alt={block.alt || ''}
                        style={{
                            width: '100%',
                            height: 'auto',
                            border: `1px solid ${colors.borderLight}`,
                        }}
                    />
                    {block.alt && (
                        <figcaption style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: colors.textDark,
                            textAlign: 'center',
                        }}>
                            {block.alt}
                        </figcaption>
                    )}
                </figure>
            );

        case 'list':
            const items = block.items?.filter(item => item && item.trim() !== '') || [];
            if (items.length === 0) return null;
            return (
                <ul style={{
                    margin: '24px 0',
                    paddingLeft: '24px',
                    color: colors.textSecondary,
                    fontSize: '15px',
                    lineHeight: 1.8,
                }}>
                    {items.map((item, i) => (
                        <li key={i} style={{ marginBottom: '8px' }}>
                            <span style={{ color: colors.textDarker, marginRight: '8px' }}>→</span>
                            {item}
                        </li>
                    ))}
                </ul>
            );

        default:
            return null;
    }
}

export default function ArticlePage() {
    const { slug } = useParams();
    const { colors } = useTheme();
    const { language, t, getLocalized } = useLanguage();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadArticle = async () => {
            try {
                const { data } = await articlesApi.get(slug);
                if (isMounted) {
                    setArticle(data.article);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        loadArticle();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const formatDate = (dateString) => {
        const locale = language === 'fr' ? 'fr-FR' : 'en-US';
        return new Date(dateString).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (loading) return <Loading />;

    if (error || !article) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <h1 style={{ color: colors.accent, fontSize: '24px', fontWeight: 400 }}>
                    {t.articleNotFound}
                </h1>
                <p style={{ color: colors.textMuted, marginTop: '16px' }}>
                    {t.articleNotFoundDesc}
                </p>
                <Link
                    to="/articles"
                    style={{
                        display: 'inline-block',
                        marginTop: '24px',
                        color: colors.textSecondary,
                        textDecoration: 'none',
                    }}
                >
                    <span style={{ color: colors.textDarker }}>←</span> {t.backToArticles}
                </Link>
            </div>
        );
    }

    const title = getLocalized(article, 'title');

    return (
        <article>
            <header style={{ marginBottom: '48px' }}>
                <Link
                    to="/articles"
                    style={{
                        display: 'inline-block',
                        marginBottom: '32px',
                        color: colors.textDark,
                        textDecoration: 'none',
                        fontSize: '13px',
                    }}
                >
                    <span style={{ marginRight: '8px' }}>←</span>
                    {t.backToArticles}
                </Link>

                <h1 style={{
                    margin: 0,
                    fontSize: 'clamp(28px, 5vw, 36px)',
                    fontWeight: 400,
                    color: colors.accent,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.3,
                }}>
                    {title.value}
                    <TranslationBadge show={title.needsTranslation} />
                </h1>

                <div style={{
                    marginTop: '24px',
                    display: 'flex',
                    gap: '24px',
                    flexWrap: 'wrap',
                    fontSize: '13px',
                    color: colors.textDark,
                }}>
          <span>
            <span style={{ color: colors.textDarkest }}>{t.date}:</span>{' '}
              {formatDate(article.published_at || article.created_at)}
          </span>
                    <span>
            <span style={{ color: colors.textDarkest }}>{t.views}:</span> {article.views || 0}
          </span>
                </div>

                {article.tags?.length > 0 && (
                    <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                    }}>
                        {article.tags.map((tag, i) => (
                            <span
                                key={i}
                                style={{
                                    padding: '4px 12px',
                                    fontSize: '11px',
                                    color: colors.textMuted,
                                    border: `1px solid ${colors.borderLight}`,
                                }}
                            >
                #{tag}
              </span>
                        ))}
                    </div>
                )}
            </header>

            {article.cover_image && (
                <img
                    src={article.cover_image}
                    alt={title.value}
                    style={{
                        width: '100%',
                        height: 'auto',
                        marginBottom: '48px',
                        border: `1px solid ${colors.borderLight}`,
                    }}
                />
            )}

            <div style={{ marginBottom: '60px', overflow: 'hidden' }}>
                {(article[`content_${language}`]?.length
                    ? article[`content_${language}`]
                    : article[`content_${language === 'fr' ? 'en' : 'fr'}`] || []
                ).map((block, i) => (
                    <ContentBlock key={i} block={block} />
                ))}
            </div>

            <footer style={{
                paddingTop: '32px',
                borderTop: `1px solid ${colors.border}`,
            }}>
                <Link
                    to="/articles"
                    style={{
                        color: colors.textMuted,
                        textDecoration: 'none',
                        fontSize: '14px',
                    }}
                >
                    <span style={{ color: colors.textDarker }}>←</span> {t.viewAllArticles}
                </Link>
            </footer>
        </article>
    );
}