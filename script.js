// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach((element) => {
    observer.observe(element);
});

// Countdown Timer Logic
// Set target date to 23 Aug 2026
const targetDate = new Date("Aug 23, 2026 08:00:00").getTime();

const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        document.getElementById("days").innerText = "00";
        document.getElementById("hours").innerText = "00";
        document.getElementById("minutes").innerText = "00";
        document.getElementById("seconds").innerText = "00";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days.toString().padStart(2, '0');
    document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
    document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
};

setInterval(updateCountdown, 1000);
updateCountdown(); // initial call

// Music Control
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('music-btn');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        bgm.pause();
        musicBtn.innerHTML = '🎵 Putar Musik';
    } else {
        bgm.play();
        musicBtn.innerHTML = '⏸ Jeda Musik';
    }
    isPlaying = !isPlaying;
});

// Handle RSVP Form Submission
const rsvpForm = document.getElementById('rsvp-form');
const wishesContainer = document.getElementById('wishes-container');
const wishesSection = document.getElementById('wishes-section');

// Load existing wishes from localStorage
const loadWishes = () => {
    const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
    if (wishes.length > 0) {
        wishesSection.style.display = 'block';
        wishesContainer.innerHTML = '';
        wishes.forEach(wish => {
            const badgeClass = wish.attendance === 'Hadir' ? 'hadir' : 'tidak-hadir';
            const wishEl = document.createElement('div');
            wishEl.className = 'wish-item';
            wishEl.innerHTML = `
                <h4>${wish.name} <span class="badge ${badgeClass}">${wish.attendance}</span></h4>
                <span class="date">${wish.date}</span>
                <p>${wish.message}</p>
            `;
            wishesContainer.appendChild(wishEl);
        });
    }
};

// Initialize wishes
if (wishesContainer && wishesSection) {
    loadWishes();
}

if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;

        const name = document.getElementById('name').value;
        const attendance = document.getElementById('attendance').value;
        const message = document.getElementById('message').value;

        if (!message.trim()) {
            alert("Silakan isi ucapan & doa terlebih dahulu.");
            return;
        }

        btn.innerText = "Mengirim...";
        btn.disabled = true;

        // Simulate network request and save
        setTimeout(() => {
            // Save to localStorage
            const wishes = JSON.parse(localStorage.getItem('wedding_wishes')) || [];
            const newWish = {
                name: name,
                attendance: attendance,
                message: message,
                date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            };

            wishes.unshift(newWish); // Add to beginning
            localStorage.setItem('wedding_wishes', JSON.stringify(wishes));

            // Reload UI
            loadWishes();

            btn.innerText = "RSVP Terkirim! 🎉";
            btn.style.background = "#4CAF50";
            btn.style.color = "#fff";
            e.target.reset();

            // Reset button style after 3 seconds
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "";
                btn.style.color = "";
                btn.disabled = false;
            }, 3000);
        }, 1000);
    });
}
