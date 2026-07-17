/**
 * Home Page Templates - Handles HTML for banners and navigation menus.
 */

export function createBannerHTML(banner) {
    return `
        <div class="banner__slide">
            <a href="${banner.link}"><img src="${banner.img}" alt="${banner.alt}" /></a>
        </div>
    `;
}

export function createNavMenuHTML(categories) {
    if (!categories || !categories.length) return '';

    const items = categories.map(cat => {
        const hasSub = Array.isArray(cat.subCategories) && cat.subCategories.length > 0;
        const subDropdown = hasSub ? `
            <div class="nav-menu__sub-dropdown">
                <ul class="nav-menu__list">
                    ${cat.subCategories.map(sub => {
                        const hasGrand = Array.isArray(sub.subCategories) && sub.subCategories.length > 0;
                        const grandDropdown = hasGrand ? `
                            <div class="nav-menu__grand-dropdown">
                                <ul class="nav-menu__list">
                                    ${sub.subCategories.map(grand => `
                                        <li><a class="nav-menu__grand-link" href="${grand.link}">${grand.name}</a></li>
                                    `).join('')}
                                </ul>
                            </div>` : '';

                        return `
                            <li class="nav-menu__sub-item ${hasGrand ? 'has-children' : ''}">
                                <span class="nav-menu__item-text">
                                    ${sub.name}
                                    ${hasGrand ? '<i class="fa-solid fa-chevron-right nav-menu__item-arrow"></i>' : ''}
                                </span>
                                ${grandDropdown}
                            </li>
                        `;
                    }).join('')}
                </ul>
            </div>` : '';

        return `
            <li class="nav-menu__item ${hasSub ? 'has-children' : ''}">
                <span class="nav-menu__item-text">
                    ${cat.name}
                    ${hasSub ? '<i class="fa-solid fa-chevron-right nav-menu__item-arrow"></i>' : ''}
                </span>
                ${subDropdown}
            </li>
        `;
    }).join('');

    return `<ul class="nav-menu__list">${items}</ul>`;
}

export function createMobileCategoryLinks(items, isRoot = true) {
    if (!items || !items.length) return '';

    const listItems = items.map(item => {
        const hasChildren = Array.isArray(item.subCategories) && item.subCategories.length > 0;
        if (hasChildren) {
            return `
                <li>
                    <details class="mobile-menu-group">
                        <summary>${item.name}</summary>
                        <ul class="mobile-menu-category-list">
                            ${createMobileCategoryLinks(item.subCategories, false)}
                        </ul>
                    </details>
                </li>
            `;
        }
        return `<li><a href="${item.link || '#'}">${item.name}</a></li>`;
    }).join('');

    return isRoot ? `<ul class="mobile-menu-category-list">${listItems}</ul>` : listItems;
}

export const DarazHomeTemplates = {
    createBannerHTML,
    createNavMenuHTML,
    createMobileCategoryLinks
};
