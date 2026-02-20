       let quantity = 1;

        function changeImage(thumbnail) {
            const mainImage = document.getElementById('mainImage');
            const thumbnails = document.querySelectorAll('.thumbnail');
            
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
            
            const imgSrc = thumbnail.querySelector('img').src.replace('w=300', 'w=800');
            mainImage.src = imgSrc;
        }

        function selectSize(btn) {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        }

        function increaseQty() {
            quantity++;
            document.getElementById('quantity').textContent = quantity;
        }

        function decreaseQty() {
            if (quantity > 1) {
                quantity--;
                document.getElementById('quantity').textContent = quantity;
            }
        }

        function addToCart() {
            const productTitle = document.getElementById('productTitle').textContent;
            const selectedSize = document.querySelector('.size-btn.selected').textContent;
            
            alert(`Added ${quantity} × ${productTitle} (${selectedSize}) to cart!`);
        }

        function toggleWishlist(btn) {
            if (btn.textContent === '♡') {
                btn.textContent = '♥';
                btn.style.color = '#ff6b6b';
            } else {
                btn.textContent = '♡';
                btn.style.color = '';
            }
        }

        // Load product data from URL parameters or localStorage
        window.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            
            // In a real application, you would fetch product data based on ID
            // For now, the static content is displayed
        });