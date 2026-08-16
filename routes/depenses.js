const express = require('express');
const router = express.Router();
const { getSupabaseForSession } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// --- Liste des dépenses + formulaire d'ajout ---
router.get('/', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);
  const { data: depenses, error } = await supabase
    .from('depenses')
    .select('*')
    .order('date_depense', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) req.flash('error', 'Impossible de charger les dépenses.');

  res.render('depenses', { title: 'Dépenses', depenses: depenses || [] });
});

// --- Enregistrer une nouvelle dépense ---
router.post('/', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);
  const { libelle, montant, date_depense } = req.body;

  if (!libelle || !montant) {
    req.flash('error', 'Le libellé et le montant sont obligatoires.');
    return res.redirect('/depenses');
  }

  const { error } = await supabase.from('depenses').insert({
    libelle,
    montant: Number(montant),
    date_depense: date_depense || new Date().toISOString().slice(0, 10),
  });

  if (error) {
    req.flash('error', "Erreur lors de l'enregistrement de la dépense.");
  } else {
    req.flash('success', 'Dépense enregistrée.');
  }
  res.redirect('/depenses');
});

// --- Supprimer une dépense ---
router.delete('/:id', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);
  const { error } = await supabase.from('depenses').delete().eq('id', req.params.id);

  if (error) req.flash('error', 'Suppression impossible.');
  else req.flash('success', 'Dépense supprimée.');

  res.redirect('/depenses');
});

module.exports = router;
