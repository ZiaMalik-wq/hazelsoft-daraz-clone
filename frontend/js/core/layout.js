import { DarazApi } from '../layers/api.js';
import { DarazAuth } from '../layers/auth.js';
import { DarazHomeTemplates } from '../templates/pages/home.js';

$(function () {
  const $headerWrapper = $("#header-placeholder");
  const $header = $(".header");
  const $footer = $("#footer-placeholder");

  let topbarHiddenState = null;

  function getMobileMenuElements() {
    return {
      $mobileMenuToggle: $('.header__menu-toggle'),
      $mobileMenuDrawer: $('#mobile-menu-drawer'),
      $mobileMenuOverlay: $('#mobile-menu-overlay'),
      $mobileMenuClose: $('.mobile-menu-close')
    };
  }

  function setMobileMenuState(isOpen) {
    const { $mobileMenuToggle, $mobileMenuDrawer, $mobileMenuOverlay } = getMobileMenuElements();
    if (!$mobileMenuToggle.length || !$mobileMenuDrawer.length || !$mobileMenuOverlay.length) return;

    $('body').toggleClass('mobile-menu-open', isOpen);
    $mobileMenuToggle.attr('aria-expanded', String(isOpen));
    $mobileMenuDrawer.attr('aria-hidden', String(!isOpen));
  }

  function initMobileMenu() {
    const { $mobileMenuToggle, $mobileMenuDrawer, $mobileMenuOverlay, $mobileMenuClose } = getMobileMenuElements();
    if (!$mobileMenuToggle.length || !$mobileMenuDrawer.length || !$mobileMenuOverlay.length) return;

    $mobileMenuToggle.off('click.mobileMenu').on('click.mobileMenu', () => {
      const isOpen = !$('body').hasClass('mobile-menu-open');
      setMobileMenuState(isOpen);
    });

    if ($mobileMenuClose.length) {
      $mobileMenuClose.off('click.mobileMenu').on('click.mobileMenu', () => setMobileMenuState(false));
    }

    $mobileMenuOverlay.off('click.mobileMenu').on('click.mobileMenu', () => setMobileMenuState(false));

    $mobileMenuDrawer.off('click.mobileMenu', 'a').on('click.mobileMenu', 'a', () => setMobileMenuState(false));

    $(document).off('keydown.mobileMenu').on('keydown.mobileMenu', (event) => {
      if (event.key === 'Escape' && $('body').hasClass('mobile-menu-open')) {
        setMobileMenuState(false);
      }
    });
  }

  function populateMobileTopLinks() {
    const $mobileTopLinks = $('#mobile-menu-top-links');
    if (!$mobileTopLinks.length) return;

    const user = DarazAuth.getCurrentUser();
    $mobileTopLinks.empty();

    $('.topbar__item').each(function () {
      const $item = $(this);
      const $link = $item.find('.topbar__link');
      if (!$link.length) return;

      const label = $link.text().trim();
      if (!label) return;

      const normalizedLabel = label.toLowerCase();

      // If logged in, skip Sign Up link
      if (user && normalizedLabel.includes('sign up')) return;

      // Handle Logged In Account Dropdown for Mobile
      if ($item.hasClass('topbar__item--account') && user && user.name) {
        const $details = $('<details></details>').addClass('mobile-menu-group');
        const $summary = $('<summary></summary>').addClass('is-auth').text(label);
        const $ul = $('<ul></ul>').addClass('mobile-menu-category-list');

        $item.find('.account-dropdown__menu .account-dropdown__link').each(function () {
          const $orig = $(this);
          const $subLink = $('<a></a>').attr('href', $orig.attr('href') || '#').text($orig.text().trim());

          // Carry over important classes like logout
          if ($orig.hasClass('js-account-logout')) $subLink.addClass('js-account-logout');
          if ($orig.attr('id')) $subLink.attr('id', 'mobile-' + $orig.attr('id'));

          $ul.append($('<li></li>').append($subLink));
        });

        $details.append($summary).append($ul);
        $mobileTopLinks.append($('<li></li>').append($details));
        return;
      }

      const $a = $('<a></a>').attr('href', $link.attr('href') || '#').text(label);

      if (normalizedLabel.includes('login') || normalizedLabel.includes('sign up')) $a.addClass('is-auth');
      else if (normalizedLabel.includes('sell on daraz')) $a.addClass('is-seller');
      else if (normalizedLabel.includes('help')) $a.addClass('is-help');
      else if (normalizedLabel.includes('save more on app')) $a.addClass('is-app');

      // Add appropriate modal triggers if NOT logged in
      if (normalizedLabel.includes('login')) {
        $a.addClass('js-login-link');
      } else if (normalizedLabel.includes('sign up')) {
        $a.addClass('js-signup-link');
      }

      $mobileTopLinks.append($('<li></li>').append($a));
    });

    $mobileTopLinks.append($('<li></li>').append($('<a></a>').attr('href', '#').text('Messages').addClass('is-messages')));
  }

  window.populateMobileTopLinks = populateMobileTopLinks;

  // HEADER
  if ($headerWrapper.length) {
    $headerWrapper.load("partials/header.html", function () {
      const $actualHeader = $(".header"); // Select it after load

      // Product page only: hot links below the main header bar
      if ($headerWrapper.data("hotlinks")) {
        $actualHeader.append(`
          <div class="header__hot-links">
            <a href="#" class="header__hot-link">makeup</a>
            <a href="#" class="header__hot-link">watch for boys</a>
            <a href="#" class="header__hot-link">bags for girls</a>
            <a href="#" class="header__hot-link">airpods</a>
            <a href="#" class="header__hot-link">bra for girls</a>
          </div>
        `);

        // Product page only: category nav menu below header
        $headerWrapper.append(`
          <div class="nav-menu">
            <div class="nav-menu__container">
              <div class="nav-menu__category">
                <span class="nav-menu__category-text">
                  Categories <i class="fa-solid fa-chevron-down nav-menu__category-arrow"></i>
                </span>
                <div class="nav-menu__dropdown" id="J_nav_menu">
                  <!-- Dynamic menu inserted by product.js -->
                </div>
              </div>
            </div>
          </div>
        `);

        // Product page only: extra mobile menu categories section
        $("#mobile-menu-drawer").append(`
          <div class="mobile-menu-section">
            <h3 class="mobile-menu-title">Categories</h3>
            <div id="mobile-menu-categories"></div>
          </div>
        `);
      }

      // Notify scripts that depend on header/nav DOM being present.
      $(document).trigger("daraz:header-ready");
      loadNavCategories();
      populateMobileTopLinks();
      initMobileMenu();

      // Initialize scroll handling after header is loaded
      updateMainHeaderState();
      $(window).on("scroll", updateMainHeaderState).on("resize", () => {
        updateDesktopNavOffset();
        if ($(window).width() > 768) setMobileMenuState(false);
      });
    });
  }

  function updateMainHeaderState() {
    const $actualHeader = $(".header");
    if (!$actualHeader.length || !$headerWrapper.length) return;

    const scrollTop = $(window).scrollTop();
    if (topbarHiddenState === null) topbarHiddenState = $headerWrapper.hasClass("is-topbar-hidden");

    let newState = topbarHiddenState;
    if (topbarHiddenState && scrollTop < 145) newState = false;
    else if (!topbarHiddenState && scrollTop > 170) newState = true;

    if (newState !== topbarHiddenState) {
      topbarHiddenState = newState;
      $headerWrapper.toggleClass("is-topbar-hidden", topbarHiddenState);
      updateDesktopNavOffset();
    }

    $actualHeader.toggleClass("is-scrolled", scrollTop > 10);
  }

  function updateDesktopNavOffset() {
    const $desktopNavMenu = $(".nav-menu");
    const $actualHeader = $(".header");
    if (!$desktopNavMenu.length) return;

    if (!window.matchMedia("(min-width: 1025px)").matches) {
      $desktopNavMenu.css("--desktop-nav-top", "0px");
      return;
    }

    // Only calculate height when needed (state changes or resize)
    const h = Math.round($headerWrapper.outerHeight() || $actualHeader.outerHeight() || 0);
    $desktopNavMenu.css("--desktop-nav-top", `${h}px`);
  }

  function loadNavCategories() {
    const $desktop = $('#J_nav_menu');
    const $mobile = $('#mobile-menu-categories');
    if (!$desktop.length && !$mobile.length) return;

    DarazApi.getNavCategories().then(data => {
      const cats = data['nav-categories'] || data.categories || [];
      if ($desktop.length) $desktop.html(DarazHomeTemplates.createNavMenuHTML(cats));
      if ($mobile.length) $mobile.html(DarazHomeTemplates.createMobileCategoryLinks(cats));
    }).catch(e => console.error('Layout: Error loading nav categories', e));
  }

  // FOOTER
  if ($footer.length) {
    $footer.load("partials/footer.html", function () {

      // Index page only: SEO section goes AFTER the second footer block
      if ($footer.data("seo")) {
        const $seoSection = $(`
          <section class="footer__seo">
            <div class="footer__container">

              <!-- COLUMN 1: Brand Story -->
              <div class="footer__seo-content">
                <div class="footer__seo-grid">
                  <h1 class="footer__seo-title">How Daraz Transformed Online Shopping in Pakistan</h1>
                  <p class="footer__seo-text">
                    Daraz first made waves in Pakistan's e-commerce market after its introduction in 2012.
                    We have since grown to become Pakistan's largest platform for online shopping with a network
                    spread across Asia in Pakistan, Bangladesh, Sri Lanka, Myanmar, and Daraz.com. Our vision
                    was to provide a safe, efficient online marketplace platform for vendors and customers across
                    the country to come together. We started off exclusively as an online fashion retail platform
                    and over the years expanded to become a complete one-stop solution for all your buying needs.
                    Daraz prides itself on not being just another ecommerce venture in Asia. We work tirelessly to
                    make sure that we provide users with the best online shopping experience and value for their
                    purchases. Whether you shop online through our website or our online shopping mobile App, you
                    can expect easy navigation, customized recommendations, and a smooth online shopping experience
                    guaranteed.
                  </p>

                  <h3 class="footer__seo-title">What Makes Us Different from Other Online Shopping Platforms?</h3>

                  <div class="footer__seo-text">
                    <span class="footer__seo-bold">Largest Online Marketplace in Pakistan</span><br />
                    With over 15 million products to select from, Daraz offers its customers the most comprehensive
                    listing of products in the country. Whether you're looking for electronics, apparel, appliances,
                    or groceries – there is something for everyone.
                  </div>

                  <div class="footer__seo-text">
                    <span class="footer__seo-bold">Hassle Free Delivery</span><br />
                    Online shopping is only as good as its execution and Daraz promises hassle free delivery right
                    from the moment you order to when your package is dropped at your door. We cater to both major
                    and smaller cities alike, and give you the choice to track your package as it makes its way to
                    you so you always know your order status. If you are unsatisfied with any aspect of your order,
                    we have a simple 7-day return or exchange policy.
                  </div>

                  <div class="footer__seo-text">
                    <span class="footer__seo-bold">Payment Options to Suit Every Style</span><br />
                    You can choose to pay through a credit/debit card, opt for cash on delivery or even go for EMI
                    (easy monthly instalments). You can also avail exclusive offers by downloading Daraz Wallet – a
                    closed loop digital wallet that offers you a secure, easy way to make payments. We also have
                    easypaisa & jazzcash payment method for our customers' ease.
                  </div>

                  <div class="footer__seo-text">
                    <span class="footer__seo-bold">Shop from Verified Vendors</span><br />
                    Daraz understands that online shopping in Pakistan comes with its fair share of risks. This is
                    why with Daraz Marketplace and Daraz Mall customers have the security of choosing from verified
                    vendors and brands from Karachi, Lahore, Islamabad and all across Pakistan.
                  </div>

                  <div class="footer__seo-text">
                    <span class="footer__seo-bold">Shop Around the World with Daraz Global Collection</span><br />
                    International sellers and local convenience come together with Daraz Global collection. Get the
                    chance to shop online from vendors around the world without leaving the Daraz website.
                  </div>

                  <div class="footer__seo-text">
                    <span class="footer__seo-bold">Avail Exclusive Discounts, Offers, and Promotions</span><br />
                    Online shopping with Daraz means you get the chance to avail exclusive online-only promotional
                    packages as well as discount vouchers from our vendors when you shop from their pages.
                  </div>

                  <div class="footer__seo-text">
                    <span class="footer__seo-bold">Buy Value, not Just Goods with Daraz Care</span><br />
                    Daraz does not just cater online shopping in Pakistan but also aims to simplify the way you give
                    back to society. With charities spanning across sectors of education, health care, environmental
                    preservation, and shelters, you can choose to make a big difference with a few, simple clicks.
                  </div>

                  <div class="footer__seo-text">
                    <span class="footer__seo-bold">Simplify Corporate Purchases</span><br />
                    Who says corporate purchases need to be a complicated affair? When you opt for Daraz Corporate,
                    you get an efficient and transparent solution for your business' bulk purchasing needs.
                  </div>
                </div>
              </div>

              <!-- COLUMN 2: Top Categories (25%) -->
              <div class="footer__col footer__seo-categories">
                <div class="footer__seo-category-wrapper">
                  <h3 class="footer__seo-title">Top Categories & Brands</h3>

                  <h4 class="footer__seo-label">MOBILE PHONES</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Apple iPhones</a>, <a href="#">Honor Mobiles</a>,
                    <a href="#">Huawei Mobiles</a>, <a href="#">Tecno Mobiles</a>,
                    <a href="#">Redmi Mobiles</a>, <a href="#">Xiaomi Mi Mobiles</a>,
                    <a href="#">Nokia Mobiles</a>, <a href="#">OnePlus Mobiles</a>,
                    <a href="#">Oppo Mobile Phones</a>, <a href="#">Realme Mobiles</a>,
                  </div>

                  <h4 class="footer__seo-label">LATEST LAPTOPS</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Dell Laptops</a>, <a href="#">HP Laptops</a>,
                    <a href="#">Lenovo Laptops</a>, <a href="#">Mouse</a>,
                    <a href="#">Gaming Graphic Cards</a>, <a href="#">lenovo ideapad 3</a>,
                  </div>

                  <h4 class="footer__seo-label">LED TV</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Changhong Led Tv</a>, <a href="#">LG Led Tv</a>,
                    <a href="#">Samsung Led Tv</a>, <a href="#">Sony Led Tv</a>,
                    <a href="#">TCL LED TVs</a>
                  </div>

                  <h4 class="footer__seo-label">HOME APPLIANCES</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Microwave oven</a>, <a href="#">Geyser</a>,
                    <a href="#">Heater</a>, <a href="#">Refrigerators</a>,
                    <a href="#">Deep Freezers</a>, <a href="#">Generators</a>,
                    <a href="#">Wall Fans</a>, <a href="#">Exhaust Fans</a>,
                    <a href="#">Pedestal Fans</a>, <a href="#">Window Ac</a>,
                    <a href="#">Solar Panel</a>, <a href="#">Washing Machine</a>
                  </div>

                  <h4 class="footer__seo-label">DSLR CAMERAS</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Camera Tripods</a>, <a href="#">Drones</a>,
                    <a href="#">IP & CCTV Cameras</a>, <a href="#">Nikon D7000</a>,
                    <a href="#">Nikon D5600</a>, <a href="#">Canon 200D</a>,
                    <a href="#">Canon 1200D</a>, <a href="#">Fujifilm Instax Mini 11</a>,
                    <a href="#">Canon M50</a>
                  </div>

                  <h4 class="footer__seo-label">HEALTH & BEAUTY</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">sunisa foundation</a>, <a href="#">Biofad</a>,
                    <a href="#">janssen facial kit</a>, <a href="#">Glutathione Injection</a>,
                    <a href="#">Glutathione Cream</a>, <a href="#">Sauvage</a>,
                    <a href="#">Glutathione Tablets</a>, <a href="#">Glutathione Soap</a>,
                    <a href="#">Infrared Thermometers</a>, <a href="#">N95 Mask</a>
                  </div>

                  <h4 class="footer__seo-label">TRENDING</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Online Bills</a>, <a href="#">Core I5 Laptop</a>,
                    <a href="#">Gtx 1060</a>, <a href="#">Samsung A32</a>,
                    <a href="#">Samsung A51</a>, <a href="#">Samsung A52</a>,
                    <a href="#">Samsung A71</a>, <a href="#">Samsung A72</a>,
                    <a href="#">Vivo V20</a>, <a href="#">Poco X3 Pro</a>,
                    <a href="#">Vivo V21</a>, <a href="#">Vivo V21E</a>,
                    <a href="#">Vivo X70 Pro</a>, <a href="#">Vivo Y12</a>,
                    <a href="#">Oppo F19 Pro</a>, <a href="#">Oppo Reno 6</a>,
                    <a href="#">Xiaomi Poco F3</a>, <a href="#">Xiaomi Poco M3</a>,
                    <a href="#">Sharp Aquos R2</a>
                  </div>
                </div>
              </div>

              <!-- COLUMN 3: More Categories (25%) -->
              <div class="footer__col footer__seo-categories">
                <div class="footer__seo-category-wrapper">
                  <h4 class="footer__seo-label" style="margin-top:31px">WOMEN'S FASHION</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Al-Karam Studio</a>, <a href="#">Warda</a>,
                    <a href="#">Salitex</a>, <a href="#">Bonanza Satrangi</a>,
                    <a href="#">Edenrobe</a>, <a href="#">Firdous</a>,
                    <a href="#">Junaid Jamshed</a>, <a href="#">Limelight</a>,
                    <a href="#">Sana Safinaz</a>, <a href="#">Mahru</a>,
                    <a href="#">Pushup Bra</a>, <a href="#">Women Undergarments</a>
                  </div>

                  <h4 class="footer__seo-label">MEN'S FASHION</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Men's Shirts</a>, <a href="#">Men's T-Shirts</a>
                  </div>

                  <h4 class="footer__seo-label">ONLINE GROCERY STORE</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Oil & Ghee</a>, <a href="#">Basmati Rice</a>,
                    <a href="#">Dried Fruits</a>, <a href="#">Chocolates</a>,
                    <a href="#">Mattresses</a>
                  </div>

                  <h4 class="footer__seo-label">ONLINE BOOK STORE</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">English Books</a>, <a href="#">Islamic Books</a>,
                    <a href="#">History Books</a>, <a href="#">English Literature Books</a>,
                    <a href="#">Kids Urdu Stories</a>, <a href="#">Pride & Prejudice</a>,
                    <a href="#">Harry Potter Story Books</a>, <a href="#">Namal Novel</a>,
                    <a href="#">Nimra Ahmed Novels</a>
                  </div>

                  <h4 class="footer__seo-label">AIR CONDITIONERS</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Kenwood Ac</a>, <a href="#">Haier Ac</a>,
                    <a href="#">Gree Ac</a>, <a href="#">Dawlance Ac</a>,
                    <a href="#">Orient Ac</a>, <a href="#">Ecostar Ac</a>,
                    <a href="#">Inverex Solar Ac</a>, <a href="#">Pel Ac</a>
                  </div>

                  <h4 class="footer__seo-label">TOP MOBILE PHONES</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Nokia G20</a>, <a href="#">redmi 9</a>,
                    <a href="#">realme 7 pro</a>, <a href="#">realme c15</a>,
                    <a href="#">iPhone 11</a>, <a href="#">iPhone 12</a>,
                    <a href="#">iphone 12 Pro Max</a>, <a href="#">iPhone 12 Pro</a>,
                    <a href="#">Oppo A15</a>, <a href="#">Oppo A54</a>,
                    <a href="#">Samsung A02S</a>, <a href="#">Samsung A11</a>,
                    <a href="#">Samsung A12</a>, <a href="#">Samsung A31</a>,
                    <a href="#">Vivo Y33s</a>, <a href="#">Infinix Note 11</a>,
                    <a href="#">Samsung Tab A7 Lite</a>
                  </div>

                  <h4 class="footer__seo-label">SHOP WORLDWIDE WITH LAZADA</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Singapore</a>, <a href="#">Malaysia</a>,
                    <a href="#">Philippines</a>, <a href="#">Indonesia</a>,
                    <a href="#">Vietnam</a>, <a href="#">Thailand</a>
                  </div>

                  <h4 class="footer__seo-label">SHOP WORLDWIDE WITH MIRAVIA</h4>
                  <div class="footer__tag-cloud">
                    <a href="#">Spain</a>, <a href="#">Portugal</a>
                  </div>
                </div>
              </div>

            </div>
          </section>
        `);

        const $secondFooterBlock = $footer.children(".footer").eq(1);
        if ($secondFooterBlock.length) {
          $secondFooterBlock.after($seoSection);
        } else {
          $footer.append($seoSection);
        }
      }
    });
  }
});
