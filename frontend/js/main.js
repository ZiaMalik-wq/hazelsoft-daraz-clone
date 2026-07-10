/**
 * Main application entry point for the index page.
 */
import { DarazApi } from './layers/api.js';
import { SectionsModule } from './sections.js';
import { DarazHomeTemplates } from './templates/pages/home.js';

// Selectors & Global Variables
const $liftNav = $('.c-lift-nav');
const $slidesContainer = $('#slides-container');
const $nextButton = $('.banner__nav--next');
const $prevButton = $('.banner__nav--prev');
const $pagination = $('.banner__pagination');

let index = 0;
let autoSlideTimer = null;
let slideCount = 0;

function initLiftNav() {
    if (!$liftNav.length) return;

    const $items = $liftNav.find('.c-lift-nav__item');
    const selectors = [null, '#flash-sale-section', '#categories-section', '#jfy-section'];
    
    $items.each(function (idx) {
        $(this).on('click', () => {
            if (idx === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
            else {
                const $t = $(selectors[idx]);
                if ($t.length) window.scrollTo({ top: $t.offset().top, behavior: 'smooth' });
            }
        });
    });

    $(window).on('scroll', () => $liftNav.toggle($(window).scrollTop() >= 220));
}

function initSlider() {
    if (!$pagination.length || slideCount === 0) return;
    $pagination.empty();

    for (let i = 0; i < slideCount; i++) {
        $('<span class="banner__bullet"></span>').on('click', () => {
            stopAutoSlide(); index = i; showSlide(index); startAutoSlide();
        }).appendTo($pagination);
    }
    updatePagination(0);
    startAutoSlide();
}

function showSlide(i) {
    if ($slidesContainer.length) {
        $slidesContainer.css('transform', `translateX(-${i * 100}%)`);
        updatePagination(i);
    }
}

function nextSlide() { if (slideCount > 0) { index = (index + 1) % slideCount; showSlide(index); } }
function prevSlide() { if (slideCount > 0) { index = (index - 1 + slideCount) % slideCount; showSlide(index); } }

function updatePagination(idx) {
    $pagination.find('.banner__bullet').each(function (i) { $(this).toggleClass('banner__bullet--active', i === idx); });
}

function startAutoSlide() { stopAutoSlide(); autoSlideTimer = setInterval(nextSlide, 4000); }
function stopAutoSlide() { if (autoSlideTimer) { clearInterval(autoSlideTimer); autoSlideTimer = null; } }

function loadBanners() {
    if (!$slidesContainer.length) return;
    DarazApi.getBanners().then(banners => {
        slideCount = banners.length;
        $slidesContainer.html(banners.map(b => DarazHomeTemplates.createBannerHTML(b)).join(''));
        initSlider();
    }).catch(e => console.error("Main: Error loading banners", e));
}

function initApp() {
    initLiftNav();
    SectionsModule.initJfyLoadMore();

    $nextButton.on('click', () => { stopAutoSlide(); nextSlide(); startAutoSlide(); });
    $prevButton.on('click', () => { stopAutoSlide(); prevSlide(); startAutoSlide(); });

    loadBanners();
    SectionsModule.loadSectionsAndProducts();
}

$(() => {
    initApp();
});