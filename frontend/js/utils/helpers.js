/**
 * Helper utilities for formatting, calculations, and date manipulation.
 */

export function renderStars(rating, sizeClass = "medium") {
    const percentage = (rating / 5) * 100;
    return `
      <div class="stars-outer ${sizeClass}">
          <div class="stars-inner" style="width: ${percentage}%"></div>
      </div>
    `;
}

export function getRatingStatsFromDistribution(distribution) {
    const source = Array.isArray(distribution) ? distribution : [];
    const normalized = [0, 0, 0, 0, 0];

    for (let i = 0; i < 5; i++) {
        const value = Number(source[i]);
        normalized[i] = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    }

    const total = normalized[0] + normalized[1] + normalized[2] + normalized[3] + normalized[4];
    if (total <= 0) {
        return {
            average: 0,
            total: 0,
            distribution: normalized
        };
    }

    const weighted = (normalized[0] * 5) + (normalized[1] * 4) + (normalized[2] * 3) + (normalized[3] * 2) + (normalized[4] * 1);

    return {
        average: weighted / total,
        total: total,
        distribution: normalized
    };
}

export function calculateOldPrice(price, discount) {
    if (price == null || discount == null || discount <= 0) return null;
    const p = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.]/g, ''));
    const d = typeof discount === 'number' ? discount : parseFloat(String(discount).replace(/[^0-9.]/g, ''));

    if (isNaN(p) || isNaN(d) || d >= 100) return null;

    return Math.round(p / (1 - d / 100));
}

export function timeAgo(dateStr) {
    if (!dateStr) return '';

    const pastDate = new Date(dateStr);
    if (isNaN(pastDate.getTime())) return '';

    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const diffInMs = now.getTime() - pastDate.getTime();
    const diffInDays = Math.floor(diffInMs / oneDayInMs);

    if (diffInDays < 1) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return diffInDays + ' days ago';

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        if (diffInWeeks === 1) return '1 week ago';
        return diffInWeeks + ' weeks ago';
    }

    return pastDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Group export
export const DarazUtils = {
    renderStars,
    getRatingStatsFromDistribution,
    calculateOldPrice,
    timeAgo
};
