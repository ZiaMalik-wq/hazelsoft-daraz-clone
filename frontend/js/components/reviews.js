/**
 * Reviews Component - Handles rendering reviews and Q&A.
 */
import { DarazUtils } from '../utils/helpers.js';
import { DarazAuth } from '../layers/auth.js';

export function renderReviews(product) {
    $("#pdp-review-title").text(`Ratings & Reviews of ${product.title}`);
    const stats = DarazUtils.getRatingStatsFromDistribution(product.ratingDistribution);
    $("#review-score-average").text(stats.average.toFixed(1));
    $("#review-stars-average").html(DarazUtils.renderStars(stats.average, "large"));
    $("#review-count").text(`${stats.total} Ratings`);

    const $list = $("#review-distribution-list");
    if (!$list.length) return;

    let html = "";
    for (let i = 0; i < 5; i++) {
        const level = 5 - i;
        const count = stats.distribution[i];
        const percent = stats.total > 0 ? (count / stats.total * 100).toFixed(2) : 0;
        html += `
            <li>
                <div class="container-star progress-title">${DarazUtils.renderStars(level, "small")}</div>
                <span class="progress-wrap">
                    <div class="pdp-review-progress">
                        <div class="bar bg"></div>
                        <div class="bar fg" style="width: ${percent}%;"></div>
                    </div>
                </span>
                <span class="percent">${count}</span>
            </li>
        `;
    }
    $list.html(html);
}

export function renderReviewList(product) {
    const $container = $("#product-reviews-list");
    if (!$container.length) return;
    if (!product.reviews || product.reviews.length === 0) {
        $container.html("<div class='no-reviews-message'>No reviews yet.</div>");
        return;
    }

    let html = "";
    product.reviews.forEach(review => {
        let imagesHtml = "";
        if (review.images && review.images.length > 0) {
            let imageTags = "";
            review.images.forEach(img => {
                imageTags += `<img src="${img}" alt="Review image">`;
            });
            imagesHtml = `<div class="review-images">${imageTags}</div>`;
        }

        let sellerReplyHtml = "";
        if (review.sellerReply) {
            sellerReplyHtml = `
                <div class="seller-reply">
                    <div class="reply-title">
                        <i class="fa-solid fa-store seller-badge-icon"></i>
                        <span>Seller Response - ${DarazUtils.timeAgo(review.sellerReply.date)}</span>
                    </div>
                    <div class="content">${review.sellerReply.content}</div>
                    <div class="bottom">
                        <div class="like-action">
                            <i class="fa-solid fa-thumbs-up like-icon"></i>
                            <span>0</span>
                        </div>
                        <i class="fa-solid fa-ellipsis-vertical more-options"></i>
                    </div>
                </div>
            `;
        }

        html += `
            <div class="item">
                <div class="top">
                    <div class="container-star starCtn">${DarazUtils.renderStars(review.rating, "medium")}</div>
                    <span class="date">${DarazUtils.timeAgo(review.date)}</span>
                </div>
                <div class="middle">
                    <span class="author">${review.author}</span>
                    ${review.verified ? '<img src="Images/verify.png" class="verify-badge" width="15" height="16" alt="Verified"><span class="verify-text">Verified Purchase</span>' : ""}
                </div>
                <div class="item-content">
                    <div class="content">${review.content}</div>
                    ${imagesHtml}
                    <div class="sku-info">Color Family: ${review.color || 'N/A'}, Size: ${review.size || 'N/A'}</div>
                    <div class="bottom">
                        <div class="like-action">
                            <i class="fa-solid fa-thumbs-up like-icon"></i>
                            <span>${review.likes || 0}</span>
                        </div>
                        <i class="fa-solid fa-ellipsis-vertical more-options"></i>
                    </div>
                    ${sellerReplyHtml}
                </div>
            </div>
        `;
    });
    $container.html(html);
}

