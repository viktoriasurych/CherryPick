export const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return '0s';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);

    return parts.join(' ');
};

export const formatDigitalTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export const toLocalISO = (dateStringOrObject) => {
    if (!dateStringOrObject) return '';
    const date = new Date(dateStringOrObject);
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 19);
};

export const formatHeatmapTooltip = (value) => {
    if (!value || !value.count) return 'No rituals found';
    return `${value.date}: ${formatDuration(Number(value.count))}`;
};

export const getDisplayHandle = (value) => {
    if (!value) return '';
    let handle = value;
    handle = handle.replace(/^https?:\/\//, '');
    handle = handle.replace(/^www\./, '');
    handle = handle.replace(/^(t\.me|instagram\.com|artstation\.com|behance\.net)\//, '');
    handle = handle.replace(/\/$/, '');
    if (handle.startsWith('@')) return handle;
    return `@${handle}`;
};

export const getSocialLink = (platform, value) => {
    if (!value) return null;
    const cleanVal = value.replace('@', '').trim();
    if (cleanVal.startsWith('http')) return cleanVal;
    switch (platform) {
        case 'telegram': return `https://t.me/${cleanVal}`;
        case 'instagram': return `https://instagram.com/${cleanVal}`;
        case 'artstation': return `https://www.artstation.com/${cleanVal}`;
        case 'behance': return `https://www.behance.net/${cleanVal}`;
        default: return `https://${cleanVal}`;
    }
};

export const formatStickyDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date).toUpperCase(); 
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
        day: '2-digit', month: 'short', year: 'numeric' 
    }).format(date);
};

export const formatFuzzyDate = (year, month, day) => {
    if (!year) return '';
    const date = new Date(year, (month || 1) - 1, day || 1);
    
    const options = { year: 'numeric' };
    if (month) options.month = 'short';
    if (day) options.day = '2-digit';

    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const getToday = () => {
    const now = new Date();
    return { 
        year: now.getFullYear(), 
        month: now.getMonth() + 1, 
        day: now.getDate() 
    };
};

export const isFutureDate = (d) => {
    if (!d || !d.year) return false;
    const checkDate = new Date(d.year, (d.month || 1) - 1, d.day || 1);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return checkDate > now;
};

export const MONTHS = [
    { id: 1, name: 'Jan' }, { id: 2, name: 'Feb' }, { id: 3, name: 'Mar' }, 
    { id: 4, name: 'Apr' }, { id: 5, name: 'May' }, { id: 6, name: 'Jun' },
    { id: 7, name: 'Jul' }, { id: 8, name: 'Aug' }, { id: 9, name: 'Sep' },
    { id: 10, name: 'Oct' }, { id: 11, name: 'Nov' }, { id: 12, name: 'Dec' }
];

export const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export const getDaysInMonth = (year, month) => {
    if (!month) return 31;
    const mInt = parseInt(month);
    if ([4, 6, 9, 11].includes(mInt)) return 30;
    if (mInt === 2) return isLeapYear(year) ? 29 : 28;
    return 31;
};