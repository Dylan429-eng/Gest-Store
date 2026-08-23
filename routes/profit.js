const express = require('express');
const router = express.Router();
const { getSupabaseForSession } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

function getDayKey(dateStr) {
  return dateStr; // YYYY-MM-DD
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// --- Profit journalier ---
router.get('/', requireAuth, async (req, res) => {
  const supabase = getSupabaseForSession(req.session);

  const [{ data: ventes }, { data: depenses }] = await Promise.all([
    supabase.from('ventes').select('*').order('date_vente', { ascending: true }),
    supabase.from('depenses').select('*').order('date_depense', { ascending: true }),
  ]);

  const days = new Map();

  (ventes || []).forEach((v) => {
    const key = getDayKey(v.date_vente);
    if (!days.has(key)) {
      days.set(key, { date: key, label: formatDayLabel(key), ventesProfit: 0, depenses: 0, nbVentes: 0 });
    }
    const day = days.get(key);
    const qte = v.quantite || 1;
    day.ventesProfit += Number(v.benefice) * qte;
    day.nbVentes += qte;
  });

  (depenses || []).forEach((d) => {
    const key = getDayKey(d.date_depense);
    if (!days.has(key)) {
      days.set(key, { date: key, label: formatDayLabel(key), ventesProfit: 0, depenses: 0, nbVentes: 0 });
    }
    const day = days.get(key);
    day.depenses += Number(d.montant);
  });

  const dailyStats = Array.from(days.values())
    .map((d) => ({
      ...d,
      pnl: d.ventesProfit - d.depenses,
    }))
    .sort((a, b) => b.date.localeCompare(a.date)); // plus récent en premier

  const today = new Date().toISOString().slice(0, 10);
  const todayStats = dailyStats.find((d) => d.date === today) || null;

  res.render('profit-journalier', {
    title: 'Profit journalier',
    dailyStats,
    todayStats,
  });
});

module.exports = router;
