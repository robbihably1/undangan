// script2.js - TikTok Layout Interactions

document.addEventListener('DOMContentLoaded', () => {
    const videoSection = document.querySelector('.video-section');
    if (!videoSection) return;

    const video = videoSection.querySelector('.tiktok-video');
    const playIcon = videoSection.querySelector('.play-icon');
    const likeBtn = videoSection.querySelector('.like-btn');
    const favBtn = videoSection.querySelector('.fav-btn');
    const shareBtn = videoSection.querySelector('.share-btn');
    const commentBtn = videoSection.querySelector('.comment-btn');
    const followBtn = videoSection.querySelector('.follow-btn');
    const likeCount = likeBtn.querySelector('.count');
    const favCount = favBtn.querySelector('.count');

    let isLiked = false;
    let isFav = false;
    let likes = 125000;
    let favs = 10000;

    // Helper to format numbers (e.g. 125000 -> 125K)
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Play/Pause video on click
    video.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            videoSection.classList.remove('paused');
            playIcon.classList.remove('show');
        } else {
            video.pause();
            videoSection.classList.add('paused');
            playIcon.classList.add('show');
        }
    });

    // Double click to like
    let lastClickTime = 0;
    video.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;

        if (timeDiff < 300 && timeDiff > 0) {
            // Double click detected
            handleLike();
            showHeartAnimation(e.clientX, e.clientY);
            
            // Prevent play/pause toggle on double click by forcing play if it was paused by the first click
            if (video.paused) {
                video.play();
                videoSection.classList.remove('paused');
                playIcon.classList.remove('show');
            }
        }
        lastClickTime = currentTime;
    });

    const showHeartAnimation = (x, y) => {
        const heart = document.createElement('i');
        heart.className = 'fas fa-heart heart-animation';
        
        // Get video section coordinates to position the heart relatively
        const rect = videoSection.getBoundingClientRect();
        const relX = x - rect.left;
        const relY = y - rect.top;
        
        heart.style.left = `${relX}px`;
        heart.style.top = `${relY}px`;
        
        videoSection.appendChild(heart);
        
        // Remove element after animation
        setTimeout(() => {
            heart.remove();
        }, 1000);
    };

    const handleLike = () => {
        if (!isLiked) {
            isLiked = true;
            likes++;
            likeBtn.classList.add('active');
        } else {
            isLiked = false;
            likes--;
            likeBtn.classList.remove('active');
        }
        likeCount.textContent = formatNumber(likes);
    };

    // Like button click
    likeBtn.addEventListener('click', handleLike);

    // Favorite button click
    favBtn.addEventListener('click', () => {
        if (!isFav) {
            isFav = true;
            favs++;
            favBtn.classList.add('active');
        } else {
            isFav = false;
            favs--;
            favBtn.classList.remove('active');
        }
        favCount.textContent = formatNumber(favs);
    });

    // Share button click
    shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'The Wedding of Robbi & Lugas',
                text: 'Check out this awesome invitation video!',
                url: window.location.href,
            }).catch(console.error);
        } else {
            // Fallback for browsers that don't support Web Share API
            alert('Share link copied to clipboard!');
            navigator.clipboard.writeText(window.location.href).catch(console.error);
        }
    });

    // Comment button click (dummy)
    commentBtn.addEventListener('click', () => {
        alert('Comment section opening...');
    });

    // Follow button click
    if (followBtn) {
        followBtn.addEventListener('click', function() {
            this.style.display = 'none'; // Disappear on click like TikTok
        });
    }

    // Initialize state
    if (video.paused) {
        videoSection.classList.add('paused');
        playIcon.classList.add('show');
    }
});
