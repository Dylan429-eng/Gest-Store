const express = require('express');
const router = express.Router();
const { getSupabaseForSession } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { buildWeeklyStats } = require('../utils/dateHelpers');

// --- Dashboard principal ---
router.get('/', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);

  const [{ data: ventes, error: errVentes }, { data: depenses, error: errDepenses }, { data: capitalRows, error: errCapital }] =
    await Promise.all([
      supabase.from('ventes').select('*').order('date_vente', { ascending: false }),
      supabase.from('depenses').select('*').order('date_depense', { ascending: false }),
      supabase.from('capital').select('*').order('date_apport', { ascending: false }),
    ]);

  if (errVentes || errDepenses || errCapital) {
    req.flash('error', "Erreur de chargement des données depuis Supabase.");
    return res.render('dashboard', {
      title: 'Tableau de bord',
      stats: null,
      weeklyStats: [],
      recentVentes: [],
      recentDepenses: [],
    });
  }

  const totalCapital = (capitalRows || []).reduce((s, c) => s + Number(c.montant), 0);
  const totalCA = (ventes || []).reduce((s, v) => s + Number(v.prix_vente) * (v.quantite || 1), 0);
  const totalBeneficeVentes = (ventes || []).reduce((s, v) => s + Number(v.benefice) * (v.quantite || 1), 0);
  const totalDepenses = (depenses || []).reduce((s, d) => s + Number(d.montant), 0);
  const beneficeNet = totalBeneficeVentes - totalDepenses;
  const soldeCaisse = totalCapital + beneficeNet;

  const weeklyStats = buildWeeklyStats(ventes || [], depenses || []);
  const semaineActuelle = weeklyStats[weeklyStats.length - 1] || null;
  const semainePrecedente = weeklyStats[weeklyStats.length - 2] || null;

  const stats = {
    totalCapital,
    totalCA,
    totalBeneficeVentes,
    totalDepenses,
    beneficeNet,
    soldeCaisse,
    nbVentes: (ventes || []).reduce((s, v) => s + (v.quantite || 1), 0),
    semaineActuelle,
    semainePrecedente,
  };

  res.render('dashboard', {
    title: 'Tableau de bord',
    stats,
    weeklyStats,
    recentVentes: (ventes || []).slice(0, 5),
    recentDepenses: (depenses || []).slice(0, 5),
  });
});

// --- Historique hebdomadaire détaillé ---
router.get('/historique', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);

  const [{ data: ventes }, { data: depenses }] = await Promise.all([
    supabase.from('ventes').select('*'),
    supabase.from('depenses').select('*'),
  ]);

  const weeklyStats = buildWeeklyStats(ventes || [], depenses || []).reverse(); // plus récent en premier

  res.render('historique', {
    title: 'Historique hebdomadaire',
    weeklyStats,
  });
});

module.exports = router;
