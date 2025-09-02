// الحصول على النموذج والعناصر الأخرى
const productForm = document.getElementById('product-form');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const uploadProgress = document.getElementById('upload-progress');
const progressBar = document.querySelector('.progress');
const submitBtn = document.querySelector('.submit-btn');

// معاينة الصورة قبل الرفع
imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        // التحقق من حجم الصورة (5MB كحد أقصى)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('حجم الصورة كبير جداً. الحد الأقصى هو 5MB');
            this.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
    }
});

// إضافة منتج جديد عند تقديم النموذج
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // تعطيل الزر أثناء التحميل
    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري النشر...';
    
    // الحصول على القيم من النموذج
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const location = document.getElementById('location').value;
    const imageFile = imageInput.files[0];
    
    let imageUrl = '';
    
    // إذا تم تحميل صورة، قم برفعها إلى Firebase Storage
    if (imageFile) {
        try {
            // عرض شريط التقدم
            uploadProgress.style.display = 'block';
            
            // إنشاء مرجع للتخزين مع اسم فريد
            const storageRef = storage.ref();
            const imageRef = storageRef.child('products/' + Date.now() + '_' + imageFile.name);
            
            // رفع الملف مع متابعة التقدم
            const uploadTask = imageRef.put(imageFile);
            
            // متابعة تقدم الرفع
            uploadTask.on('state_changed', 
                (snapshot) => {
                    // تحديث شريط التقدم
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.style.width = progress + '%';
                },
                (error) => {
                    console.error('Error uploading image:', error);
                    alert('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.');
                    resetForm();
                },
                async () => {
                    try {
                        // الرفع اكتمل بنجاح، الحصول على رابط التنزيل
                        imageUrl = await uploadTask.snapshot.ref.getDownloadURL();
                        console.log('Image uploaded successfully:', imageUrl);
                        
                        // حفظ البيانات في Realtime Database
                        await saveProductData(title, description, price, location, imageUrl);
                    } catch (error) {
                        console.error('Error getting download URL:', error);
                        alert('حدث خطأ أثناء الحصول على رابط الصورة.');
                        resetForm();
                    }
                }
            );
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.');
            resetForm();
        }
    } else {
        // إذا لم يتم تحميل صورة، احفظ البيانات فقط
        try {
            await saveProductData(title, description, price, location, imageUrl);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('حدث خطأ أثناء حفظ البيانات.');
            resetForm();
        }
    }
});

// دالة لحفظ بيانات المنتج في Firebase
async function saveProductData(title, description, price, location, imageUrl) {
    try {
        // إنشاء مرجع للمنتجات
        const productsRef = database.ref('products');
        
        // إضافة المنتج إلى Firebase
        const newProductRef = productsRef.push();
        await newProductRef.set({
            title: title,
            description: description,
            price: price,
            location: location,
            imageUrl: imageUrl,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        alert('تم نشر الإعلان بنجاح!');
        resetForm();
    } catch (error) {
        console.error('Error saving product data:', error);
        throw error;
    }
}

// دالة لإعادة تعيين النموذج
function resetForm() {
    productForm.reset();
    imagePreview.style.display = 'none';
    uploadProgress.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.textContent = 'نشر الإعلان';
    progressBar.style.width = '0%';
                }
