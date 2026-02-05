import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Loading } from '@components/ui';
import { articlesApi } from '@config/api';

export default function ArticlesListPage() {
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
          color: '#fff',
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
          border: '1px solid #1a1a1a',
          background: '#0d0d0d',
        }}>
          <p style={{ color: '#555', margin: 0 }}>Aucun article</p>
          <Link
            to="/admin/articles/new"
            style={{ color: '#888', fontSize: '14px' }}
          >
            Créer votre premier article
          </Link>
        </div>
      ) : (
        <div style={{
          border: '1px solid #1a1a1a',
          background: '#0d0d0d',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 100px 80px 120px',
            gap: '16px',
            padding: '12px 20px',
            borderBottom: '1px solid #1a1a1a',
            fontSize: '11px',
            color: '#555',
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
                borderBottom: '1px solid #1a1a1a',
                alignItems: 'center',
              }}
            >
              <Link
                to={`/admin/articles/${article.id}`}
                style={{
                  color: '#ccc',
                  textDecoration: 'none',
                  fontSize: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {article.title}
              </Link>
              
              <button
                onClick={() => handleTogglePublish(article)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  background: article.is_published ? '#1a2a1a' : '#2a2a1a',
                  color: article.is_published ? '#5a8a5a' : '#8a8a5a',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {article.is_published ? 'publié' : 'brouillon'}
              </button>
              
              <span style={{ color: '#555', fontSize: '12px' }}>
                {formatDate(article.created_at)}
              </span>
              
              <span style={{ color: '#555', fontSize: '12px' }}>
                {article.views || 0}
              </span>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to={`/admin/articles/${article.id}`}
                  style={{
                    color: '#666',
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
                    color: '#664444',
                    fontSize: '12px',
                    cursor: 'pointer',
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
