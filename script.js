// ── Open Invitation Gate ──────────────────────────────────────
const openBtn = document.getElementById('open-invitation-btn');
const mainContent = document.getElementById('main-content');
const bgm = document.getElementById('bgm');
const heroGreeting = document.querySelector('.hero-greeting');

const setHeroGreeting = () => {
    const params = new URLSearchParams(window.location.search);
    const guestName = params.get('to');
    const guestDisplay = document.getElementById('guest-name-display');

    if (guestName) {
        const decoded = decodeURIComponent(guestName.replace(/\+/g, ' '));
        if (guestDisplay) guestDisplay.textContent = decoded;
        if (heroGreeting) {
            heroGreeting.textContent = `Dear ${decoded}`;
            heroGreeting.style.display = 'block';
        }
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
                    case 'gift': sec.classList.add('anim-gift'); break;
                    case 'closing': sec.classList.add('anim-closing'); break;
                    default: sec.classList.add('anim-fade');
                }

                // Observe each section for entering/leaving viewport inside main-content
                sectionObserver.observe(sec);
            });

            // Trigger animation on first section immediately
            const firstSec = mainEl.querySelector('section');
            if (firstSec) {
                firstSec.classList.add('in-view', 'section-in');
            }
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
        setTimeout(refreshLeafletMap, 300);

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
    threshold: 0.25
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            entry.target.classList.add('section-in');
            if (entry.target.id === 'location') {
                refreshLeafletMap();
            }
            if (entry.target.id === 'tiktok') {
                const tiktokVideo = entry.target.querySelector('video');
                const playIcon = entry.target.querySelector('.play-icon');
                if (playIcon) playIcon.classList.remove('show');
                if (tiktokVideo) {
                    tiktokVideo.play().catch(() => {});
                }
            }
        } else {
            entry.target.classList.remove('in-view');
            entry.target.classList.remove('section-in');
            if (entry.target.id === 'location' && leafletMap) {
                leafletMap.setView([VENUE_LAT, VENUE_LNG], FAR_ZOOM, { animate: false });
                if (venueMarker) venueMarker.closePopup();
            }
            if (entry.target.id === 'tiktok') {
                const tiktokVideo = entry.target.querySelector('video');
                const playIcon = entry.target.querySelector('.play-icon');
                if (playIcon) playIcon.classList.remove('show');
                if (tiktokVideo) {
                    tiktokVideo.pause();
                }
            }
        }
    });
}, sectionObserverOptions);

// ── Countdown Timer ───────────────────────────────────────────
const targetDate = new Date("Dec 20, 2026 08:00:00").getTime();
const RING_CIRCUMFERENCE = 2 * Math.PI * 36; // ~226.2

const updateRing = (selector, value, max) => {
    const ring = document.querySelector(selector);
    if (!ring) return;
    const progress = Math.min(value / max, 1);
    ring.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
};

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        ['days', 'hours', 'minutes', 'seconds'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = '00';
        });
        updateRing('.ring-days', 0, 365);
        updateRing('.ring-hours', 0, 24);
        updateRing('.ring-mins', 0, 60);
        updateRing('.ring-secs', 0, 60);
        return;
    }

    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    if (document.getElementById('days')) document.getElementById('days').innerText = days.toString().padStart(2, '0');
    if (document.getElementById('hours')) document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    if (document.getElementById('minutes')) document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    if (document.getElementById('seconds')) document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');

    // Animate rings
    updateRing('.ring-days', days, 365);
    updateRing('.ring-hours', hours, 24);
    updateRing('.ring-mins', minutes, 60);
    updateRing('.ring-secs', seconds, 60);
};

setInterval(updateCountdown, 1000);
updateCountdown();

// ── Event Grid Layout (no carousel) ──────────────────────────

// ── RSVP ─────────────────────────────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySMaALvwvbb3vwYtFTNMU9dRzZ-L9UUGjHScRDtGUorEqvTUQD54n_-1Mkg-uuGYmKQg/exec';

const wishesContainer = document.getElementById('wishes-container');

