// Форматує секунди в "1 год 30 хв" або "45 с"
export const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return '0 с';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    const parts = [];
    if (h > 0) parts.push(`${h} год`);
    if (m > 0) parts.push(`${m} хв`);
    if (s > 0 || parts.length === 0) parts.push(`${s} с`);

    return parts.join(' ');
};

// Для Heatmap
export const formatHeatmapTooltip = (value) => {
    if (!value || !value.count) return 'Немає даних';
    return `${value.date}: ${formatDuration(Number(value.count))}`;
};