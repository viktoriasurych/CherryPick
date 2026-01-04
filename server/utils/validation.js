const RULES = require('../config/validationRules.json');

const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
};

const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validate = {
    user: (data) => {
        const errors = [];
        
        if (data.nickname) {
            if (data.nickname.length < RULES.USER.NICKNAME.MIN) {
                errors.push(`Нікнейм занадто короткий (мін ${RULES.USER.NICKNAME.MIN})`);
            }
            if (data.nickname.length > RULES.USER.NICKNAME.MAX) {
                errors.push(`Нікнейм занадто довгий (макс ${RULES.USER.NICKNAME.MAX})`);
            }
        }

        if (data.bio && data.bio.length > RULES.USER.BIO.MAX) {
            errors.push(`Біографія перевищує ліміт (${RULES.USER.BIO.MAX} символів)`);
        }

        if (data.location && data.location.length > RULES.USER.LOCATION.MAX) {
            errors.push(`Назва локації занадто довга`);
        }
        Object.keys(data).forEach(key => {
            if (key.startsWith('social_') && data[key] && data[key].length > RULES.USER.SOCIAL.MAX) {
                errors.push(`Посилання в ${key} занадто довге`);
            }
        });

        return errors;
    },

    artwork: (data) => {
        const errors = [];
        if (data.title) {
            if (data.title.length < RULES.ARTWORK.TITLE.MIN) errors.push('Назва роботи занадто коротка');
            if (data.title.length > RULES.ARTWORK.TITLE.MAX) errors.push('Назва роботи занадто довга');
        }
        if (data.description && data.description.length > RULES.ARTWORK.DESCRIPTION.MAX) {
            errors.push('Опис роботи занадто довгий');
        }
        return errors;
    },

    collection: (data) => {
        const errors = [];
        if (data.title) {
            if (data.title.length < RULES.COLLECTION.TITLE.MIN) errors.push('Назва колекції занадто коротка');
            if (data.title.length > RULES.COLLECTION.TITLE.MAX) errors.push('Назва колекції занадто довга');
        }
        if (data.description && data.description.length > RULES.COLLECTION.DESCRIPTION.MAX) {
            errors.push('Опис колекції занадто довгий');
        }
        return errors;
    },

    stickyNote: (data) => {
        const errors = [];
        if (data.title && data.title.length > RULES.STICKY_NOTE.TITLE.MAX) {
            errors.push('Заголовок наліпки занадто довгий');
        }
        if (data.content && data.content.length > RULES.STICKY_NOTE.CONTENT.MAX) {
            errors.push('Текст наліпки занадто довгий');
        }
        return errors;
    },

    dictionary: (data) => {
        const errors = [];
        if (data.name) {
            if (data.name.length > RULES.DICT.NAME.MAX) {
                errors.push(`Назва занадто довга (макс ${RULES.DICT.NAME.MAX})`);
            }
        }
        return errors;
    },

    note: (data) => {
        const errors = [];
        if (data.content && data.content.length > RULES.NOTE.CONTENT.MAX) {
            errors.push(`Текст нотатки занадто довгий`);
        }
        return errors;
    }

    
};

module.exports = { 
    validatePassword, 
    validateEmail,
    validate
};