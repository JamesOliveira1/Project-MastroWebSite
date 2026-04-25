document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize AOS
    if(typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50,
            easing: 'ease-out-cubic'
        });
    }

    // Load Footer
    fetch('../assets/page/site_footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));

    // Carousel Logic
    const track = document.getElementById('track');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if(track && prevBtn && nextBtn) {
        let cardWidth = track.querySelector('.insta-card').offsetWidth + 20; // 20px gap
        let maxScroll = track.scrollWidth - track.parentElement.clientWidth;
        let currentScroll = 0;

        window.addEventListener('resize', () => {
             cardWidth = track.querySelector('.insta-card').offsetWidth + 20;
             maxScroll = track.scrollWidth - track.parentElement.clientWidth;
             if(currentScroll > maxScroll) currentScroll = maxScroll;
             track.style.transform = `translateX(-${currentScroll}px)`;
        });

        nextBtn.addEventListener('click', () => {
            currentScroll += cardWidth;
            if(currentScroll > maxScroll) {
                currentScroll = maxScroll;
            }
            track.style.transform = `translateX(-${currentScroll}px)`;
        });

        prevBtn.addEventListener('click', () => {
            currentScroll -= cardWidth;
            if(currentScroll < 0) {
                currentScroll = 0;
            }
            track.style.transform = `translateX(-${currentScroll}px)`;
        });
    }

    // FAQ Accordion Logic
    const accItems = document.querySelectorAll('.acc-item');
    accItems.forEach(item => {
        const header = item.querySelector('.acc-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            accItems.forEach(i => i.classList.remove('active'));

            // If it wasn't active, open it
            if(!isActive) {
                item.classList.add('active');
            }
        });
    });
});
