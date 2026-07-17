/**
 * Sections Module - Handles dynamic rendering of home page sections.
 */
import { DarazApi } from './layers/api.js';
import { DarazTemplates } from './templates/components/cards.js';

// --- Constants & Config ---
const JFY_CONFIG = {
    itemsPerRow: 6,
    initialRows: 1,
    rowsPerLoad: 1
};

let jfyProducts = [];
let jfyVisibleCount = 0;
let jfyShowRating = true;

const SECTION_DEFAULTS = {
    'flash-sale': { containerId: 'flashsale-container', className: 'flash-sale-grid', wrapperClass: 'flash-sale', layout: 'flash-sale', showRating: false },
    'categories': { containerId: 'categories-container', className: 'category-grid', wrapperClass: 'categories', layout: 'default', showRating: false },
    'jfy': { containerId: 'jfy-container', className: 'jfy-grid', wrapperClass: 'jfy', layout: 'default', showRating: true }
};

// --- Helpers ---

export function resolveSectionConfig(section = {}) {
    const type = String(section.type || '').trim();
    const defaults = SECTION_DEFAULTS[type] || {};

    return {
        ...defaults,
        ...section,
        type,
        sectionTitle: section.sectionTitle || section.name || type,
        containerId: section.containerId || defaults.containerId || `${type}-container`,
        className: section.className || defaults.className || 'product-grid',
        showRating: section.showRating ?? defaults.showRating ?? true
    };
}

function createSectionWrapper(section) {
    const config = resolveSectionConfig(section);
    const hasFlashHeader = config.type === 'flash-sale' && config.layout === 'flash-sale';

    const headerHtml = hasFlashHeader ? `
        <div class="flash-sale-header">
            <div class="flash-sale-header__status"><span>On Sale Now</span></div>
            <a href="#" class="c-btn c-btn--orange c-btn--sm flash-sale-header__btn"> SHOP ALL PRODUCTS </a>
        </div>` : '';

    const innerContent = `${headerHtml}<div class="${config.className}" id="${config.containerId}"></div>`;

    return `
        <div class="section-wrapper ${config.wrapperClass || ''}" id="${config.type}-section">
            <div class="section-wrapper__header">
                <h3 class="section-wrapper__title">${config.sectionTitle}</h3>
            </div>
            ${config.layout === 'card-content' ? `<div class="section-wrapper__content">${innerContent}</div>` : innerContent}
        </div>
    `;
}

// --- Data Processing ---

function mapProductRelations(products, brands, sellers) {
    return products.map(product => ({
        ...product,
        brand: brands.find(b => b.id === product.brandId)?.name || 'Unknown Brand',
        seller: sellers.find(s => s.id === product.sellerId) || null
    }));
}

function groupProductsBySection(products, sections) {
    const sectionMap = Object.fromEntries(sections.map(s => [s.type, s.id != null ? String(s.id) : String(s.type)]));
    const grouped = {};

    products.forEach(p => {
        const key = sectionMap[p.section] || String(p.section || '');
        if (key) {
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(p);
        }
    });
    return grouped;
}

// --- JFY Logic ---

function getJfyLoadMoreElements() {
    return {
        $wrapper: $('.load-more-container'),
        $button: $('.load-more-btn'),
        $indicator: $('.jfy-load-indicator'),
        $endMsg: $('.jfy-load-end-message')
    };
}

function updateJfyUI(isLoading = false) {
    const { $wrapper, $button, $indicator, $endMsg } = getJfyLoadMoreElements();
    
    if (!$wrapper.length) return;

    $wrapper.toggleClass('is-loading', isLoading);
    $button.prop('disabled', isLoading).css('pointer-events', isLoading ? 'none' : 'auto');
    $indicator.attr('aria-hidden', !isLoading);

    const hasMore = jfyVisibleCount < jfyProducts.length;
    const isInitial = jfyProducts.length <= (JFY_CONFIG.initialRows * JFY_CONFIG.itemsPerRow);

    if (isInitial) {
        $wrapper.hide();
    } else if (!hasMore) {
        $wrapper.show().addClass('is-complete');
        $endMsg.attr('aria-hidden', false);
    } else {
        $button.text('Load More');
        $wrapper.show().removeClass('is-complete');
        $endMsg.attr('aria-hidden', true);
    }
}

function renderJfyProducts() {
    const $container = $('#jfy-container');
    if (!$container.length) return;

    const html = jfyProducts.slice(0, jfyVisibleCount)
        .map(item => DarazTemplates.createProductCardHTML(item, jfyShowRating))
        .join('');

    $container.html(html);
}

export function initJfyLoadMore() {
    const { $button } = getJfyLoadMoreElements();
    if (!$button.length) return;

    $button.off('click').on('click', () => {
        if (jfyVisibleCount >= jfyProducts.length) return;

        jfyVisibleCount = Math.min(jfyVisibleCount + (JFY_CONFIG.rowsPerLoad * JFY_CONFIG.itemsPerRow), jfyProducts.length);
        updateJfyUI(true);

        setTimeout(() => {
            renderJfyProducts();
            updateJfyUI(false);
        }, 600);
    });
}

// --- Rendering ---

export async function loadCategories() {
    const $container = $('#categories-container');
    if (!$container.length) return;

    try {
        const categories = await DarazApi.getCategories();
        $container.html(categories.map(item => `
            <a href="#" class="category-item u-hoverable">
                <div class="u-image-wrapper category-item__image"><img src="${item.image}" alt="${item.name}" /></div>
                <div class="category-item__name u-two-line-clamp">${item.name}</div>
            </a>
        `).join(''));
    } catch (e) { console.error('Sections: Error loading categories', e); }
}

export async function loadSectionsAndProducts() {
    const $mainContent = $('#home-main-content');
    if (!$mainContent.length) return;

    try {
        const [sections, rawProducts, brands, sellers] = await Promise.all([
            DarazApi.getSections(), DarazApi.getProducts(), DarazApi.getBrands(), DarazApi.getSellers()
        ]);

        const processedProducts = mapProductRelations(rawProducts, brands, sellers);
        const grouped = groupProductsBySection(processedProducts, sections);

        sections.forEach(section => {
            const config = resolveSectionConfig(section);
            let $container = $('#' + config.containerId);

            if (!$container.length) {
                $mainContent.append(createSectionWrapper(config));
                $container = $('#' + config.containerId);
            }

            const products = grouped[config.id || config.type] || [];

            if (config.type === 'categories') {
                loadCategories();
            } else if (config.type === 'jfy') {
                jfyShowRating = config.showRating;
                jfyProducts = products;
                jfyVisibleCount = Math.min(JFY_CONFIG.initialRows * JFY_CONFIG.itemsPerRow, products.length);
                renderJfyProducts();
                updateJfyUI();
                initJfyLoadMore();
            } else {
                $container.html(products.map(p => DarazTemplates.createProductCardHTML(p, config.showRating)).join(''));
            }
        });
    } catch (e) { console.error('Sections: Error loading page data', e); }
}

export const SectionsModule = {
    initJfyLoadMore,
    loadSectionsAndProducts,
    loadCategories,
    resolveSectionConfig
};