// الحصول على النموذج
const productForm = document.getElementById('product-form');

// إضافة منتج جديد عند تقديم النموذج
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // الحصول على القيم من النموذج
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const location = document.getElementById('location').value;
    
    // إنشاء مرجع للمنتجات
    const productsRef = database.ref('products');
    
    // إضافة المنتج إلى Firebase
    const newProductRef = productsRef.push();
    newProductRef.set({
        title: title,
        description: description,
        price: price,
        location: location,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        alert('تم نشر الإعلان بنجاح!');
        productForm.reset();
    })
    .catch((error) => {
        console.error('Error adding product: ', error);
        alert('حدث خطأ أثناء نشر الإعلان. يرجى المحاولة مرة أخرى.');
    });
});