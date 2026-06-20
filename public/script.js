const checkoutUrl = "#checkout-link-needed";
const successUrl = "/thank-you.html";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

document.querySelectorAll("[data-checkout-link]").forEach((el) => {
  el.setAttribute("href", checkoutUrl);
  if (checkoutUrl.startsWith("#checkout")) {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      alert(
        `Launch step remaining: replace checkoutUrl in script.js with your Stripe Checkout or payment link, and set its success redirect to ${successUrl}.`
      );
    });
  }
});