function attachQnAEvents(product) {
    const $container = $("#qna-content-area");
    const $askBox = $container.find(".js-qna-ask-box");
    const $foldedInput = $container.find(".js-qna-folded-input input");
    const $unfoldedInputWrapper = $container.find(".js-qna-unfolded-input");
    const $unfoldedInput = $unfoldedInputWrapper.find("textarea");
    const $askBtn = $container.find(".js-ask-btn");
    const $lenSpan = $container.find(".qna-input-length");

    if (!$askBox.length) return;

    $foldedInput.on("focus", function () {
        $askBox.removeClass("folded").addClass("unfolded");
        $unfoldedInput.val($foldedInput.val()).focus();
    });

    $unfoldedInput.on("input", function () {
        const val = $(this).val();
        $lenSpan.text(val.length + "/300");
    });

    $askBtn.on("click", function () {
        const questionText = $unfoldedInput.is(":visible") ? $unfoldedInput.val().trim() : $foldedInput.val().trim();
        if (!questionText) {
            alert("Please enter a question.");
            return;
        }

        if (!product.questions) {
            product.questions = [];
        }

        const user = DarazAuth.getCurrentUser() || { name: "User" };
        const d = new Date();
        const dateStr = d.getDate() + " " + d.toLocaleString('en-US', { month: 'short' }) + " " + d.getFullYear();

        product.questions.unshift({
            question: questionText,
            asker: user.name,
            date: dateStr,
            answer: "Thank you for your question. The seller is reviewing it and will answer soon.",
            answerDate: dateStr
        });

        renderQnA(product);
    });
}

export function renderQnA(product) {
    const $container = $("#qna-content-area");
    if (!$container.length) return;

    const user = DarazAuth.getCurrentUser();
    const isLoggedIn = !!(user && user.name);
    const sellerName = product.seller && product.seller.name ? product.seller.name : "Seller";

    let askBoxHtml = "";
    if (isLoggedIn) {
        askBoxHtml = `
          <div class="qna-ask-box-container">
            <div class="qna-ask-box folded js-qna-ask-box">
              <span class="qna-input-wrapper qna-input-single qna-ask-input js-qna-folded-input">
                <input placeholder="Enter your question(s) here" maxlength="300" type="text" value="">
              </span>
              <span class="qna-input-wrapper qna-input-multiple qna-ask-input js-qna-unfolded-input">
                <textarea placeholder="Enter your question(s) here" rows="5" maxlength="300"></textarea>
                <span class="qna-input-control"><span class="qna-input-length">0/300</span></span>
              </span>
              <div class="qna-ask-box-tips js-qna-tips">Question should not contain details like email, phone or web links...</div>
              <button type="button" class="qna-ask-btn js-ask-btn">ASK QUESTIONS</button>
            </div>
          </div>
        `;
    } else if (product.questions && product.questions.length > 0) {
        askBoxHtml = `
          <div class="qna-login-tips">
            <span><a href="#" class="qna-link js-login-link">Login</a> or <a href="#" class="qna-link">Register</a> to ask questions</span>
          </div>
        `;
    }

    let questionsHtml = "";
    if (!product.questions || product.questions.length === 0) {
        questionsHtml = `
          <div class="qna-empty-state">
            <i class="fa-regular fa-comment-dots qna-empty-icon"></i>
            <div class="qna-empty-text">There are no questions yet.</div>
          </div>
        `;
    } else {
        questionsHtml = `
          <div class="qna-section-title">Other questions answered by ${sellerName} (${product.questions.length})</div>
          <ul class="qna-list">
        `;
        product.questions.forEach(q => {
            questionsHtml += `
              <li class="qna-item">
                <div class="qna-group">
                  <div class="qna-badge badge-q">Q</div>
                  <div class="qna-content-wrap">
                    <div class="qna-text">${q.question}</div>
                    <div class="qna-meta">${q.asker} - ${q.date}</div>
                  </div>
                </div>
                <div class="qna-group">
                  <div class="qna-badge badge-a">A</div>
                  <div class="qna-content-wrap">
                    <div class="qna-text">${q.answer}</div>
                    <div class="qna-meta">${q.answerDate}</div>
                  </div>
                </div>
              </li>
            `;
        });
        questionsHtml += `</ul>`;
    }

    $container.html(askBoxHtml + questionsHtml);
    attachQnAEvents(product);
}

export const DarazReviews = {
    renderReviews,
    renderReviewList,
    renderQnA
};
