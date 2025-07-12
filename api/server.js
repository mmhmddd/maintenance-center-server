const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, query, where } = require('firebase/firestore');
const helmet = require('helmet');

const app = express();

// تهيئة Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAea5fNUklM4j_xCw4ugVaitE9raSj1bHg",
  authDomain: "maintance-center.firebaseapp.com",
  projectId: "maintance-center",
  storageBucket: "maintance-center.firebasestorage.app",
  messagingSenderId: "89094542200",
  appId: "1:89094542200:web:fc501da186ac1f8dd2ee8d",
  measurementId: "G-70TWHYHGHB"
};
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

// تفعيل body-parser لقراءة JSON وform-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// التحقق من صحة البريد الإلكتروني ورقم الهاتف
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\س@]+$/.test(email);
const isValidPhone = (phone) => /^\+?\d{10,14}$/.test(phone);

// إنشاء حساب
app.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  console.log('طلب إنشاء حساب - req.body:', req.body);

  if (!name || !email || !phone || !password) {
    console.error('خطأ: جميع الحقول مطلوبة');
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }

  if (!isValidEmail(email)) {
    console.error('خطأ: البريد الإلكتروني غير صالح', email);
    return res.status(400).json({ message: 'البريد الإلكتروني غير صالح' });
  }

  if (!isValidPhone(phone)) {
    console.error('خطأ: رقم الهاتف غير صالح', phone);
    return res.status(400).json({ message: 'رقم الهاتف غير صالح' });
  }

  if (password.length < 6) {
    console.error('خطأ: كلمة المرور قصيرة جدًا', email);
    return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.error('خطأ: البريد الإلكتروني موجود بالفعل', email);
      return res.status(400).json({ message: 'البريد الإلكتروني موجود بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await addDoc(usersRef, { name, email, phone, password: hashedPassword });
    console.log('تم إنشاء حساب لـ:', email);
    res.status(201).json({ message: 'تم إنشاء الحساب بنجاح' });
  } catch (err) {
    console.error('خطأ في التسجيل:', err);
    res.status(500).json({ message: 'حدث خطأ، حاول مرة أخرى' });
  }
});

// تسجيل الدخول
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('طلب تسجيل دخول - req.body:', req.body);

  if (!email || !password) {
    console.error('خطأ: البريد الإلكتروني وكلمة المرور مطلوبان');
    return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.error('خطأ: البريد الإلكتروني غير موجود', email);
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.error('خطأ: كلمة المرور غير صحيحة', email);
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign({ email, name: user.name, phone: user.phone }, process.env.SECRET_KEY || 'your_secure_secret_key_1234567890', { expiresIn: '30m' });
    console.log('تم إنشاء توكن لـ:', email);
    res.json({ token });
  } catch (err) {
    console.error('خطأ في تسجيل الدخول:', err);
    res.status(500).json({ message: 'حدث خطأ، حاول مرة أخرى' });
  }
});

// تصدير التطبيق كدالة لدعم Serverless Functions
module.exports = app;