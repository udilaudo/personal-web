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
    // 3. PARTICELLE INTERATTIVE — Sfondo della Hero Section
    // Come le vecchie particelle, ma con interazione col mouse:
    //   - Le particelle vicine al cursore vengono attratte verso di esso
    //   - Si disegnano linee tra particelle vicine tra loro
    //   - Si disegnano linee tra le particelle e il cursore (quando vicino)
    // ----------------------------------------------------------

    const canvas = document.getElementById('particles-canvas');
    // Il "contesto 2D" è ciò che ci permette di disegnare sul canvas
    const ctx = canvas.getContext('2d');

    // Array che conterrà tutte le particelle
    let particles = [];

    // Posizione del mouse sul canvas (null = fuori dalla finestra)
    const mouse = { x: null, y: null };

    // Distanza entro cui il mouse attrae le particelle (in pixel)
    const MOUSE_RADIUS = 150;

    // Distanza entro cui due particelle si collegano con una linea
    const LINK_DIST = 120;

    /**
     * Ridimensiona il canvas per occupare tutta la hero section.
     * Viene chiamata anche quando la finestra cambia dimensione.
     */
    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }

    /**
     * Crea una singola particella con posizione, velocità e dimensione casuali.
     * Le particelle si muovono liberamente e rimbalzano da un lato all'altro.
     */
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.25,   // velocità base casuale
            vy: (Math.random() - 0.5) * 0.25,
            radius: Math.random() * 2 + 1,      // raggio tra 1 e 3 px
            opacity: Math.random() * 0.5 + 0.2, // opacità tra 0.2 e 0.7
        };
    }

    /**
     * Inizializza le particelle.
     * Il numero dipende dall'area del canvas, limitato tra 40 e 120.
     */
    function initParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 15000);
        const particleCount = Math.min(Math.max(count, 40), 120);
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }
    }

    /**
     * Loop principale dell'animazione — chiamata ~60 volte al secondo.
     *
     * Per ogni particella:
     *   1. Calcola se il mouse è vicino → applica attrazione
     *   2. Altrimenti, torna lentamente alla posizione originale (effetto elastico)
     *   3. Aggiorna la posizione con la velocità
     *   4. Disegna la particella
     *   5. Disegna linee verso particelle vicine e verso il mouse
     */
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Scegli il colore in base al tema chiaro/scuro
        const isDark = document.body.classList.contains('dark');
        const color = isDark ? '148, 163, 184' : '99, 102, 241';

        particles.forEach((p, i) => {

            // ---- INTERAZIONE CON IL MOUSE ----
            if (mouse.x !== null) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS && dist > 0) {
                    // Forza di attrazione proporzionale alla vicinanza
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS; // tra 0 e 1
                    p.vx += (dx / dist) * force * 0.6;
                    p.vy += (dy / dist) * force * 0.6;
                    // Attrito solo quando il mouse spinge, per non accumulare
                    // troppa velocità e far impazzire le particelle
                    p.vx *= 0.92;
                    p.vy *= 0.92;
                }
            }

            // Aggiorna la posizione con la velocità corrente
            p.x += p.vx;
            p.y += p.vy;

            // ---- WRAPPING AI BORDI ----
            // Se la particella esce dal canvas, rientra dal lato opposto
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            // ---- DISEGNA LA PARTICELLA ----
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
            ctx.fill();

            // ---- LINEE TRA PARTICELLE VICINE ----
            // Confronta questa particella con tutte le successive
            // (i >= j evita di disegnare la stessa linea due volte)
            particles.forEach((p2, j) => {
                if (i >= j) return;
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < LINK_DIST) {
                    // La linea diventa più trasparente con la distanza
                    const opacity = (1 - dist / LINK_DIST) * 0.2;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${color}, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });

            // ---- LINEE VERSO IL MOUSE ----
            // Se la particella è nel raggio del mouse, traccia una linea
            // verso il cursore (più luminosa di quelle tra particelle)
            if (mouse.x !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS) {
                    const opacity = (1 - dist / MOUSE_RADIUS) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(${color}, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animateParticles);
    }

    // ---- TRACCIA LA POSIZIONE DEL MOUSE SUL CANVAS ----
    // mousemove aggiorna le coordinate; mouseleave le resetta a null
    // così quando il mouse è fuori dalla hero non succede niente.
    canvas.addEventListener('mousemove', e => {
        // getBoundingClientRect() converte le coordinate finestra → canvas
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

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
