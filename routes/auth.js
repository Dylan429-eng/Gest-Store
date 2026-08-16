const express = require('express');
const router = express.Router();
const { supabasePublic } = require('../config/supabase');
const { redirectIfAuth } = require('../middleware/auth');

// --- Formulaire de connexion ---
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { title: 'Connexion' });
});

// --- Traitement de la connexion ---
router.post('/login', redirectIfAuth, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('error', 'Email et mot de passe requis.');
    return res.redirect('/login');
  }

  const { data, error } = await supabasePublic.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    req.flash('error', 'Identifiants incorrects. Réessaie.');
    return res.redirect('/login');
  }

  // On stocke les tokens en session pour les requêtes suivantes (RLS)
  req.session.access_token = data.session.access_token;
  req.session.refresh_token = data.session.refresh_token;
  req.session.userEmail = data.user.email;

  req.flash('success', 'Connexion réussie. Bon travail !');
  res.redirect('/');
});

// --- Déconnexion ---
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
