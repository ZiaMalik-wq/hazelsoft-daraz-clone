/**
 * Auth Layer - Manages user sessions and login state.
 */
const STORAGE_KEY = "darazCurrentUser";

function parseStoredUser(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
}

function normalizeUser(user) {
    if (!user || typeof user !== "object") return null;
    const name = typeof user.name === "string" ? user.name.trim() : "";
    if (!name) return null;
    return {
        id: user.id || null,
        name: name,
        email: typeof user.email === "string" ? user.email : "",
        phone: typeof user.phone === "string" ? user.phone : ""
    };
}

export function getCurrentUser() {
    return normalizeUser(parseStoredUser(window.localStorage.getItem(STORAGE_KEY)));
}

export function saveCurrentUser(user) {
    if (!user || !user.name) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        id: user.id || null,
        name: user.name,
        email: user.email || "",
        phone: user.phone || ""
    }));
}

export function clearCurrentUser() {
    window.localStorage.removeItem(STORAGE_KEY);
}

export function updateLoginLinks() {
    const user = getCurrentUser();
    const $links = $(".topbar__item--account .js-login-link");

    $links.each(function () {
        const $link = $(this);
        const $accountItem = $link.closest(".topbar__item--account");

        if (user && user.name) {
            $link
                .text(user.name.toUpperCase())
                .attr({
                    "href": "#",
                    "title": "My account",
                    "id": "accountDropdownToggle",
                    "aria-expanded": "false",
                    "data-bs-toggle": "dropdown",
                    "data-bs-display": "static",
                    "role": "button"
                })
                .addClass("dropdown-toggle");

            if (window.bootstrap && bootstrap.Dropdown && $accountItem.length) {
                bootstrap.Dropdown.getOrCreateInstance($link[0]);
            }
            $accountItem.addClass("is-logged-in");
        } else {
            if (window.bootstrap && bootstrap.Dropdown) {
                const dropdownInstance = bootstrap.Dropdown.getInstance($link[0]);
                if (dropdownInstance) dropdownInstance.dispose();
            }

            if ($accountItem.length) {
                $accountItem.find('.account-dropdown__menu').removeClass('show').removeAttr('data-bs-popper');
            }

            $link
                .text("Login")
                .attr("href", "#")
                .removeAttr("title role data-bs-toggle data-bs-display data-bs-offset aria-expanded id")
                .removeClass("dropdown-toggle");
            $accountItem.removeClass("is-logged-in");
        }
    });

    $(".topbar__link").each(function () {
        const $link = $(this);
        if ($link.text().trim().toLowerCase() === "sign up") {
            $link.closest(".topbar__item").toggle(!user);
        }
    });

    // We'll handle mobile links via event or direct call if available
    if (typeof window.populateMobileTopLinks === "function") {
        window.populateMobileTopLinks();
    }
}

function bindEvents() {
    $(document).on("click", ".js-account-logout", function (event) {
        event.preventDefault();

        const $toggle = $(".topbar__item--account .js-login-link.dropdown-toggle");
        if ($toggle.length) {
            const inst = bootstrap.Dropdown.getInstance($toggle[0]);
            if (inst) inst.hide();
        }

        clearCurrentUser();
        updateLoginLinks();
        window.location.href = "index.html";
    });
}

export const DarazAuth = {
    storageKey: STORAGE_KEY,
    getCurrentUser,
    saveCurrentUser,
    clearCurrentUser,
    updateLoginLinks
};

// Auto-init on load
$(function () {
    bindEvents();
    updateLoginLinks();
    $(document).on("daraz:header-ready", updateLoginLinks);
});
