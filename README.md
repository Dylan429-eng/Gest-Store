# Gestion Boutique — App de suivi financier

Application de gestion pour boutique de vêtements : ventes (avec calcul automatique du bénéfice), dépenses journalières, capital de départ, historique hebdomadaire et courbe de performance.

**Stack** : Node.js + Express + EJS + Supabase (PostgreSQL + Auth) + Tailwind CSS + Font Awesome + Chart.js

## 1. Installer les dépendances

```bash
npm install
```

## 2. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) et crée un nouveau projet (gratuit).
2. Dans **Project Settings > API**, récupère :
   - `Project URL` → `SUPABASE_URL`
   - `anon public key` → `SUPABASE_ANON_KEY`
3. Dans **SQL Editor**, colle le contenu de `sql/schema.sql` et exécute-le. Ça crée les tables `ventes`, `depenses`, `capital` avec la sécurité (RLS) déjà configurée.
4. Dans **Authentication > Users**, clique sur **Add user** et crée le compte de l'admin (email + mot de passe). C'est ce compte que tu utiliseras pour te connecter à l'app.

## 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Ouvre `.env` et renseigne `SUPABASE_URL`, `SUPABASE_ANON_KEY`, et un `SESSION_SECRET` (une chaîne aléatoire longue).

## 4. Lancer l'application

```bash
npm start
```

Ou en mode développement (redémarrage auto) :

```bash
npm run dev
```

L'app tourne sur **http://localhost:3000**. Connecte-toi avec le compte admin créé à l'étape 2.

## Fonctionnalités

- **Ventes** : nom du vêtement, prix d'achat, prix de vente, quantité → bénéfice calculé automatiquement par la base de données.
- **Dépenses** : libellé + montant + date (nourriture, transport, loyer, etc.).
- **Capital** : capital de départ et apports complémentaires.
- **Tableau de bord** : chiffre d'affaires, bénéfice net, solde de caisse, tendance de la semaine, courbe de performance hebdomadaire.
- **Historique** : détail semaine par semaine avec indicateur hausse/baisse.
- Interface **responsive** (mobile, tablette, desktop) avec icônes **Font Awesome**.

## Structure du projet

```
gestion-boutique/
├── config/supabase.js       # Clients Supabase (public + par session)
├── middleware/auth.js       # Protection des routes
├── routes/                  # auth, dashboard, ventes, depenses, capital
├── utils/dateHelpers.js     # Agrégation par semaine ISO
├── views/                   # Pages EJS
├── public/css/style.css     # Styles custom (au-dessus de Tailwind)
├── sql/schema.sql           # Script de création des tables Supabase
└── server.js                 # Point d'entrée
```

## Prochaine étape : hébergement

Le projet est prêt à être déployé (Render, Railway, Fly.io, VPS...) une fois testé en local — on verra ça ensemble à la fin comme prévu.
