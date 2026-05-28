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

    const getUrlParam = (key) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(key) || '';
    };

    const buildShareUrl = (guestName = '') => {
        const shareUrl = new URL(window.location.href);
        if (guestName) {
            shareUrl.searchParams.set('to', guestName);
        } else {
            shareUrl.searchParams.delete('to');
        }
        return shareUrl.toString();
    };

    const shareToWhatsapp = (guestName = '') => {
        const url = buildShareUrl(guestName);
        const text = `Undangan Pernikahan Robbi & Lugas\n\nBuka link undangan berikut:\n${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    // Share button click
    shareBtn.addEventListener('click', () => {
        const guestName = document.getElementById('name')?.value.trim() || getUrlParam('to');
        shareToWhatsapp(guestName);
    });

    const commentsPopup = videoSection.querySelector('.comments-popup');
    const closeCommentsBtn = videoSection.querySelector('.close-comments-btn');

    // Comment button click
    commentBtn.addEventListener('click', () => {
        commentsPopup.classList.add('show');
    });

    // Close comments popup
    closeCommentsBtn.addEventListener('click', () => {
        commentsPopup.classList.remove('show');
    });

    // Comment likes toggle
    const commentLikes = videoSection.querySelectorAll('.comment-like');
    commentLikes.forEach(like => {
        like.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const countSpan = this.querySelector('span');
            let countStr = countSpan.innerText;
            
            // Parse K to actual number for calculation
            let multiplier = 1;
            if (countStr.includes('K')) {
                multiplier = 1000;
                countStr = countStr.replace('K', '');
            }
            let count = parseFloat(countStr) * multiplier;

            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                count++;
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                count--;
            }
            countSpan.innerText = formatNumber(count);
        });
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
