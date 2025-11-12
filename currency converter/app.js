// Base URL for Fawaz Ahmed currency API via jsDelivr CDN.

const BASE_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const form = document.getElementById("converter-form");
const btn = form.querySelector("button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const swapBtn = document.getElementById("swap");

// Populate dropdowns
(function initDropdowns() {
  const codes = Object.keys(countryList).sort();
  dropdowns.forEach((select) => {
    select.innerHTML = ""; // clear first
    codes.forEach((currCode) => {
      const opt = document.createElement("option");
      opt.value = currCode;
      opt.textContent = currCode;
      if (select.name === "from" && currCode === "USD") opt.selected = true;
      if (select.name === "to" && currCode === "INR") opt.selected = true;
      select.append(opt);
    });

    // set initial flags
    updateFlag(select);

    select.addEventListener("change", (e) => updateFlag(e.target));
  });
})();

// Update flag image next to a <select>
function updateFlag(selectEl) {
  const currCode = selectEl.value;
  const countryCode = countryList[currCode];
  const img = selectEl.parentElement.querySelector("img");

  // Fallback to "UN" flag if mapping missing
  const finalCode = countryCode || "UN";
  img.src = `https://flagsapi.com/${finalCode}/flat/64.png`;
  img.alt = `${currCode} flag`;
}

// Fetch and display exchange rate
async function updateExchangeRate() {
  const amountInput = form.querySelector('input[name="amount"]');
  let amtVal = parseFloat(amountInput.value);

  if (isNaN(amtVal) || amtVal <= 0) {
    amtVal = 1;
    amountInput.value = "1";
  }

  const base = fromCurr.value.toLowerCase();
  const quote = toCurr.value.toLowerCase();
  const url = `${BASE_URL}/${base}.json`;

  msg.textContent = "Fetching rate…";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const baseObj = data[base];
    if (!baseObj || typeof baseObj[quote] !== "number") {
      throw new Error("Rate not available for selected currencies.");
    }

    const rate = baseObj[quote];
    const finalAmount = amtVal * rate;

    msg.textContent = `${amtVal} ${fromCurr.value} = ${finalAmount.toFixed(4)} ${toCurr.value}`;
  } catch (err) {
    console.error(err);
    msg.textContent = "Could not fetch rate. Try different currencies or check your internet.";
  }
}

// Swap currencies
swapBtn.addEventListener("click", () => {
  const temp = fromCurr.value;
  fromCurr.value = toCurr.value;
  toCurr.value = temp;

  updateFlag(fromCurr);
  updateFlag(toCurr);
  updateExchangeRate();
});

// Form submit
form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

// On page load
window.addEventListener("load", updateExchangeRate);
