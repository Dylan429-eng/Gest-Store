-- ============================================================
-- Script à exécuter UNE FOIS dans Supabase > SQL Editor
-- Projet : Gestion Boutique de Vêtements
-- ============================================================

-- Extension nécessaire pour générer des UUID
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Table : capital
-- Enregistre le capital de départ et les éventuels apports
-- ------------------------------------------------------------
create table if not exists capital (
  id uuid primary key default gen_random_uuid(),
  montant numeric(12,2) not null check (montant >= 0),
  description text default 'Capital de départ',
  date_apport date not null default current_date,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Table : ventes
-- Chaque ligne = une vente d'un vêtement
-- benefice est calculé automatiquement par la base de données
-- ------------------------------------------------------------
create table if not exists ventes (
  id uuid primary key default gen_random_uuid(),
  nom_vetement text not null,
  prix_achat numeric(12,2) not null check (prix_achat >= 0),
  prix_vente numeric(12,2) not null check (prix_vente >= 0),
  benefice numeric(12,2) generated always as (prix_vente - prix_achat) stored,
  quantite integer not null default 1 check (quantite > 0),
  date_vente date not null default current_date,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Table : depenses
-- Dépenses journalières (nourriture, transport, loyer, etc.)
-- ------------------------------------------------------------
create table if not exists depenses (
  id uuid primary key default gen_random_uuid(),
  libelle text not null,
  montant numeric(12,2) not null check (montant >= 0),
  date_depense date not null default current_date,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Index utiles pour les requêtes par période (dashboard, historique)
-- ------------------------------------------------------------
create index if not exists idx_ventes_date on ventes (date_vente);
create index if not exists idx_depenses_date on depenses (date_depense);
create index if not exists idx_capital_date on capital (date_apport);

-- ------------------------------------------------------------
-- Sécurité (RLS) : seul un utilisateur authentifié (l'admin,
-- via Supabase Auth) peut lire/écrire. Comme il n'y a qu'un
-- seul rôle admin, on autorise tout utilisateur connecté.
-- ------------------------------------------------------------
alter table capital enable row level security;
alter table ventes enable row level security;
alter table depenses enable row level security;

create policy "admin_full_access_capital" on capital
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin_full_access_ventes" on ventes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin_full_access_depenses" on depenses
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Étape suivante : crée ton compte admin dans
-- Supabase > Authentication > Users > Add user
-- (c'est l'email/mot de passe que tu utiliseras pour te
-- connecter à l'application)
-- ============================================================
