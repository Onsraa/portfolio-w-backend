import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import fs from 'fs';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenvConfig({ path: join(__dirname, '../../.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

function validatePassword(password) {
    if (password.length < 8) return 'Minimum 8 caractères';
    if (!/[a-z]/.test(password)) return 'Au moins une minuscule';
    if (!/[A-Z]/.test(password)) return 'Au moins une majuscule';
    if (!/[0-9]/.test(password)) return 'Au moins un chiffre';
    return null;
}

async function setup() {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║   Configuration initiale du Portfolio                    ║
╚══════════════════════════════════════════════════════════╝
  `);

    const { initDatabase } = await import('../config/database.js');
    const { User, Experience, Project, Skill, Settings } = await import('../models/index.js');
    const config = (await import('../config/index.js')).default;

    await initDatabase();
    console.log('✓ Base de données initialisée\n');

    if (User.adminExists()) {
        console.log('Un administrateur existe déjà.');
        const answer = await question('Créer un nouvel admin ? (o/n) ');
        if (answer.toLowerCase() !== 'o') {
            console.log('\nConfiguration terminée.');
            rl.close();
            process.exit(0);
        }
    }

    console.log('\nCréation du compte administrateur\n');

    let username = await question(`Nom d'utilisateur [${config.admin.username}]: `);
    username = username.trim() || config.admin.username;

    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username)) {
        console.log('Nom invalide (3-50 caractères: lettres, chiffres, - et _)');
        rl.close();
        process.exit(1);
    }

    let email = await question(`Email [${config.admin.email}]: `);
    email = email.trim() || config.admin.email;

    let password = await question('Mot de passe (8+ chars, maj, min, chiffre): ');
    let error = validatePassword(password);
    while (error) {
        console.log(`Erreur: ${error}`);
        password = await question('Mot de passe: ');
        error = validatePassword(password);
    }

    try {
        const user = User.create({ username, email, password, role: 'admin' });
        console.log(`\n✓ Administrateur créé: ${user.username}`);
    } catch (error) {
        if (error.message && error.message.includes('UNIQUE')) {
            console.log('\n⚠️  Cet utilisateur existe déjà');
        } else {
            throw error;
        }
    }

    // Initialiser les paramètres
    Settings.initDefaults();
    console.log('✓ Paramètres initialisés');

    // Demander si on veut importer les données de démo
    const importDemo = await question('\nImporter les données de démonstration ? (o/n) ');

    if (importDemo.toLowerCase() === 'o') {
        await importDemoData(Experience, Project, Skill);
    }

    const envPath = join(__dirname, '../../.env');
    if (!fs.existsSync(envPath)) {
        const jwtSecret = crypto.randomBytes(64).toString('hex');
        const envContent = `# Configuration Portfolio
PORT=3001
NODE_ENV=development

# JWT (requis en production)
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=24h

# Admin
ADMIN_USERNAME=${username}
ADMIN_EMAIL=${email}
# ADMIN_PASSWORD=VotreMotDePasseSecurise (requis en production)

# CORS
FRONTEND_URL=http://localhost:5173

# Base de données
DATABASE_PATH=./data/portfolio.db

# Upload (max 5MB)
UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate limiting
RATE_LIMIT_MAX=100
`;
        fs.writeFileSync(envPath, envContent, { mode: 0o600 });
        console.log('✓ Fichier .env créé');
    }

    console.log(`
╔══════════════════════════════════════════════════════════╗
║   Configuration terminée                                 ║
║                                                          ║
║   Démarrez: npm run dev                                  ║
║   Admin:    http://localhost:5173/admin                  ║
║   Username: ${username.padEnd(43)}║
╚══════════════════════════════════════════════════════════╝
  `);

    rl.close();
    process.exit(0);
}

async function importDemoData(Experience, Project, Skill) {
    console.log('\n📦 Import des données de démonstration...\n');

    // Expériences (multilingue)
    const experiences = [
        {
            period: '2025 — présent',
            company: 'UQAC',
            role_fr: 'Développeur Unity',
            role_en: 'Unity Developer',
            description_fr: 'Développement du jeu sérieux Cogni-Actif qui a pour but de simplifier l\'intégration d\'activité physique en milieu scolaire.',
            description_en: 'Development of the serious game Cogni-Actif, aimed at simplifying the integration of physical activity in schools.',
            tech: ['C#', 'Unity'],
            is_current: true,
            is_internship: false,
        },
        {
            period: '2023 — 2025',
            company: 'SNCF Réseau',
            role_fr: 'Apprenti Ingénieur Logiciel',
            role_en: 'Software Engineer Apprentice',
            description_fr: 'Développement d\'outils afin d\'accélérer la productivité des ingénieurs AutoCAD/BricsCAD. Mise en place d\'outils d\'analyses permettant d\'optimiser les dépenses.',
            description_en: 'Development of tools to accelerate productivity for AutoCAD/BricsCAD engineers. Implementation of analysis tools to optimize expenses.',
            tech: ['C#', 'VB (.NET)', 'Lisp (AutoLisp)', 'AutoCAD', 'BricsCAD', 'Python', 'Power Automate'],
            is_current: false,
            is_internship: false,
            is_apprenticeship: true,
        },
        {
            period: '2022 — 2023',
            company: 'Numérique Gagnant',
            role_fr: 'Apprenti Développeur',
            role_en: 'Developer Apprentice',
            description_fr: 'Développement d\'applications et d\'outils pour améliorer la productivité des entreprises collaboratrices.',
            description_en: 'Development of applications and tools to improve productivity for partner companies.',
            tech: ['PHP', 'NodeJS', 'MySQL', 'Powershell', 'VBA', 'Windev28', 'Power Automate'],
            is_current: false,
            is_internship: false,
            is_apprenticeship: true,
        },
    ];

    let expCount = 0;
    for (const exp of experiences) {
        try {
            Experience.create(exp);
            expCount++;
        } catch (err) {
            if (!err.message?.includes('UNIQUE')) throw err;
        }
    }
    console.log(`✓ ${expCount} expériences importées (${experiences.length - expCount} déjà existantes)`);

    // Projets (multilingue)
    const projects = [
        {
            project_id: '001',
            title_fr: 'Robozzle',
            title_en: 'Robozzle',
            description_fr: 'Reproduction du jeu Robozzle créé par Igor Ostrovsky sous forme d\'un test technique.',
            description_en: 'Reproduction of the Robozzle game created by Igor Ostrovsky as a technical test.',
            tech: ['Rust', 'Bevy'],
            year: '2025',
            link: 'https://github.com/Onsraa/robozzle',
        },
        {
            project_id: '002',
            title_fr: 'Simulateur de Vie de Particules',
            title_en: 'Particle Life Simulator',
            description_fr: 'Simulateur de particules de vie en 3D avec pour objectif de déterminer la meilleure population qui pourrait survivre.',
            description_en: '3D particle life simulator with the goal of determining the best population that could survive.',
            tech: ['Rust', 'Bevy', 'Algorithme génétique'],
            year: '2025',
            link: 'https://github.com/Onsraa/particle-life',
        },
        {
            project_id: '003',
            title_fr: 'Apprentissage Automatique',
            title_en: 'Machine Learning',
            description_fr: 'Projet permettant de tester différents algorithmes d\'apprentissage sur des cas d\'études simples.',
            description_en: 'Project to test different learning algorithms on simple case studies.',
            tech: ['Rust', 'Bevy'],
            year: '2025',
            link: 'https://github.com/Onsraa/machine-learning',
        },
    ];

    let projCount = 0;
    for (const proj of projects) {
        try {
            Project.create(proj);
            projCount++;
        } catch (err) {
            if (!err.message?.includes('UNIQUE')) throw err;
        }
    }
    console.log(`✓ ${projCount} projets importés (${projects.length - projCount} déjà existants)`);

    // Compétences
    const skills = {
        langages: ['Rust', 'C++', 'C#'],
        crates: ['bevy', 'tokio', 'thiserror'],
        softwares: ['Unity', 'AutoCAD', 'BricsCAD'],
    };

    for (const [category, names] of Object.entries(skills)) {
        Skill.replaceCategory(category, names);
    }
    console.log('✓ Compétences importées');
}

setup().catch(console.error);