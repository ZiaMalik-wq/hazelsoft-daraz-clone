/**
 * Login Modal Module - Handles loading and displaying the login modal.
 */
import { DarazLogin } from './login.js';
import { DarazAuth } from '../layers/auth.js';

const LOGIN_SELECTOR = ".js-login-link";
const MODAL_ID = "daraz-login-modal";
let modalLoadPromise = null;

function getBsModal() {
    const modalEl = document.getElementById(MODAL_ID);
    if (!modalEl) return null;
    return bootstrap.Modal.getOrCreateInstance(modalEl);
}

export function openLoginModal() {
    loadModal().done(() => {
        const modal = getBsModal();
        if (modal) modal.show();
    });
}

export function closeLoginModal() {
    const modal = getBsModal();
    if (modal) modal.hide();
}

function onModalHidden() {
    DarazLogin.resetForm();
}

function loadModal() {
    if (document.getElementById(MODAL_ID)) {
        return $.Deferred().resolve().promise();
    }
    if (modalLoadPromise) {
        return modalLoadPromise;
    }

    modalLoadPromise = $.get("partials/login-modal.html")
        .done(html => {
            if (!document.getElementById(MODAL_ID)) {
                $("body").append(html);
            }
            $("#" + MODAL_ID).on("hidden.bs.modal", onModalHidden);
            DarazLogin.init();
        })
        .fail(() => {
            console.error("login-modal.js: could not load partials/login-modal.html");
        })
        .always(() => {
            if (!document.getElementById(MODAL_ID)) {
                modalLoadPromise = null;
            }
        });

    return modalLoadPromise;
}

function bindEvents() {
    $(document).on("click", LOGIN_SELECTOR, function (event) {
        const $link = $(this);
        if ($link.hasClass("dropdown-toggle")) return;
        event.preventDefault();
        openLoginModal();
    });

    $(document).on("daraz:login-close", closeLoginModal);
    $(document).on("daraz:login-success", () => {
        closeLoginModal();
        DarazAuth.updateLoginLinks();
    });
}

$(() => {
    loadModal();
    bindEvents();
});