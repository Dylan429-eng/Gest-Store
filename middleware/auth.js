const { supabasePublic } = require('../config/supabase');

/**
 * D�code le JWT (sans v�rifier la signature, juste pour lire son expiration)
 * et indique s'il expire dans moins de 60 secondes.
 */
function isTokenExpiringSoon(accessToken) {
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString('utf8')
    );
    const expiresAtMs = payload.exp * 1000;
    return Date.now() > expiresAtMs - 60 * 1000;
  } catch {
    // Si on n'arrive pas � le d�coder, mieux vaut le rafra�chir par s�curit�
    return true;
  }
}

/**
 * Bloque l'acc�s aux pages prot�g�es si l'admin n'est pas connect�.
 * Rafra�chit aussi le token Supabase s'il est sur le point d'expirer
 * (le token d'acc�s Supabase expire apr�s ~1h, alors que la session
 * applicative dure 8h : sans ce rafra�chissement, toutes les requ�tes
 * Supabase �chouent silencieusement apr�s la premi�re heure).
 */
async function requireAuth(req, res, next) {
  if (!req.session || !req.session.access_token) {
    req.flash('error', 'Merci de te connecter pour acc�der � cette page.');
    return res.redirect('/login');
  }

  if (isTokenExpiringSoon(req.session.access_token)) {
    const { data, error } = await supabasePublic.auth.refreshSession({
      refresh_token: req.session.refresh_token,
    });

    if (error || !data.session) {
      return req.session.destroy(() => {
        res.redirect('/login');
      });
    }

    req.session.access_token = data.session.access_token;
    req.session.refresh_token = data.session.refresh_token;
  }

  return next();
}

/**
 * Emp�che un admin d�j� connect� de revoir la page de login.
 */
function redirectIfAuth(req, res, next) {
  if (req.session && req.session.access_token) {
    return res.redirect('/');
  }
  return next();
}

module.exports = { requireAuth, redirectIfAuth };