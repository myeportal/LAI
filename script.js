const checkoutUrl = "#REPLACE_WITH_CHECKOUT_URL";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

document.querySelectorAll("[data-checkout-link]").forEach((el) => {
  el.setAttribute("href", checkoutUrl);
  if (checkoutUrl.startsWith("#REPLACE")) {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      alert(
        "Checkout link placeholder: replace checkoutUrl in script.js with your Stripe, Gumroad, Lemon Squeezy, or payment link."
      );
    });
  }
});
