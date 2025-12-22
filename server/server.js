require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db');

// 👇 1. ІМПОРТУЄМО РОУТИ
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const artworkRoutes = require('./routes/artworkRoutes');
const dictionaryRoutes = require('./routes/dictionaryRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes'); // <--- НОВЕ: Імпорт роутів профілю
const searchRoutes = require('./routes/searchRoutes');
const stickyNoteRoutes = require('./routes/stickyNoteRoutes')


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Робимо папку uploads доступною для перегляду (Аватарки будуть тут)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 👇 2. ПІДКЛЮЧАЄМО МАРШРУТИ
app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/dict', dictionaryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes); // <--- НОВЕ: Підключили /api/users (для профілю)
app.use('/api/search', searchRoutes);
app.use('/api/sticky-notes', stickyNoteRoutes);


// Тестові маршрути
app.get('/api', (req, res) => {
    res.json({ message: 'Вітаю! Сервер CherryPick працює 🍒' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Привіт! Сервер працює і готовий до роботи 🍒' });
});

// 👇 3. ЗАПУСКАЄМО СЕРВЕР
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
    console.log(`📂 Папка завантажень: ${path.join(__dirname, 'uploads')}`);
});