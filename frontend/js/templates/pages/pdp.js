/**
 * Product Detail Page (PDP) Templates - Handles HTML for product-specific widgets.
 */
import { DarazUtils } from '../../utils/helpers.js';

export function createBreadcrumbHTML(list) {
    if (!list || list.length === 0) return '';
    
    return list.map((item, i) => {
        const isLast = i === list.length - 1;
        if (isLast) {
            return `
                <li class="breadcrumb_item">
                    <span class="breadcrumb_item_text">
                        <span class="breadcrumb_item_anchor breadcrumb_item_anchor_last">${item.title}</span>
                    </span>
                </li>
            `;
        }
        return `
            <li class="breadcrumb_item">
                <span class="breadcrumb_item_text">
                    <a href="${item.url}" class="breadcrumb_item_anchor"><span>${item.title}</span></a>
                    <div class="breadcrumb_right_arrow"></div>
                </span>
            </li>
        `;
    }).join('');
}

export function createSellerCardHTML(s) {
    if (!s) return '';
    
    const formatPercent = (val) => {
        const text = String(val || "").trim();
        if (!text || text.toLowerCase() === "not enough data") return text;
        return text.endsWith("%") ? text : `${text}%`;
    };

    const chatRate = s.chatResponseRate || s.chatResponse || "Not enough data";
    const chatClass = chatRate === "Not enough data" ? "seller-metric-value-muted" : "seller-metric-value";

    return `
        <div class="seller-top">
            <div><p class="seller-label">Sold by</p><a href="#" class="seller-name-link">${s.name}</a></div>
            <div class="seller-chat">
                <span class="seller-icon"><i class="fa-solid fa-comment"></i></span>
                <a href="#" class="seller-chat-link">Chat Now</a>
            </div>
        </div>
        <div class="seller-metrics">
            <div class="seller-metric">
                <div class="seller-metric-title">Positive Seller Ratings</div>
                <div class="seller-metric-value">${formatPercent(s.positiveRating)}</div>
            </div>
            <div class="seller-metric">
                <div class="seller-metric-title">Ship on Time</div>
                <div class="seller-metric-value">${formatPercent(s.shipOnTime)}</div>
            </div>
            <div class="seller-metric">
                <div class="seller-metric-title">Chat Response Rate</div>
                <div class="${chatClass}">${formatPercent(chatRate)}</div>
            </div>
        </div>
        <a href="#" class="seller-store-link">GO TO STORE</a>
    `;
}

export function createSpecsHTML(specs) {
    if (!specs) return '';
    return `
        <h3 class="pdp-spec-title">${specs.title}</h3>
        <ul class="specification-keys">
            ${specs.keys.map(k => `<li><span class="key-title">${k.title}</span><span class="key-value">${k.value}</span></li>`).join('')}
        </ul>
        <div class="box-content">
            <span class="key-title">What's in the box</span>
            <span class="box-content-html">${specs.boxContent}</span>
        </div>
    `;
}

export function createNotFoundHTML() {
    return `
        <div class="show-not-found">
            <h2>Product Not Found</h2>
            <p>Sorry, this product does not exist or may have been removed.</p>
            <a href="index.html" class="btn-home">Go to Home</a>
        </div>
    `;
}

export const DarazPDPTemplates = {
    createBreadcrumbHTML,
    createSellerCardHTML,
    createSpecsHTML,
    createNotFoundHTML
};
