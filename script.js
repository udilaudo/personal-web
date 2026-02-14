/* ============================================================
   SCRIPT.JS — Tutta la logica interattiva del sito
   Qui gestiamo:
   1. Inizializzazione delle icone Lucide
   2. Effetto "typing" (testo che si digita da solo)
   3. Particelle animate sullo sfondo della hero
   4. Navbar: scroll, menu mobile, tema chiaro/scuro
   5. Animazioni allo scroll (AOS - Animate On Scroll)
   6. Barre delle competenze animate
   7. Bottone "torna su"
   8. Form di contatto (simulato)
   ============================================================ */

// Aspettiamo che tutto il DOM sia caricato prima di eseguire il codice
document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------
    // 1. INIZIALIZZA LE ICONE LUCIDE
    // Lucide è una libreria di icone SVG. Dopo aver messo
    // <i data-lucide="nome-icona"> nell'HTML, questa funzione
    // le trasforma in vere icone SVG.
    // ----------------------------------------------------------
    lucide.createIcons();

    // ----------------------------------------------------------
    // 2. EFFETTO TYPING — Il testo che "si scrive da solo"
    // ----------------------------------------------------------

    // Lista dei ruoli che verranno "digitati" uno dopo l'altro
    const roles = [
        'Data Scientist',
        'Theoretical Physicist',
    ];

    // Elemento del DOM dove apparirà il testo
    const typedElement = document.getElementById('typed-text');

    // Variabili per gestire lo stato della digitazione
    let roleIndex = 0;      // Quale ruolo stiamo mostrando
    let charIndex = 0;       // Quale carattere stiamo digitando
    let isDeleting = false;  // Stiamo cancellando o scrivendo?

    /**
     * Funzione che simula la digitazione di testo.
     * Scrive un ruolo lettera per lettera, aspetta, lo cancella,
     * e poi passa al ruolo successivo.
     */
    function typeText() {
        // Prendi il ruolo corrente dalla lista
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            // FASE CANCELLAZIONE: rimuovi un carattere alla volta
            charIndex--;
            typedElement.textContent = currentRole.substring(0, charIndex);
        } else {
            // FASE SCRITTURA: aggiungi un carattere alla volta
            charIndex++;
            typedElement.textContent = currentRole.substring(0, charIndex);
        }

        // Velocità della digitazione (in millisecondi)
        let speed = isDeleting ? 40 : 80;

        // Se abbiamo finito di scrivere il ruolo...
        if (!isDeleting && charIndex === currentRole.length) {
            // Aspetta 2 secondi prima di iniziare a cancellare
            speed = 2000;
            isDeleting = true;
        }

        // Se abbiamo finito di cancellare...
        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            // Passa al ruolo successivo (torna all'inizio se finiti)
            roleIndex = (roleIndex + 1) % roles.length;
            // Piccola pausa prima di iniziare il nuovo ruolo
            speed = 500;
        }

        // Richiama questa funzione dopo "speed" millisecondi
        setTimeout(typeText, speed);
    }

    // Avvia l'effetto typing
    typeText();

    // ----------------------------------------------------------
    // 3. PARTICELLE ANIMATE — Sfondo della Hero Section
    // Creiamo un canvas con particelle che si muovono e
    // si collegano tra loro con linee quando sono vicine.
    // ----------------------------------------------------------

    const canvas = document.getElementById('particles-canvas');
    // Il "contesto 2D" è ciò che ci permette di disegnare sul canvas
    const ctx = canvas.getContext('2d');

    // Array che conterrà tutte le nostre particelle
    let particles = [];

    /**
     * Ridimensiona il canvas per occupare tutta la hero section.
     * Viene chiamata anche quando la finestra cambia dimensione.
     */
    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    /**
     * Crea una singola particella con posizione e velocità casuali.
     * Ogni particella è un oggetto con:
     * - x, y: posizione
     * - vx, vy: velocità (direzione e rapidità del movimento)
     * - radius: dimensione del cerchio
     * - opacity: trasparenza
     */
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,  // Velocità casuale tra -0.25 e +0.25
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,     // Raggio tra 1 e 3 pixel
            opacity: Math.random() * 0.5 + 0.2 // Opacità tra 0.2 e 0.7
        };
    }

    /**
     * Inizializza le particelle.
     * Il numero di particelle dipende dalla dimensione dello schermo
     * (più lo schermo è grande, più particelle creiamo).
     */
    function initParticles() {
        particles = [];
        // Calcola il numero di particelle in base all'area dello schermo
        const count = Math.floor((canvas.width * canvas.height) / 15000);
        // Limita il numero tra 30 e 100
        const particleCount = Math.min(Math.max(count, 30), 100);
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }
    }

    /**
     * Disegna e anima le particelle.
     * Questa funzione viene chiamata circa 60 volte al secondo
     * grazie a requestAnimationFrame, creando un'animazione fluida.
     */
    function animateParticles() {
        // Pulisci il canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Determina il colore delle particelle in base al tema
        const isDark = document.body.classList.contains('dark');
        const particleColor = isDark ? '148, 163, 184' : '99, 102, 241';

        // Per ogni particella...
        particles.forEach((p, i) => {
            // Aggiorna la posizione in base alla velocità
            p.x += p.vx;
            p.y += p.vy;

            // Se la particella esce dal canvas, la facciamo rientrare dal lato opposto
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            // Disegna la particella come un cerchio
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
            ctx.fill();

            // Disegna linee tra particelle vicine
            particles.forEach((p2, j) => {
                // Evita di confrontare una particella con se stessa
                if (i >= j) return;

                // Calcola la distanza tra le due particelle
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Se sono abbastanza vicine (meno di 120px), traccia una linea
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    // La linea diventa più trasparente con la distanza
                    const opacity = (1 - dist / 120) * 0.15;
                    ctx.strokeStyle = `rgba(${particleColor}, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });

        // Richiedi il prossimo frame di animazione
        requestAnimationFrame(animateParticles);
    }

    // Inizializza e avvia le particelle
    resizeCanvas();
    initParticles();
    animateParticles();

    // Quando la finestra cambia dimensione, riadatta il canvas
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles(); // Ricrea le particelle per il nuovo spazio
    });

    // ----------------------------------------------------------
    // 4. NAVBAR — Effetti di scroll, menu mobile, tema
    // ----------------------------------------------------------

    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const backToTop = document.getElementById('back-to-top');

    /**
     * Gestisce gli effetti legati allo scroll della pagina:
     * - Aggiunge ombra alla navbar dopo un certo scroll
     * - Mostra/nasconde il bottone "torna su"
     */
    window.addEventListener('scroll', () => {
        // Se abbiamo scrollato più di 50px, aggiungi la classe "scrolled"
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Mostra il bottone "torna su" dopo 500px di scroll
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    /**
     * Menu hamburger per mobile:
     * Quando si clicca, alterna (toggle) la visibilità del menu.
     */
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    /**
     * Chiudi il menu mobile quando si clicca su un link.
     * Questo migliora l'esperienza utente: dopo aver scelto
     * una sezione, il menu si chiude automaticamente.
     */
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    /**
     * Bottone "torna su": scrolla dolcemente fino in cima alla pagina
     */
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ----------------------------------------------------------
    // TEMA CHIARO / SCURO
    // Salviamo la preferenza dell'utente nel localStorage
    // così al prossimo caricamento il tema scelto viene mantenuto.
    // ----------------------------------------------------------

    // Controlla se c'è un tema salvato nelle preferenze del browser
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }

    /**
     * Quando si clicca il bottone del tema, alterna tra chiaro e scuro
     */
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');

        // Salva la scelta nel localStorage
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // ----------------------------------------------------------
    // 5. ANIMAZIONI ALLO SCROLL (AOS - Animate On Scroll)
    // Quando un elemento con l'attributo "data-aos" diventa
    // visibile nel viewport, gli aggiungiamo la classe
    // "aos-animate" per attivare la sua animazione CSS.
    // ----------------------------------------------------------

    /**
     * IntersectionObserver è un'API del browser che ci avvisa
     * quando un elemento entra o esce dalla zona visibile.
     * È molto più efficiente del vecchio metodo basato sullo scroll.
     */
    const observerOptions = {
        threshold: 0.1,     // Attiva quando almeno il 10% dell'elemento è visibile
        rootMargin: '0px 0px -50px 0px'  // Margine in basso per attivare un po' prima
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // L'elemento è diventato visibile: aggiungi la classe di animazione
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);

    // Osserva tutti gli elementi che hanno l'attributo "data-aos"
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });

    // ----------------------------------------------------------
    // 7. SCROLL FLUIDO PER I LINK INTERNI
    // Quando si clicca un link che punta a un'ancora (#sezione),
    // scrolliamo dolcemente fino a quella sezione.
    // ----------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Previeni il comportamento default del link
            e.preventDefault();

            // Trova l'elemento target
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                // Calcola la posizione tenendo conto dell'altezza della navbar
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

                // Scrolla dolcemente fino alla posizione calcolata
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ----------------------------------------------------------
    // 8. FORM DI CONTATTO (SIMULATO)
    // Quando si invia il form, mostriamo un messaggio di conferma.
    // NOTA: Per un form reale, servirebbe un backend (es. Formspree,
    // Netlify Forms, o un server proprio).
    // ----------------------------------------------------------

    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    contactForm.addEventListener('submit', (e) => {
        // Previeni l'invio reale del form (non c'è un backend)
        e.preventDefault();

        // Mostra il messaggio di successo
        formSuccess.classList.remove('hidden');

        // Resetta il form (svuota tutti i campi)
        contactForm.reset();

        // Nascondi il messaggio dopo 5 secondi
        setTimeout(() => {
            formSuccess.classList.add('hidden');
        }, 5000);
    });

    // ----------------------------------------------------------
    // BONUS: EFFETTO PARALLASSE LEGGERO SUL HERO
    // Quando si scrolla, il contenuto della hero si muove
    // leggermente più lentamente dello sfondo, creando
    // un senso di profondità.
    // ----------------------------------------------------------
    window.addEventListener('scroll', () => {
        const hero = document.getElementById('hero');
        const heroContent = document.querySelector('.hero-content');

        // Applica l'effetto solo quando la hero è visibile
        if (window.scrollY < window.innerHeight) {
            // Muovi il contenuto verso l'alto a una velocità ridotta
            const offset = window.scrollY * 0.3;
            heroContent.style.transform = `translateY(${offset}px)`;
            // Riduci l'opacità man mano che si scrolla
            heroContent.style.opacity = 1 - (window.scrollY / window.innerHeight) * 0.8;
        }
    });

}); // Fine di DOMContentLoaded
