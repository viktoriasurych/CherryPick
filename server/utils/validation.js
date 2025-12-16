const validatePassword = (password) => {
    // Розшифровка магії:
    // (?=.*[a-z]) - має бути хоча б одна маленька літера
    // (?=.*[A-Z]) - має бути хоча б одна ВЕЛИКА літера
    // (?=.*\d)    - має бути хоча б одна цифра (0-9)
    // .{8,}       - довжина мінімум 8 символів
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    
    return regex.test(password);
};

const validateEmail = (email) => {
    // Проста перевірка, чи є там @ і крапка
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

module.exports = { validatePassword, validateEmail };