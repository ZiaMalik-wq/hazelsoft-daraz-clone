/**
 * UI Templates for various data objects.
 */
import { DarazUtils } from '../../utils/helpers.js';

export function createProductCardHTML(item, showRating = true) {
    const formattedPrice = item.price.toLocaleString();
    const oldPrice = DarazUtils.calculateOldPrice(item.price, item.discount);
    const formattedOldPrice = oldPrice ? oldPrice.toLocaleString() : '';
    const discountText = item.discount ? `-${item.discount}%` : '';
    const ratingStats = DarazUtils.getRatingStatsFromDistribution(item.ratingDistribution);

    return `
        <a href="product.html?id=${item.id}" class="product-card u-hoverable">
            <div class="product-card__image">
                <img src="${item.images[0]}" alt="${item.title}" />
            </div>
            <div class="product-card__body">
                <div class="product-card__title u-two-line-clamp">${item.title}</div>
                <div class="product-card__price-wrapper">
                    <div class="product-card__price-current">
                        Rs. ${formattedPrice}
                        ${showRating && discountText ? `<span class="product-card__discount">${discountText}</span>` : ''}
                    </div>
                    ${!showRating && (formattedOldPrice || discountText) ? `
                    <div class="product-card__price-old-row">
                        ${formattedOldPrice ? `<span class="product-card__price-old">Rs. ${formattedOldPrice}</span>` : ''}
                        ${discountText ? `<span class="product-card__discount">${discountText}</span>` : ''}
                    </div>
                    ` : ''}
                </div>
                ${showRating ? `
                <div class="product-card__rating">
                    ${DarazUtils.renderStars(ratingStats.average, 'small')}
                    <span class="product-card__rating-count">(${ratingStats.total})</span>
                </div>
                ` : ''}
            </div>
        </a>
    `;
}

export const DarazTemplates = {
    createProductCardHTML
};
