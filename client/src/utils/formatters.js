// 1. Для історії/статистики ("1h 30m")
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

// 2. Для ТАЙМЕРА ("01:30:05")
export const formatDigitalTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

// 3. Для інпутів дати (datetime-local)
export const toLocalISO = (dateStringOrObject) => {
    if (!dateStringOrObject) return '';
    const date = new Date(dateStringOrObject);
    // Враховуємо зміщення часового поясу, щоб час не стрибав
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 19);
};

export const formatHeatmapTooltip = (value) => {
    if (!value || !value.count) return 'No rituals found';
    return `${value.date}: ${formatDuration(Number(value.count))}`;
};