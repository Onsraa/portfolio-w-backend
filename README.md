# Portfolio Terminal

Portfolio de développeur minimaliste inspiré d'un terminal Unix.

## 🚀 Déploiement rapide

### Prérequis
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)
- Compte [GitHub](https://github.com/)
- Compte [Vercel](https://vercel.com/) (gratuit)

---

## 📋 Guide complet de déploiement

### Étape 1 : Personnaliser le contenu

Ouvrir `src/App.jsx` et modifier :

```javascript
const config = {
  name: "Ton Nom",
  title: "Ton Titre",
  description: "Ta description...",
  links: {
    github: "https://github.com/tonpseudo",
    linkedin: "https://linkedin.com/in/tonpseudo",
    email: "mailto:ton@email.com",
    cv: "/cv.pdf"  // Mettre le fichier dans /public
  }
};

const experiences = [ /* Tes expériences */ ];
const projects = [ /* Tes projets */ ];
const skills = { /* Tes compétences */ };
```

### Étape 2 : Tester localement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:5173
```

### Étape 3 : Créer le repo GitHub

1. Aller sur [github.com/new](https://github.com/new)
2. Nom du repository : `portfolio` (ou ce que tu veux)
3. Laisser en **Public** 
4. Ne pas cocher "Initialize with README"
5. Cliquer **Create repository**

```bash
# Dans le dossier du projet
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TONPSEUDO/portfolio.git
git push -u origin main
```

### Étape 4 : Déployer sur Vercel

1. Aller sur [vercel.com](https://vercel.com/) et se connecter avec GitHub
2. Cliquer **Add New** → **Project**
3. Sélectionner ton repo `portfolio`
4. Vercel détecte automatiquement Vite — laisser les paramètres par défaut
5. Cliquer **Deploy**

✅ Ton site est en ligne sur `https://portfolio-xxx.vercel.app`

### Étape 5 : Configurer le domaine personnalisé

#### Option A : Domaine gratuit Vercel
Tu as déjà une URL comme `portfolio.vercel.app`. C'est gratuit !

#### Option B : Acheter un domaine (~10€/an)

**Registrars recommandés :**
- [Porkbun](https://porkbun.com) — ~9€/an pour un .dev, interface simple
- [Namecheap](https://namecheap.com) — ~6€ la 1ère année pour un .com
- [Cloudflare](https://cloudflare.com/products/registrar) — Prix coûtant, ~9€/an

**Extensions recommandées pour un dev :**
- `.dev` — professionnel, HTTPS forcé (~12€/an)
- `.io` — populaire tech (~35€/an)
- `.com` — classique (~10€/an)
- `.fr` — si tu vises la France (~8€/an)

**Configurer le domaine sur Vercel :**

1. Dans Vercel, aller dans **Settings** → **Domains**
2. Ajouter ton domaine (ex: `alexdurand.dev`)
3. Vercel te donne les DNS à configurer :
   - Type `A` → `76.76.21.21`
   - Type `CNAME` pour `www` → `cname.vercel-dns.com`
4. Aller dans ton registrar et ajouter ces enregistrements DNS
5. Attendre 5-30 minutes (propagation DNS)

✅ Ton site est maintenant sur `https://tondomaine.dev`

---

## 🔄 Déploiement automatique

Chaque `git push` déclenche automatiquement un nouveau déploiement :

```bash
# Modifier quelque chose
git add .
git commit -m "Update projects"
git push

# → Vercel rebuild et déploie en ~30 secondes
```

---

## 💰 Coûts

| Service | Coût |
|---------|------|
| Vercel Hobby | **Gratuit** (100GB bandwidth/mois) |
| Domaine .dev | ~12€/an |
| Domaine .com | ~10€/an |
| GitHub | **Gratuit** |

**Total : 0€ à 12€/an**

---

## 📁 Structure du projet

```
portfolio/
├── public/
│   ├── favicon.svg      # Icône du site
│   └── cv.pdf           # Ton CV (optionnel)
├── src/
│   ├── App.jsx          # Composant principal (à personnaliser)
│   ├── main.jsx         # Point d'entrée
│   └── index.css        # Styles globaux
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🛠 Commandes

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Prévisualiser le build
```

---

## 📝 License

MIT — Utilise ce template comme tu veux.
