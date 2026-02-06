import { useState, useEffect } from 'react';
import { Button, Input, Loading } from '@components/ui';
import { skillsApi } from '@config/api';

export default function SkillsPage() {
  const [skills, setSkills] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSkills, setNewSkills] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const { data } = await skillsApi.list();
      setSkills(data.skills);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (category) => {
    try {
      const names = editValue.split(',').map(s => s.trim()).filter(Boolean);
      await skillsApi.replaceCategory(category, names);
      await loadSkills();
      setEditingCategory(null);
      setEditValue('');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory || !newSkills) return;
    try {
      const names = newSkills.split(',').map(s => s.trim()).filter(Boolean);
      await skillsApi.replaceCategory(newCategory, names);
      await loadSkills();
      setNewCategory('');
      setNewSkills('');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Supprimer la catégorie "${category}" ?`)) return;
    try {
      await skillsApi.replaceCategory(category, []);
      const newSkills = { ...skills };
      delete newSkills[category];
      setSkills(newSkills);
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setEditValue((skills[category] || []).join(', '));
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 style={{ margin: '0 0 32px 0', fontSize: '24px', fontWeight: 400, color: '#fff' }}>
        Compétences
      </h1>

      {/* Ajouter une catégorie */}
      <div style={{
        padding: '24px',
        marginBottom: '24px',
        background: '#0d0d0d',
        border: '1px solid #1a1a1a',
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 400, color: '#666' }}>
          Ajouter une catégorie
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: '12px', alignItems: 'end' }}>
          <Input
            label="Catégorie"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="langages"
          />
          <Input
            label="Compétences (séparées par virgules)"
            value={newSkills}
            onChange={(e) => setNewSkills(e.target.value)}
            placeholder="Rust, Python, JavaScript"
          />
          <Button onClick={handleAddCategory} style={{ marginBottom: '16px' }}>
            Ajouter
          </Button>
        </div>
      </div>

      {/* Liste des catégories */}
      <div style={{ border: '1px solid #1a1a1a', background: '#0d0d0d' }}>
        {Object.entries(skills).map(([category, items], index) => (
          <div
            key={category}
            style={{
              padding: '20px',
              borderBottom: index < Object.keys(skills).length - 1 ? '1px solid #1a1a1a' : 'none',
            }}
          >
            {editingCategory === category ? (
              <div>
                <Input
                  label={category}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="skill1, skill2, skill3"
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button onClick={() => handleSaveCategory(category)}>
                    Sauvegarder
                  </Button>
                  <Button onClick={() => { setEditingCategory(null); setEditValue(''); }}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 400,
                    color: '#555',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    {category}
                  </h3>
                  <p style={{ margin: '8px 0 0 0', color: '#888', fontSize: '14px' }}>
                    {items.join(', ')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => startEdit(category)}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    style={{ background: 'none', border: 'none', color: '#664444', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Suppr.
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
