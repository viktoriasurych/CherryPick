require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const artworkRoutes = require('./routes/artworkRoutes');
const dictionaryRoutes = require('./routes/dictionaryRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes');
const searchRoutes = require('./routes/searchRoutes');
const stickyNoteRoutes = require('./routes/stickyNoteRoutes')
const quoteRouter = require('./routes/quoteRouter');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/dict', dictionaryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/sticky-notes', stickyNoteRoutes);

app.use('/api/quotes', quoteRouter);

app.use('/api/ai', aiRoutes);

// тестові маршрути
app.get('/api', (req, res) => {
    res.json({ message: 'Вітаю! Сервер CherryPick працює 🍒' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Привіт! Сервер працює і готовий до роботи 🍒' });
});

// ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});