require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db')

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api', (req, res) => {
    res.json({ message: 'Вітаю! Сервер CherryPick працює 🍒' });
});


// Твій тестовий маршрут
app.get('/', (req, res) => {
    res.json({ message: 'Привіт! Сервер працює і готовий до роботи 🍒' });
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});

const authRoutes = require('./routes/authRoutes');

// Всі запити, що починаються на /api/auth, йдуть у наш файл роутів
app.use('/api/auth', authRoutes);