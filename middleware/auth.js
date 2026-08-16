/**
 * Bloque l'accès aux pages protégées si l'admin n'est pas connecté.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.access_token) {
    return next();
  }
  req.flash('error', 'Merci de te connecter pour accéder à cette page.');
  return res.redirect('/login');
}

/**
 * Empêche un admin déjà connecté de revoir la page de login.
 */
function redirectIfAuth(req, res, next) {
  if (req.session && req.session.access_token) {
    return res.redirect('/');
  }
  return next();
}

module.exports = { requireAuth, redirectIfAuth };
