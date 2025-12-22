// server/utils/helpers.js

const generateNickname = (displayName) => {
    if (!displayName) return `user_${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Очищаємо ім'я (Alex Art -> alex_art)
    let base = displayName.toLowerCase()
        .replace(/\s+/g, '_')       // пробіли -> _
        .replace(/[^a-z0-9_]/g, ''); // прибираємо все, крім літер, цифр і _
    
    // 2. Якщо вийшло пусте (наприклад, ім'я було ієрогліфами), беремо 'user'
    if (base.length < 3) base = 'user';
    
    // 3. Додаємо випадкові цифри, щоб точно було унікально (alex_art_4821)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
    return `${base}_${randomSuffix}`;
};

module.exports = { generateNickname };