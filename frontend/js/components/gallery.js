/**
 * Gallery Component - Handles image zoom, thumbnails, and preview.
 */
let productImages = [];
let currentImageIndex = 0;
const zoomState = {
    enabled: false,
    scale: 2,
    lensWidth: 240,
    lensHeight: 154
};

export function init(images) {
    productImages = images || [];
    currentImageIndex = 0;
    initImageZoom();
    initThumbnailSlider();
}

export function changeMainImage(src, thumbEl) {
    const $mainImg = $("#pdp-main-img");
    if ($mainImg.length) {
        $mainImg.attr("src", src);
    }
    syncZoomPreviewImage();
    const idx = productImages.indexOf(src);
    if (idx !== -1) currentImageIndex = idx;
    $(".thumb-item").removeClass("active");
    if (thumbEl) $(thumbEl).addClass("active");
}

export function goToImage(index) {
    if (productImages.length === 0) return;
    if (index < 0) index = productImages.length - 1;
    if (index >= productImages.length) index = 0;
    currentImageIndex = index;
    const $mainImg = $("#pdp-main-img");
    if ($mainImg.length) {
        $mainImg.attr("src", productImages[currentImageIndex]);
    }
    syncZoomPreviewImage();
    const $thumbs = $(".thumb-item");
    $thumbs.removeClass("active");
    const $active = $thumbs.eq(currentImageIndex);
    $active.addClass("active");
    const activeEl = $active.get(0);
    if (activeEl && typeof activeEl.scrollIntoView === "function") {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
}

function syncZoomPreviewImage() {
    const $mainImg = $("#pdp-main-img");
    const $preview = $("#pdp-zoom-preview");
    if (!$mainImg.length || !$preview.length) return;
    const src = $mainImg.attr("src");
    if (!src) return;
    $preview.css({
        backgroundImage: `url("${src}")`,
        backgroundSize: `${zoomState.scale * 100}%`
    });
}

function initImageZoom() {
    const $mainImageWrap = $(".pdp-main-image");
    const $preview = $("#pdp-zoom-preview");
    const $lens = $("#pdp-zoom-lens");
    if (!$mainImageWrap.length || !$preview.length || !$lens.length) return;

    $mainImageWrap.off("mouseenter mousemove mouseleave")
        .on("mouseenter", function () {
            if (!window.matchMedia("(min-width: 1025px)").matches) return;
            syncZoomPreviewImage();
            $preview.addClass("is-visible");
            $lens.addClass("is-visible");
        })
        .on("mousemove", function (e) {
            if (!window.matchMedia("(min-width: 1025px)").matches) return;
            const rect = $mainImageWrap[0].getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            let l = x - (zoomState.lensWidth / 2);
            let t = y - (zoomState.lensHeight / 2);
            l = Math.max(0, Math.min(rect.width - zoomState.lensWidth, l));
            t = Math.max(0, Math.min(rect.height - zoomState.lensHeight, t));
            $lens.css({ left: l, top: t });
            const rx = l / (rect.width - zoomState.lensWidth);
            const ry = t / (rect.height - zoomState.lensHeight);
            $preview.css("backgroundPosition", `${rx * 100}% ${ry * 100}%`);
        })
        .on("mouseleave", function () {
            $preview.removeClass("is-visible");
            $lens.removeClass("is-visible");
        });
}

function initThumbnailSlider() {
    const $thumbsTrack = $("#pdp-thumbs-track");
    if (!$thumbsTrack.length) return;

    $(".thumb-prev").off("click").on("click", () => scrollTrack(-1));
    $(".thumb-next").off("click").on("click", () => scrollTrack(1));

    function scrollTrack(dir) {
        const first = $thumbsTrack.find(".thumb-item").get(0);
        if (!first) return;
        const w = first.getBoundingClientRect().width + 10;
        $thumbsTrack[0].scrollBy({ left: dir * w * 4, behavior: "smooth" });
    }
}

export const DarazGallery = {
    init,
    changeMainImage,
    goToImage
};
