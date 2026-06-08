// ── Open Invitation Gate ──────────────────────────────────────
const openBtn = document.getElementById('open-invitation-btn');
const mainContent = document.getElementById('main-content');
const bgm = document.getElementById('bgm');
const heroGreeting = document.querySelector('.hero-greeting');

const setHeroGreeting = () => {
    const params = new URLSearchParams(window.location.search);
    const guestName = params.get('to');

    if (guestName && heroGreeting) {
        heroGreeting.textContent = `Dear ${decodeURIComponent(guestName.replace(/\+/g, ' '))}`;
        heroGreeting.style.display = 'block';
    }
};

setHeroGreeting();

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

        // Make sections full-screen snap points and attach animations
        const mainEl = document.getElementById('main-content');
        if (mainEl) {
            const sections = mainEl.querySelectorAll('section');
            sections.forEach(sec => {
                // Add baseline animation class used by CSS
                sec.classList.add('section-anim');

                // Add type hints for nicer per-section motion
                switch (sec.id) {
                    case 'quote': sec.classList.add('anim-fade'); break;
                    case 'couple': sec.classList.add('anim-slide-up'); break;
                    case 'countdown': sec.classList.add('anim-count'); break;
                    case 'location': sec.classList.add('anim-zoom'); break;
                    case 'gallery': sec.classList.add('anim-gallery'); break;
                    case 'tiktok': sec.classList.add('anim-video'); break;
                    case 'rsvp': sec.classList.add('anim-form'); break;
                    case 'wishes': sec.classList.add('anim-fade'); break;
                    case 'closing': sec.classList.add('anim-fade'); break;
                    default: sec.classList.add('anim-fade');
                }

                // Observe each section for entering/leaving viewport inside main-content
                sectionObserver.observe(sec);
            });
        }

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

// ── Section snap + entrance observer (for full-screen mobile sections) ──
const sectionObserverOptions = {
    root: document.getElementById('main-content') || null,
    rootMargin: '0px',
    threshold: 0.6
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            entry.target.classList.add('section-in');
        } else {
            entry.target.classList.remove('in-view');
            entry.target.classList.remove('section-in');
        }
    });
}, sectionObserverOptions);

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

// ── Event Grid Layout (no carousel) ──────────────────────────

// ── RSVP ─────────────────────────────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySMaALvwvbb3vwYtFTNMU9dRzZ-L9UUGjHScRDtGUorEqvTUQD54n_-1Mkg-uuGYmKQg/exec';

const wishesContainer = document.getElementById('wishes-container');

const loadWishes = async () => {
    if (!SCRIPT_URL) return;
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();

        if (data && data.length > 0) {
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

if (wishesContainer) loadWishes();

const rsvpForm = document.getElementById('rsvp-form');

const urlParams = new URLSearchParams(window.location.search);
const guestNameFromUrl = urlParams.get('to');
if (guestNameFromUrl) {
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.value = decodeURIComponent(guestNameFromUrl.replace(/\+/g, ' '));
}

if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;

        const name = document.getElementById('name').value;
        const attendance = document.querySelector('input[name="attendance"]:checked')?.value || 'Hadir';
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

// ── Gallery Modal (Lightbox) ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const galleryModal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    const closeModalBtn = document.querySelector('.close-modal');
    const galleryImages = document.querySelectorAll('.gallery-img');

    if (galleryModal && modalImg && closeModalBtn) {
        const galleryItems = Array.from(galleryImages);
    let activeGalleryIndex = 0;

        // Open modal on image click
        galleryItems.forEach((img, idx) => {
            img.addEventListener('click', function() {
                activeGalleryIndex = idx;
                galleryModal.style.display = 'flex';
                modalImg.src = this.src;
                // Use the alt text as the caption
                modalCaption.innerText = this.alt;
                // Prevent scrolling on body when modal is open
                document.body.style.overflow = 'hidden';
            });
        });

        const showGalleryImage = (idx) => {
            activeGalleryIndex = (idx + galleryItems.length) % galleryItems.length;
            const image = galleryItems[activeGalleryIndex];
            modalImg.src = image.src;
            modalCaption.innerText = image.alt;
        };

        const prevGalleryBtn = document.querySelector('.modal-prev');
        const nextGalleryBtn = document.querySelector('.modal-next');

        if (prevGalleryBtn) {
            prevGalleryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showGalleryImage(activeGalleryIndex - 1);
            });
        }

        if (nextGalleryBtn) {
            nextGalleryBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showGalleryImage(activeGalleryIndex + 1);
            });
        }

        // Close modal on close button click
        closeModalBtn.addEventListener('click', function() {
            galleryModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Close modal when clicking outside the image
        galleryModal.addEventListener('click', function(e) {
            if (e.target === galleryModal) {
                galleryModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && galleryModal.style.display === 'flex') {
                galleryModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});
