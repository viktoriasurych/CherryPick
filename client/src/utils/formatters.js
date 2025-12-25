// client/src/utils/formatters.js
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

export const formatHeatmapTooltip = (value) => {
    if (!value || !value.count) return 'No rituals found';
    return `${value.date}: ${formatDuration(Number(value.count))}`;
};