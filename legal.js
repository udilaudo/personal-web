/**
 * legal.js — Script condiviso per privacy.html e cookies.html
 *
 * Contiene la logica comune a tutte le pagine legali:
 *   - Inizializzazione icone Lucide
 *   - Ripristino tema chiaro/scuro da localStorage
 *   - Toggle tema al click del bottone
 *   - Navbar: aggiunge ombra dopo 50px di scroll
 *   - Menu mobile (hamburger)
 *
 * Spostato qui dai blocchi <script> inline per consentire
 * una Content-Security-Policy senza 'unsafe-inline'.
 */

// Inizializza tutte le icone SVG di Lucide presenti nella pagina
lucide.createIcons();

// ── TEMA CHIARO / SCURO ──
// Legge la preferenza salvata (stessa chiave usata in script.js del sito principale)
// così il tema scelto dall'utente viene mantenuto tra tutte le pagine
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark');
}

// Toggle tema al click del bottone
document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ── NAVBAR: aggiunge ombra dopo 50px di scroll ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── MENU MOBILE (hamburger) ──
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

// Chiudi il menu quando si clicca un link nella nav mobile
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
    });
});
