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

    let isLiked = true;
    let isFav = true;
    let likes = 20;
    let favs = 26;

    // Helper to format numbers (e.g. 125000 -> 125K)
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Video play/pause state synchronization
    video.addEventListener('play', () => {
        videoSection.classList.remove('paused');
        playIcon.classList.remove('show');
    });

    video.addEventListener('playing', () => {
        videoSection.classList.remove('paused');
        playIcon.classList.remove('show');
    });

    video.addEventListener('pause', () => {
        // Only show pause overlay if the section is actively visible in viewport
        const rect = videoSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
            videoSection.classList.add('paused');
            playIcon.classList.add('show');
        }
    });

    // Handle single tap for play/pause and double tap for like
    let clickTimeout = null;
    let clickCount = 0;

    video.addEventListener('click', (e) => {
        clickCount++;
        if (clickCount === 1) {
            clickTimeout = setTimeout(() => {
                clickCount = 0;
                if (video.paused) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            }, 250);
        } else if (clickCount >= 2) {
            clearTimeout(clickTimeout);
            clickCount = 0;
            handleLike(true);
            showHeartAnimation(e.clientX, e.clientY);
        }
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

    const handleLike = (forceLike = false) => {
        if (!isLiked) {
            isLiked = true;
            likes++;
            likeBtn.classList.add('active');
            likeCount.textContent = formatNumber(likes);
        }
    };

    // Like button click
    likeBtn.addEventListener('click', handleLike);

    // Favorite button click
    favBtn.addEventListener('click', () => {
        if (!isFav) {
            isFav = true;
            favs++;
            favBtn.classList.add('active');
            favCount.textContent = formatNumber(favs);
        }
    });

    const getUrlParam = (key) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(key) || '';
    };

    const normalizeUrlPath = (urlObj) => {
        // Keep file:// URLs unchanged, because local file paths do not reliably resolve
        // folder URLs to index.html in all browsers.
        if (urlObj.protocol === 'file:') {
            return urlObj;
        }

        if (urlObj.pathname.endsWith('/index.html')) {
            urlObj.pathname = urlObj.pathname.slice(0, -'index.html'.length);
        }
        return urlObj;
    };

    const buildShareUrl = (guestName = '') => {
        const shareUrl = normalizeUrlPath(new URL(window.location.href));
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

    // Ensure clean initial state (never show pause icon until user explicitly pauses)
    videoSection.classList.remove('paused');
    playIcon.classList.remove('show');
});
