// ── Open Invitation Gate ──────────────────────────────────────
const openBtn = document.getElementById('open-invitation-btn');
const mainContent = document.getElementById('main-content');
const bgm = document.getElementById('bgm');

openBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Auto-play music (requires user gesture — this click satisfies it)
    bgm.play().catch(() => { });

    // Hide cover, reveal main content with smooth transition
    document.getElementById('cover').classList.add('cover-exit');
    setTimeout(() => {
        document.getElementById('cover').style.display = 'none';
        mainContent.classList.remove('hidden');
        mainContent.classList.add('content-enter');

        // Re-run scroll observer for newly visible elements
        document.querySelectorAll('.reveal').forEach((el) => {
            observer.observe(el);
        });

        // Trigger Instagram embed processing with retry mechanism
        const processEmbeds = () => {
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            } else {
                // If script not loaded yet, retry a few times
                let retries = 0;
                const interval = setInterval(() => {
                    if (window.instgrm && window.instgrm.Embeds) {
                        window.instgrm.Embeds.process();
                        clearInterval(interval);
                    }
                    if (++retries > 10) clearInterval(interval);
                }, 500);
            }
        };
        processEmbeds();

        // Scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
});

// ── Intersection Observer for scroll animations ───────────────
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.12
};

const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe only hero reveal on initial load
document.querySelectorAll('#cover .reveal').forEach((el) => {
    observer.observe(el);
});

// ── Countdown Timer ───────────────────────────────────────────
const targetDate = new Date("Aug 23, 2026 08:00:00").getTime();

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = '00';
        });
        return;
    }

    if (document.getElementById('days')) document.getElementById('days').innerText = Math.floor(distance / 86400000).toString().padStart(2, '0');
    if (document.getElementById('hours')) document.getElementById('hours').innerText = Math.floor((distance % 86400000) / 3600000).toString().padStart(2, '0');
    if (document.getElementById('minutes')) document.getElementById('minutes').innerText = Math.floor((distance % 3600000) / 60000).toString().padStart(2, '0');
    if (document.getElementById('seconds')) document.getElementById('seconds').innerText = Math.floor((distance % 60000) / 1000).toString().padStart(2, '0');
};

setInterval(updateCountdown, 1000);
updateCountdown();

// ── Event Carousel ───────────────────────────────────────────
(function () {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots   = document.querySelectorAll('.dot');
    const prev   = document.getElementById('evt-prev');
    const next   = document.getElementById('evt-next');
    let current  = 0;

    if (!slides.length) return;

    const goTo = (idx) => {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (idx + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    };

    prev.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));
    dots.forEach(dot => dot.addEventListener('click', () => goTo(+dot.dataset.idx)));
})();

// ── RSVP ─────────────────────────────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySMaALvwvbb3vwYtFTNMU9dRzZ-L9UUGjHScRDtGUorEqvTUQD54n_-1Mkg-uuGYmKQg/exec';

const wishesContainer = document.getElementById('wishes-container');
const wishesSection = document.getElementById('wishes-section');

const loadWishes = async () => {
    if (!SCRIPT_URL) return;
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();

        if (data && data.length > 0) {
            wishesSection.style.display = 'block';
            wishesContainer.innerHTML = '';

            data.reverse().forEach(wish => {
                const badgeClass = wish.Attendance === 'Hadir' ? 'hadir' : 'tidak-hadir';
                const wishEl = document.createElement('div');
                wishEl.className = 'wish-item';

                let displayDate = wish.Timestamp;
                try {
                    const d = new Date(wish.Timestamp);
                    if (!isNaN(d)) {
                        displayDate = d.toLocaleDateString('en-GB', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        });
                    }
                } catch (e) { }

                const attendanceLabel = wish.Attendance === 'Hadir' ? 'Attending' : 'Not Attending';
                wishEl.innerHTML = `
                    <h4>${wish.Name} <span class="badge ${badgeClass}">${attendanceLabel}</span></h4>
                    <span class="date">${displayDate}</span>
                    <p>${wish.Message}</p>
                `;
                wishesContainer.appendChild(wishEl);
            });
        }
    } catch (error) {
        console.error('Could not load wishes:', error);
    }
};

if (wishesContainer && wishesSection) loadWishes();

const rsvpForm = document.getElementById('rsvp-form');

if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;

        const name = document.getElementById('name').value;
        const attendance = document.getElementById('attendance').value;
        const message = document.getElementById('message').value;

        if (!message.trim()) {
            alert('Please write your wishes & prayer first.');
            return;
        }

        btn.innerText = 'Sending…';
        btn.disabled = true;

        const formData = new FormData();
        formData.append('Name', name);
        formData.append('Attendance', attendance);
        formData.append('Message', message);

        try {
            const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });

            if (response.ok) {
                btn.innerText = 'RSVP Sent! 🎉';
                btn.style.background = '#4CAF50';
                btn.style.color = '#fff';
                e.target.reset();
                loadWishes();

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Error:', error);
            btn.innerText = 'Failed to Send';
            btn.style.background = '#f44336';
            btn.style.color = '#fff';

            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = '';
                btn.style.color = '';
                btn.disabled = false;
            }, 3000);
        }
    });
}
