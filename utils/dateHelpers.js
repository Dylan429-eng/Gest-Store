/**
 * Retourne le numéro de semaine ISO (1-53) et l'année ISO correspondante pour une date.
 */
function getISOWeekInfo(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Lundi = 1 ... Dimanche = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

/** Clé triable "2026-W33" utilisée pour regrouper/trier les semaines. */
function getWeekKey(dateStr) {
  const { year, week } = getISOWeekInfo(new Date(dateStr));
  return `${year}-S${String(week).padStart(2, '0')}`;
}

/** Renvoie le lundi et le dimanche d'une semaine ISO donnée "2026-S33". */
function getWeekRange(weekKey) {
  const [yearStr, weekStr] = weekKey.split('-S');
  const year = Number(yearStr);
  const week = Number(weekStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const fmt = (d) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  return `${fmt(monday)} - ${fmt(sunday)}`;
}

/**
 * Regroupe ventes + dépenses par semaine ISO et calcule le bénéfice net.
 * Retourne un tableau trié chronologiquement.
 */
function buildWeeklyStats(ventes, depenses) {
  const weeks = new Map();

  const ensureWeek = (key) => {
    if (!weeks.has(key)) {
      weeks.set(key, {
        key,
        label: getWeekRange(key),
        chiffreAffaires: 0,
        beneficeVentes: 0,
        totalDepenses: 0,
        nbVentes: 0,
      });
    }
    return weeks.get(key);
  };

  ventes.forEach((v) => {
    const key = getWeekKey(v.date_vente);
    const w = ensureWeek(key);
    const qte = v.quantite || 1;
    w.chiffreAffaires += Number(v.prix_vente) * qte;
    w.beneficeVentes += Number(v.benefice) * qte;
    w.nbVentes += qte;
  });

  depenses.forEach((d) => {
    const key = getWeekKey(d.date_depense);
    const w = ensureWeek(key);
    w.totalDepenses += Number(d.montant);
  });

  const result = Array.from(weeks.values())
    .map((w) => ({ ...w, beneficeNet: w.beneficeVentes - w.totalDepenses }))
    .sort((a, b) => a.key.localeCompare(b.key));

  // Ajoute la tendance par rapport à la semaine précédente
  result.forEach((w, i) => {
    if (i === 0) {
      w.tendance = 'stable';
    } else {
      const prev = result[i - 1].beneficeNet;
      w.tendance = w.beneficeNet > prev ? 'hausse' : w.beneficeNet < prev ? 'baisse' : 'stable';
    }
  });

  return result;
}

module.exports = { getWeekKey, getWeekRange, buildWeeklyStats };
