require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db');

// 👇 1. ІМПОРТУЄМО РОУТИ (Краще робити це зверху)
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes')
const artworkRoutes = require('./routes/artworkRoutes'); // <--- ДОДАЛИ ЦЕ!
const dictionaryRoutes = require('./routes/dictionaryRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Робимо папку uploads доступною для перегляду
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 👇 2. ПІДКЛЮЧАЄМО МАРШРУТИ (Важливо це робити ДО app.listen)
app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes); // <--- ДОДАЛИ ЦЕ! (Тепер сервер бачить /api/artworks)
app.use('/api/sessions', sessionRoutes);
app.use('/api/dict', dictionaryRoutes);


// Тестові маршрути
app.get('/api', (req, res) => {
    res.json({ message: 'Вітаю! Сервер CherryPick працює 🍒' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Привіт! Сервер працює і готовий до роботи 🍒' });
});

// 👇 3. ЗАПУСКАЄМО СЕРВЕР (Завжди в самому кінці файлу)
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});
