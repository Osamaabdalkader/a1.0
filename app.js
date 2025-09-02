// المرجع لقاعدة البيانات
const productsRef = database.ref('products');

// استرجاع وعرض المنتجات
productsRef.on('value', (snapshot) => {
    const products = snapshot.val();
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    if (products) {
        Object.keys(products).forEach(key => {
            const product = products[key];
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <div class="product-image">صورة المنتج</div>
                <div class="product-info">
                    <h3 class="product-title">${product.title || 'لا يوجد عنوان'}</h3>
                    <p class="product-price">السعر: ${product.price || 'غير محدد'} ر.س</p>
                    <p class="product-location">الموقع: ${product.location || 'غير محدد'}</p>
                    <p class="product-description">${product.description || 'لا يوجد وصف'}</p>
                </div>
            `;
            
            productsContainer.appendChild(productCard);
        });
    } else {
        productsContainer.innerHTML = '<p class="no-products">لا توجد منتجات متاحة حالياً</p>';
    }
}, (error) => {
    console.error('Error reading data:', error);
});