const loadWishes = async () => {
    if (!SCRIPT_URL || !wishesContainer) return;
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
        const originalHtml = btn.innerHTML;

        const name = document.getElementById('name').value;
        const attendance = document.querySelector('input[name="attendance"]:checked')?.value || 'Hadir';
        const message = document.getElementById('message').value;

        if (!message.trim()) {
            alert('Please write your wishes and blessings first.');
            return;
        }

        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>Sending...</span>';
        btn.disabled = true;

        const formData = new FormData();
        formData.append('Name', name);
        formData.append('Attendance', attendance);
        formData.append('Message', message);

        try {
            const response = await fetch(SCRIPT_URL, { method: 'POST', body: formData });

            if (response.ok) {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Sent! Thank you</span>';
                btn.style.background = '#2e7d32';
                btn.style.color = '#fff';
                e.target.reset();
                if (guestNameFromUrl) {
                    const nameInput = document.getElementById('name');
                    if (nameInput) nameInput.value = decodeURIComponent(guestNameFromUrl.replace(/\+/g, ' '));
                }
                loadWishes();

                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Error:', error);
            btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> <span>Failed to send</span>';
            btn.style.background = '#c62828';
            btn.style.color = '#fff';

            setTimeout(() => {
                btn.innerHTML = originalHtml;
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

// ── Copy to Clipboard ─────────────────────────────────────────
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (btn) {
        const targetId = btn.getAttribute('data-target');
        const textEl = document.getElementById(targetId);
        if (textEl) {
            const textToCopy = textEl.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = btn.innerHTML;
                if (btn.classList.contains('copy-btn-atm')) {
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    btn.style.background = '#4CAF50';
                    btn.style.borderColor = '#4CAF50';
                    btn.style.color = '#fff';
                } else {
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    btn.style.background = '#4CAF50';
                    btn.style.color = '#fff';
                }
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    }
});

// ── Leaflet Map Setup with Cinematic Zoom-In Animation ────────
let leafletMap = null;
let venueMarker = null;
const VENUE_LAT = -7.7439298;
const VENUE_LNG = 111.4240352;
const FAR_ZOOM = 14;    // Start closer (subdistrict/village surroundings instead of regional view)
const CLOSE_ZOOM = 16;  // Close-up street view of the venue

const initLeafletMap = () => {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined' || leafletMap) return;

    leafletMap = L.map('map', {
        center: [VENUE_LAT, VENUE_LNG],
        zoom: FAR_ZOOM,
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false
    });

    if (leafletMap.dragging) leafletMap.dragging.disable();
    if (leafletMap.touchZoom) leafletMap.touchZoom.disable();
    if (leafletMap.doubleClickZoom) leafletMap.doubleClickZoom.disable();
    if (leafletMap.boxZoom) leafletMap.boxZoom.disable();
    if (leafletMap.keyboard) leafletMap.keyboard.disable();

    // Native Esri Dark Gray Base
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        className: 'esri-dark-base',
        maxNativeZoom: 16,
        maxZoom: 18
    }).addTo(leafletMap);

    // Labels & Street Names (bright and crisp)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        className: 'esri-dark-labels',
        maxNativeZoom: 16,
        maxZoom: 18
    }).addTo(leafletMap);

    // Custom Glowing Pin Marker
    const customIcon = L.divIcon({
        className: 'custom-map-pin-wrap',
        html: `
            <div class="custom-map-pin">
                <div class="pin-pulse"></div>
                <div class="pin-icon"><i class="fas fa-map-marker-alt"></i></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 36],
        popupAnchor: [0, -36]
    });

    const popupContent = `
        <div class="map-popup-card">
            <h4>Toko Lugas</h4>
            <p>Ds. Nguri Rt.02 Rw.04 Kec. Lembeyan Kab. Magetan</p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${VENUE_LAT},${VENUE_LNG}" target="_blank" rel="noopener noreferrer" class="btn btn-gold map-nav-btn">
                <i class="fas fa-location-arrow"></i> Petunjuk Arah
            </a>
        </div>
    `;

    venueMarker = L.marker([VENUE_LAT, VENUE_LNG], { icon: customIcon }).addTo(leafletMap);
    venueMarker.bindPopup(popupContent);

    setTimeout(() => {
        if (leafletMap) leafletMap.invalidateSize();
    }, 300);
};

let mapFlyTimeout = null;
const playLocationZoomIn = () => {
    if (!leafletMap) {
        initLeafletMap();
    }
    if (!leafletMap) return;

    clearTimeout(mapFlyTimeout);
    mapFlyTimeout = setTimeout(() => {
        leafletMap.invalidateSize();
        // Start from nearby neighborhood overview
        leafletMap.setView([VENUE_LAT, VENUE_LNG], FAR_ZOOM, { animate: false });
        if (venueMarker) venueMarker.closePopup();

        // Faster, fluid zoom in (flyTo) - 1.0s duration
        setTimeout(() => {
            if (!leafletMap) return;
            leafletMap.flyTo([VENUE_LAT, VENUE_LNG], CLOSE_ZOOM, {
                duration: 1.0,
                easeLinearity: 0.25
            });
        }, 50);
    }, 60);
};

const refreshLeafletMap = () => {
    playLocationZoomIn();
};

window.addEventListener('resize', () => {
    if (leafletMap) leafletMap.invalidateSize();
});
