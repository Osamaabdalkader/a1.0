// الحصول على النموذج والعناصر الأخرى
const productForm = document.getElementById('product-form');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const uploadProgress = document.getElementById('upload-progress');
const progressBar = document.querySelector('.progress');
const submitBtn = document.querySelector('.submit-btn');

// دالة لعرض رسائل الحالة
function showStatusMessage(message, type) {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = `status-message status-${type}`;
    statusElement.style.display = 'block';
    
    // إخفاء الرسالة تلقائياً بعد 5 ثوانٍ (للرسائل الناجحة)
    if (type === 'success') {
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// معاينة الصورة قبل الرفع
imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        // التحقق من حجم الصورة (5MB كحد أقصى)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            showStatusMessage('حجم الصورة كبير جداً. الحد الأقصى هو 5MB', 'error');
            this.value = '';
            return;
        }

        // التحقق من نوع الملف
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showStatusMessage('نوع الملف غير مدعوم. الرجاء استخدام صورة من نوع JPG, PNG, GIF, أو WebP', 'error');
            this.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
        }
        reader.onerror = function() {
            showStatusMessage('حدث خطأ أثناء قراءة الملف', 'error');
        };
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
                    handleUploadError(error);
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
                        showStatusMessage('حدث خطأ أثناء الحصول على رابط الصورة: ' + error.message, 'error');
                        resetForm();
                    }
                }
            );
        } catch (error) {
            console.error('Error uploading image:', error);
            showStatusMessage('حدث خطأ غير متوقع أثناء رفع الصورة: ' + error.message, 'error');
            resetForm();
        }
    } else {
        // إذا لم يتم تحميل صورة، احفظ البيانات فقط
        try {
            await saveProductData(title, description, price, location, imageUrl);
        } catch (error) {
            console.error('Error saving product:', error);
            showStatusMessage('حدث خطأ أثناء حفظ البيانات: ' + error.message, 'error');
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
        
        showStatusMessage('تم نشر الإعلان بنجاح! سيتم توجيهك إلى الصفحة الرئيسية قريباً.', 'success');
        resetForm();
        
        // إعادة التوجيه إلى الصفحة الرئيسية بعد ثانيتين
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('Error saving product data:', error);
        showStatusMessage('حدث خطأ أثناء حفظ البيانات: ' + error.message, 'error');
        throw error;
    }
}

// دالة لإعادة تعيين النموذج
function resetForm() {
    submitBtn.disabled = false;
    submitBtn.textContent = 'نشر الإعلان';
    uploadProgress.style.display = 'none';
    progressBar.style.width = '0%';
}

// دالة لمعالجة أخطاء التحميل
function handleUploadError(error) {
    console.error('Upload error:', error);
    
    let errorMessage = 'حدث خطأ أثناء رفع الصورة.';
    
    switch (error.code) {
        case 'storage/unauthorized':
            errorMessage = 'ليس لديك صلاحية لرفع الملفات. يرجى التحقق من إعدادات الأمان في Firebase.';
            break;
        case 'storage/canceled':
            errorMessage = 'تم إلغاء عملية الرفع.';
            break;
        case 'storage/unknown':
            errorMessage = 'حدث خطأ غير معروف أثناء الرفع.';
            break;
        case 'storage/quota-exceeded':
            errorMessage = 'تم تجاوز سعة التخزين المتاحة.';
            break;
        case 'storage/unauthenticated':
            errorMessage = 'يجب تسجيل الدخول لرفع الملفات.';
            break;
    }
    
    showStatusMessage(errorMessage, 'error');
}

// اختبار اتصال Firebase
function testFirebaseConnection() {
    // اختبار اتصال قاعدة البيانات
    const connectedRef = database.ref(".info/connected");
    connectedRef.on("value", function(snap) {
        if (snap.val() === true) {
            console.log("Connected to Firebase Database");
        } else {
            console.log("Not connected to Firebase Database");
            showStatusMessage("غير متصل بقاعدة البيانات. يرجى التحقق من اتصال الإنترنت.", "error");
        }
    });
    
    // اختبار اتصال التخزين (محاولة الوصول إلى الجذر)
    try {
        const storageRef = storage.ref();
        console.log("Firebase Storage initialized successfully");
    } catch (error) {
        console.error("Firebase Storage initialization error:", error);
        showStatusMessage("هناك مشكلة في إعدادات التخزين. يرجى التحقق من تكوين Firebase.", "error");
    }
}

// اختبار الاتصال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    testFirebaseConnection();
});
