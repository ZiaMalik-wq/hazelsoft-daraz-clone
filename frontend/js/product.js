/**
 * Product page orchestration logic.
 */
import { DarazApi } from './layers/api.js';
import { DarazUtils } from './utils/helpers.js';
import { DarazTemplates } from './templates/components/cards.js';
import { DarazGallery } from './components/gallery.js';
import { DarazReviews } from './components/reviews.js';
import { DarazPDPTemplates } from './templates/pages/pdp.js';

// Global State
let productImages = [];
let activeQnaProduct = null;

function showNotFound() {
  document.title = "Product Not Found | Daraz";
  const $container = $(".pdp-container").first();
  if ($container.length) {
    $container.html(DarazPDPTemplates.createNotFoundHTML());
  }
}

function populateProduct(product, allProducts) {
  document.title = `${product.title} | Daraz`;
  productImages = product.images || [];

  const $mainImg = $("#pdp-main-img");
  if ($mainImg.length && productImages.length > 0) {
    $mainImg.attr("src", productImages[0]).attr("alt", product.title);
  }

  DarazGallery.init(productImages);

  const $thumbsTrack = $("#pdp-thumbs-track");
  if ($thumbsTrack.length) {
    $thumbsTrack.html(productImages.map((img, i) => `
      <button class="thumb-item${i === 0 ? ' active' : ''}" data-src="${img}" type="button">
        <img src="${img}" alt="Thumbnail ${i + 1}">
      </button>
    `).join(''));

    $thumbsTrack.find(".thumb-item").on("click mouseenter", function () {
      DarazGallery.changeMainImage($(this).attr("data-src"), this);
    });
  }

  $("#pdp-title").text(product.title);
  const stats = DarazUtils.getRatingStatsFromDistribution(product.ratingDistribution);
  $("#pdp-stars").html(DarazUtils.renderStars(stats.average, "small"));
  $("#pdp-rating-count").text(stats.total > 0 ? `${stats.total} Ratings` : "No Ratings");

  $("#pdp-brand-info").html(`
    <span class="brand-name">Brand: </span><a href="#">${product.brand}</a>
    <div class="brand-divider"></div>
    <span><a href="#">More from ${product.brand}</a></span>
  `);

  $("#pdp-price-current").text(`Rs. ${product.price.toLocaleString()}`);
  const oldPrice = DarazUtils.calculateOldPrice(product.price, product.discount);
  $("#pdp-old-price").text(oldPrice ? `Rs. ${oldPrice.toLocaleString()}` : "");
  $("#pdp-discount-tag").text(product.discount ? `-${product.discount}%` : "");

  const $variantsEl = $("#pdp-variants");
  if ($variantsEl.length) {
    if (product.variants?.options?.length > 0) {
      $variantsEl.html(`
        <h6 class="section-title">${product.variants.label}</h6>
        <div class="section-content">
          <span class="section-content-header">${product.variants.options[0]}</span>
          <div class="sku-prop-content">
            ${product.variants.options.map((opt, i) => `<span class="sku-option${i === 0 ? ' selected' : ''}">${opt}</span>`).join('')}
          </div>
        </div>
      `).show().find(".sku-option").on("click", function () {
        const $el = $(this);
        $el.closest(".sku-prop-content").find(".sku-option").removeClass("selected");
        $el.addClass("selected");
        $el.closest(".section-content").find(".section-content-header").text($el.text().trim());
      });
    } else {
      $variantsEl.empty().hide();
    }
  }

  const del = product.delivery || { method: "Standard Delivery", estimate: "", fee: 0 };
  $("#pdp-delivery-method").text(del.method);
  $("#pdp-delivery-estimate").text(`Guaranteed by ${del.estimate}`);
  $("#pdp-delivery-fee").text(`Rs. ${del.fee.toLocaleString()}`);

  $("#pdp-seller-card").html(DarazPDPTemplates.createSellerCardHTML(product.seller));
  $("#J_breadcrumb").html(DarazPDPTemplates.createBreadcrumbHTML(product.breadcrumbs));

  const $highlights = $("#pdp-highlights-list");
  if ($highlights.length) {
    if (product.highlights?.length > 0) {
      $highlights.html(product.highlights.map(h => `<li>${h}</li>`).join('')).closest(".pdp-highlights").show();
    } else {
      $highlights.closest(".pdp-highlights").hide();
    }
  }

  $("#pdp-detail-list").html(product.detailedContent?.map(d => `<li><div><span>${d}</span></div></li>`).join('') || "");
  $("#pdp-detail-images").html(product.detailImages?.map(img => `<p><img src="${img}" alt="Product Detail"></p>`).join('') || "");

  const $specs = $("#pdp-specifications");
  if ($specs.length && product.specifications) {
    $specs.html(DarazPDPTemplates.createSpecsHTML(product.specifications)).show();
  } else if ($specs.length) {
    $specs.hide();
  }

  DarazReviews.renderReviews(product);
  DarazReviews.renderReviewList(product);
  activeQnaProduct = product;
  DarazReviews.renderQnA(product);
  renderRecommendations(product, allProducts);
}

function renderRecommendations(current, all) {
  const selected = all.filter(p => p.id !== current.id).sort(() => 0.5 - Math.random()).slice(0, 4);
  $("#recommend-list").html(selected.map(p => DarazTemplates.createProductCardHTML(p)).join(''));
}

function initProductPage() {
  const id = parseInt(new URLSearchParams(window.location.search).get("id"), 10);
  if (!id || isNaN(id)) { showNotFound(); return; }

  Promise.all([DarazApi.getProducts(), DarazApi.getBrands(), DarazApi.getSellers(), DarazApi.getDeliveryMethods()]).then(results => {
    const [all, brands, sellers, deliveries] = results;
    const delMap = Object.fromEntries(deliveries.map(m => [m.id, m]));
    all.forEach(p => {
      p.brand = brands.find(b => b.id === p.brandId)?.name || "Unknown Brand";
      p.seller = sellers.find(s => s.id === p.sellerId);
      p.delivery = delMap[p.deliveryId] || { method: "Standard Delivery", estimate: "", fee: 0 };
    });
    const product = all.find(p => p.id === id);
    if (!product) { showNotFound(); return; }
    populateProduct(product, all);
  }).catch(e => { console.error("PDP: Error loading data", e); showNotFound(); });
}

$(() => {
  const $qty = $(".qty-value");
  $(".qty-btn.decrease").on("click", () => { let v = parseInt($qty.val()) || 1; if (v > 1) $qty.val(v - 1); });
  $(".qty-btn.increase").on("click", () => { let v = parseInt($qty.val()) || 1; let m = parseInt($qty.attr("max")) || 10; if (v < m) $qty.val(v + 1); });

  $("#view-more-btn").on("click", function () {
    const is = $("#pdp-detailed-content").toggleClass("expanded").hasClass("expanded");
    $(this).text(is ? "VIEW LESS" : "VIEW MORE");
  });

  $(document).on("daraz:login-success daraz:login-close", () => { if (activeQnaProduct) DarazReviews.renderQnA(activeQnaProduct); });
  initProductPage();
});