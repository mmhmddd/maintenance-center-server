const API_URL = '';

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  console.log('بيانات تسجيل الدخول:', { email });
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      console.log('تم حفظ التوكن:', data.token);
      alert('تم تسجيل الدخول بنجاح! التوكن محفوظ في التخزين المحلي');
    } else {
      console.error('خطأ في تسجيل الدخول:', data.message);
      alert(data.message);
    }
  } catch (err) {
    console.error('خطأ في تسجيل الدخول:', err);
    alert('حدث خطأ، حاول مرة أخرى');
  }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const phone = document.getElementById('registerPhone').value;
  const password = document.getElementById('registerPassword').value;

  console.log('بيانات التسجيل:', { name, email, phone });
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await response.json();
    console.log('رد الخادم:', data);

    if (response.ok) {
      alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
      window.location.href = '/index.html';
    } else {
      console.error('خطأ في إنشاء الحساب:', data.message);
      alert(data.message);
    }
  } catch (err) {
    console.error('خطأ في إنشاء الحساب:', err);
    alert('حدث خطأ، حاول مرة أخرى');
  }
});