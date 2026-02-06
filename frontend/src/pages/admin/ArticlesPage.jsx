import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Loading } from '@components/ui';
import { articlesApi } from '@config/api';
import { useTheme } from '@context/ThemeContext';

export default function ArticlesListPage() {
  const { colors } = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async (page = 1) => {
    try {
      const { data } = await articlesApi.list({ page, limit: 20 });
      setArticles(data.articles);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;

    try {
      await articlesApi.delete(id);
      setArticles(articles.filter(a => a.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleTogglePublish = async (article) => {
    try {
      await articlesApi.publish(article.id, !article.is_published);
      setArticles(articles.map(a =>
        a.id === article.id ? { ...a, is_published: !a.is_published } : a
      ));
    } catch (err) {
      alert('Erreur lors de la modification');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
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
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: 400,
          color: colors.accent,
        }}>
          Articles
        </h1>
        <Link to="/admin/articles/new">
          <Button variant="primary">+ Nouvel article</Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          border: `1px solid ${colors.border}`,
          background: colors.bgSecondary,
        }}>
          <p style={{ color: colors.textDark, margin: 0 }}>Aucun article</p>
          <Link
            to="/admin/articles/new"
            style={{ color: colors.textSecondary, fontSize: '14px' }}
          >
            Créer votre premier article
          </Link>
        </div>
      ) : (
        <div style={{
          border: `1px solid ${colors.border}`,
          background: colors.bgSecondary,
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 100px 80px 120px',
            gap: '16px',
            padding: '12px 20px',
            borderBottom: `1px solid ${colors.border}`,
            fontSize: '11px',
            color: colors.textDark,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            <span>Titre</span>
            <span>Statut</span>
            <span>Date</span>
            <span>Vues</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          {articles.map((article) => (
            <div
              key={article.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 100px 80px 120px',
                gap: '16px',
                padding: '16px 20px',
                borderBottom: `1px solid ${colors.border}`,
                alignItems: 'center',
              }}
            >
              <Link
                to={`/admin/articles/${article.id}/edit`}
                style={{
                  color: colors.text,
                  textDecoration: 'none',
                  fontSize: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {article.title_fr || article.title_en || 'Sans titre'}
              </Link>

              <button
                onClick={() => handleTogglePublish(article)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  background: colors.bgHover,
                  color: article.is_published ? '#5a8a5a' : colors.textMuted,
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {article.is_published ? 'publié' : 'brouillon'}
              </button>

              <span style={{ color: colors.textDark, fontSize: '12px' }}>
                {formatDate(article.created_at)}
              </span>

              <span style={{ color: colors.textDark, fontSize: '12px' }}>
                {article.views || 0}
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to={`/admin/articles/${article.id}/edit`}
                  style={{
                    color: colors.textMuted,
                    fontSize: '12px',
                    textDecoration: 'none',
                  }}
                >
                  Éditer
                </Link>
                <button
                  onClick={() => handleDelete(article.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#aa4444',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Suppr.
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
