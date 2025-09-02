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
            
            // عرض الصورة إذا كانت متاحة
            const imageElement = product.imageUrl 
                ? `<img src="${product.imageUrl}" alt="${product.title || 'منتج'}" onerror="handleImageError(this)">`
                : '<div class="no-image">صورة المنتج</div>';
            
            productCard.innerHTML = `
                <div class="product-image">${imageElement}</div>
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
    showStatusMessage('حدث خطأ في تحميل المنتجات', 'error');
});

// معالجة أخطاء تحميل الصور
function handleImageError(img) {
    img.style.display = 'none';
    img.parentElement.innerHTML = '<div class="no-image">فشل تحميل الصورة</div>';
}

// دالة لعرض رسائل الحالة (للصفحة الرئيسية)
function showStatusMessage(message, type) {
    // إنصراف عنصر إذا لم يكن موجوداً
    let statusElement = document.getElementById('status-message');
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'status-message';
        statusElement.className = 'status-message';
        document.querySelector('.container').prepend(statusElement);
    }
    
    statusElement.textContent = message;
    statusElement.className = `status-message status-${type}`;
    statusElement.style.display = 'block';
    
    // إخفاء الرسالة تلقائياً بعد 5 ثوانٍ
    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 5000);
            }
