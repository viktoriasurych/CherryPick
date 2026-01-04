const generateNickname = (displayName) => {
    if (!displayName) return `user_${Math.floor(1000 + Math.random() * 9000)}`;

    let base = displayName.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    
    if (base.length < 3) base = 'user';
    
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
    return `${base}_${randomSuffix}`;
};

module.exports = { generateNickname };