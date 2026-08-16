const express = require('express');
const router = express.Router();
const { getSupabaseForSession } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// --- Liste des apports de capital + formulaire d'ajout ---
router.get('/', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);
  const { data: capital, error } = await supabase
    .from('capital')
    .select('*')
    .order('date_apport', { ascending: false });

  if (error) req.flash('error', 'Impossible de charger le capital.');

  const total = (capital || []).reduce((s, c) => s + Number(c.montant), 0);

  res.render('capital', { title: 'Capital', capital: capital || [], total });
});

// --- Ajouter un capital / apport ---
router.post('/', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);
  const { montant, description, date_apport } = req.body;

  if (!montant) {
    req.flash('error', 'Le montant est obligatoire.');
    return res.redirect('/capital');
  }

  const { error } = await supabase.from('capital').insert({
    montant: Number(montant),
    description: description || 'Capital de départ',
    date_apport: date_apport || new Date().toISOString().slice(0, 10),
  });

  if (error) {
    req.flash('error', "Erreur lors de l'enregistrement du capital.");
  } else {
    req.flash('success', 'Capital enregistré.');
  }
  res.redirect('/capital');
});

module.exports = router;
