const checkoutUrl = "#checkout-link-needed";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

document.querySelectorAll("[data-checkout-link]").forEach((el) => {
  el.setAttribute("href", checkoutUrl);
  if (checkoutUrl.startsWith("#checkout")) {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      alert(
        "Launch step remaining: replace checkoutUrl in script.js with your Stripe, Gumroad, Lemon Squeezy, or payment link before sending traffic here."
      );
    });
  }
});
