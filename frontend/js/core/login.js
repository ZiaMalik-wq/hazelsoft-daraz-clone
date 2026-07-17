/**
 * Login Module - Handles authentication forms and user validation.
 */
import { DarazApi } from '../layers/api.js';
import { DarazAuth } from '../layers/auth.js';

const USERS_FILE = "data/users.json";
const PASSWORD_HIDDEN_ICON = "Images/eye-hidden.svg";
const PASSWORD_VISIBLE_ICON = "Images/eye-visible.svg";

let usersDb = [];
let usersLoaded = false;
let usersLoadFailed = false;
let refs = {};

function collectRefs() {
    refs = {
        tabs: $(".login-tab"),
        panelPassword: $("#panelPassword"),
        panelPhone: $("#panelPhone"),
        closeButton: $("#closeLoginBtn"),
        pwIdentifier: $("#pwIdentifier"),
        pwPassword: $("#pwPassword"),
        phoneNumber: $("#phoneNumber"),
        pwErr: $("#pwErr"),
        phoneErr: $("#phoneErr"),
        toast: null,
        passwordFormBtn: $("#passwordLoginBtn"),
        whatsappBtn: $("#whatsappLoginBtn"),
        togglePwBtn: $("#togglePwBtn")
    };
}

function switchTab(tabName) {
    const isPassword = tabName === "password";
    refs.panelPassword.css("display", isPassword ? "flex" : "none");
    refs.panelPhone.css("display", isPassword ? "none" : "flex");
    refs.tabs.each(function () {
        $(this).toggleClass("active", $(this).data("tab") === tabName);
    });
    clearErr("pwErr");
    clearErr("phoneErr");
}

function showErr(id, msg, $input) {
    $("#" + id).text(msg).addClass("show");
    if ($input) $input.addClass("error");
}

function clearErr(id, $input) {
    $("#" + id).text("").removeClass("show");
    if ($input) $input.removeClass("error");
    else $(".auth-input").removeClass("error");
}

export function resetForm() {
    $("#pwIdentifier, #pwPassword, #phoneNumber").val("").removeClass("error");
    $("#pwErr, #phoneErr").text("").removeClass("show");
    if (refs.toast) refs.toast.attr("class", "");
    switchTab("password");
    if (refs.pwPassword && refs.pwPassword.length) {
        refs.pwPassword.attr("type", "password");
        refs.togglePwBtn.find("img").attr("src", PASSWORD_HIDDEN_ICON);
    }
}

function normalizePhone(value) {
    return String(value || "").trim().replace(/^0/, "").replace(/\D/g, "");
}

function findByPasswordCredentials(identifier, password) {
    const normalizedIdentifier = normalizePhone(identifier);
    return usersDb.find(u => (u.email === identifier || normalizePhone(u.phone) === normalizedIdentifier) && u.password === password);
}

function findByPhone(phone) {
    return usersDb.find(u => normalizePhone(u.phone) === phone);
}

function ensureUsersReady(errId, $input) {
    if (!usersLoaded) {
        showErr(errId, "Please wait, loading login data...", $input);
        return false;
    }
    if (usersLoadFailed) {
        showErr(errId, "Login service is unavailable. Please refresh and try again.", $input);
        return false;
    }
    return true;
}

function finalizeLogin(user) {
    DarazAuth.saveCurrentUser(user);
    window.setTimeout(() => {
        $(document).trigger("daraz:login-success", [user]);
    }, 350);
}

function closeLogin() {
    $(document).trigger("daraz:login-close");
}

function handlePasswordLogin() {
    const $id = refs.pwIdentifier;
    const $pw = refs.pwPassword;
    const identifier = ($id.val() || "").trim();
    const password = $pw.val() || "";

    clearErr("pwErr");
    if (!identifier) {
        showErr("pwErr", "Please enter your phone number or email.", $id); return;
    }
    if (!ensureUsersReady("pwErr", $id)) return;

    const isEmail = identifier.indexOf("@") > -1;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = identifier.replace(/\D/g, "");

    if (isEmail && !emailRegex.test(identifier)) {
        showErr("pwErr", "Please enter a valid email address.", $id); return;
    } else if (!isEmail && (phoneDigits.length < 10 || phoneDigits.length > 13)) {
        showErr("pwErr", "Please enter a valid phone number.", $id); return;
    }

    if (!password) { showErr("pwErr", "Please enter your password.", $pw); return; }

    const user = findByPasswordCredentials(identifier, password);
    if (!user) {
        showErr("pwErr", "Incorrect credentials. Please try again.", $id);
        $pw.addClass("error");
        return;
    }
    finalizeLogin(user);
}

function handleWhatsappLogin() {
    const $ph = refs.phoneNumber;
    const phone = normalizePhone($ph.val());

    clearErr("phoneErr");
    if (!phone || phone.length < 10 || phone.length > 13) {
        showErr("phoneErr", "Please enter a valid phone number.", $ph); return;
    }
    if (!ensureUsersReady("phoneErr", $ph)) return;

    const user = findByPhone(phone);
    if (!user) { showErr("phoneErr", "No account found with this number.", $ph); return; }
    finalizeLogin(user);
}

function togglePasswordVisibility() {
    const $input = refs.pwPassword;
    const $img = refs.togglePwBtn.find("img");
    const isHidden = $input.attr("type") === "password";
    $input.attr("type", isHidden ? "text" : "password");
    $img.attr("src", isHidden ? PASSWORD_VISIBLE_ICON : PASSWORD_HIDDEN_ICON);
}

function bindEvents() {
    refs.tabs.off("click.login").on("click.login", function () {
        switchTab($(this).data("tab"));
    });
    refs.closeButton.off("click.login").on("click.login", closeLogin);
    refs.passwordFormBtn.off("click.login").on("click.login", handlePasswordLogin);
    refs.whatsappBtn.off("click.login").on("click.login", handleWhatsappLogin);
    refs.togglePwBtn.off("click.login").on("click.login", togglePasswordVisibility);

    refs.pwIdentifier.off("input.login").on("input.login", function () { clearErr("pwErr", $(this)); });
    refs.pwPassword.off("input.login").on("input.login", function () {
        clearErr("pwErr", $(this));
        refs.pwIdentifier.removeClass("error");
    });
    refs.phoneNumber.off("input.login").on("input.login", function () { clearErr("phoneErr", $(this)); });
}

function loadUsers() {
    usersLoaded = false;
    usersLoadFailed = false;
    return DarazApi.getUsers()
        .then(data => {
            usersDb = Array.isArray(data) ? data : [];
            usersLoaded = true;
        })
        .catch(error => {
            console.warn("login.js: could not load users DB.", error);
            usersDb = [];
            usersLoaded = true;
            usersLoadFailed = true;
        });
}

export function init() {
    collectRefs();
    if (refs.togglePwBtn.length && refs.pwPassword.length) {
        refs.togglePwBtn.find("img").attr("src", PASSWORD_HIDDEN_ICON);
    }
    bindEvents();
    loadUsers();
}

export const DarazLogin = {
    init,
    resetForm
};

// Expose for login-modal.js which is not yet a module
window.DarazLogin = DarazLogin;
