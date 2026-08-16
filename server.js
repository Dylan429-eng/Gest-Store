require('dotenv').config();

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const venteRoutes = require('./routes/ventes');
const depenseRoutes = require('./routes/depenses');
const capitalRoutes = require('./routes/capital');

const app = express();

// --- Vues ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middlewares globaux ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); // permet les formulaires PUT/DELETE
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-a-changer',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 8, // 8h
      httpOnly: true,
    },
  })
);
app.use(flash());

// Rend les messages flash et l'état de connexion disponibles dans toutes les vues
app.use((req, res, next) => {
  res.locals.successMsg = req.flash('success');
  res.locals.errorMsg = req.flash('error');
  res.locals.isAuth = Boolean(req.session.access_token);
  res.locals.userEmail = req.session.userEmail || null;
  res.locals.currentPath = req.path;
  next();
});

// --- Routes ---
app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/ventes', venteRoutes);
app.use('/depenses', depenseRoutes);
app.use('/capital', capitalRoutes);

// --- 404 ---
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page introuvable' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Serveur lancé sur http://localhost:${PORT}`);
});
