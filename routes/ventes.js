const express = require('express');
const router = express.Router();
const { getSupabaseForSession } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// --- Liste des ventes + formulaire d'ajout ---
router.get('/', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);
  const { data: ventes, error } = await supabase
    .from('ventes')
    .select('*')
    .order('date_vente', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) req.flash('error', 'Impossible de charger les ventes.');

  res.render('ventes', { title: 'Ventes', ventes: ventes || [] });
});

// --- Enregistrer une nouvelle vente ---
router.post('/', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);
  const { nom_vetement, prix_achat, prix_vente, quantite, date_vente } = req.body;

  if (!nom_vetement || !prix_achat || !prix_vente) {
    req.flash('error', 'Nom du vêtement, prix d\'achat et prix de vente sont obligatoires.');
    return res.redirect('/ventes');
  }

  const { error } = await supabase.from('ventes').insert({
    nom_vetement,
    prix_achat: Number(prix_achat),
    prix_vente: Number(prix_vente),
    quantite: Number(quantite) || 1,
    date_vente: date_vente || new Date().toISOString().slice(0, 10),
  });

  if (error) {
    req.flash('error', "Erreur lors de l'enregistrement de la vente.");
  } else {
    req.flash('success', 'Vente enregistrée avec succès.');
  }
  res.redirect('/ventes');
});

// --- Supprimer une vente ---
router.delete('/:id', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);
  const { error } = await supabase.from('ventes').delete().eq('id', req.params.id);

  if (error) req.flash('error', 'Suppression impossible.');
  else req.flash('success', 'Vente supprimée.');

  res.redirect('/ventes');
});

module.exports = router;
