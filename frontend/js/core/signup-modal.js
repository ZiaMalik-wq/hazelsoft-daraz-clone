/**
 * Signup Modal Module - Handles loading and displaying the signup modal.
 */
import { openLoginModal } from './login-modal.js';

const SIGNUP_SELECTOR = ".js-signup-link";
const MODAL_ID = "daraz-signup-modal";
let modalLoadPromise = null;

function getBsModal() {
    const modalEl = document.getElementById(MODAL_ID);
    if (!modalEl) return null;
    return bootstrap.Modal.getOrCreateInstance(modalEl);
}

export function openSignupModal() {
    loadModal().done(() => {
        const modal = getBsModal();
        if (modal) modal.show();
    });
}

export function closeSignupModal() {
    const modal = getBsModal();
    if (modal) modal.hide();
}

function onModalHidden() {
    const phoneInput = document.getElementById("signupPhoneNumber");
    const agreeTerms = document.getElementById("agreeTerms");
    const err = document.getElementById("signupPhoneErr");
    if (phoneInput) phoneInput.value = "";
    if (agreeTerms) agreeTerms.checked = false;
    if (err) {
        err.textContent = "";
        err.classList.remove("show");
    }
}

function loadModal() {
    if (document.getElementById(MODAL_ID)) {
        return $.Deferred().resolve().promise();
    }
    if (modalLoadPromise) {
        return modalLoadPromise;
    }

    modalLoadPromise = $.get("partials/signup-modal.html")
        .done(html => {
            if (!document.getElementById(MODAL_ID)) {
                $("body").append(html);
            }
            $("#" + MODAL_ID).on("hidden.bs.modal", onModalHidden);

            // Close btn
            $(document).on("click", "#closeSignupBtn", () => {
                closeSignupModal();
            });

            // Switch to Login
            $(document).on("click", "#" + MODAL_ID + " .login-button", () => {
                closeSignupModal();
                setTimeout(() => {
                    openLoginModal();
                }, 300);
            });
        })
        .fail(() => {
            console.error("signup-modal.js: could not load partials/signup-modal.html");
        })
        .always(() => {
            if (!document.getElementById(MODAL_ID)) {
                modalLoadPromise = null;
            }
        });

    return modalLoadPromise;
}

function bindEvents() {
    $(document).on("click", SIGNUP_SELECTOR, function (event) {
        event.preventDefault();
        openSignupModal();
    });

    // Handle "Sign up" button click inside the login modal
    $(document).on("click", "#daraz-login-modal .signup-button", function (event) {
        event.preventDefault();
        const loginModalEl = document.getElementById("daraz-login-modal");
        if (loginModalEl) {
            const bsModal = bootstrap.Modal.getInstance(loginModalEl);
            if (bsModal) bsModal.hide();
        }
        setTimeout(() => {
            openSignupModal();
        }, 300);
    });
}

$(() => {
    loadModal();
    bindEvents();
});