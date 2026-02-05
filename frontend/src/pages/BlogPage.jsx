import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SectionHeader, Loading } from '@components/ui';
import { ArticleCard } from '@components/sections';
import { articlesApi } from '@config/api';
import { useTheme } from '@context/ThemeContext';
import { useLanguage } from '@context/LanguageContext';

export default function BlogPage() {
    const { loaded } = useOutletContext();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadArticles = async () => {
            try {
                const { data } = await articlesApi.list({ page: 1, limit: 20 });
                if (isMounted) {
                    setArticles(data.articles);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Erreur chargement articles:', err);
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadArticles();

        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) return <Loading />;

    return (
        <div style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease'
        }}>
            <SectionHeader
                title={t.articles}
                count={`${articles.length} ${t.entries}`}
            />

            {articles.length === 0 ? (
                <p style={{ color: colors.textMuted, marginTop: '24px' }}>
                    {t.noArticles}
                </p>
            ) : (
                <div>
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}
        </div>
    );
}