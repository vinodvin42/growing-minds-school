// Smooth scroll to top on page load
window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

// Auto-play carousel
const carousel = document.getElementById('heroCarousel');
if (carousel) {
    const bsCarousel = new bootstrap.Carousel(carousel, {
        interval: 4000,
        ride: 'carousel'
    });
}

// Video play button
const videoBtn = document.querySelector('.btn-video-play');
if (videoBtn) {
    videoBtn.addEventListener('click', () => {
        alert('Video playback would open here. Please add your school tour video URL.');
    });
}