// main.js

// 1. import intl-tel-input as ES module
import intlTelInput from "https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.2/esm/index.js";

// 2. provide utils via loadUtils (this gives us validation + formatting)
const loadUtils = () =>
  import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.2/build/js/utils.js");

// 3. limit countries + custom country labels
const allowedCountries = [
  "de", // Germany
  "rs", // Serbia
  "hr", // Croatia
  "ba", // Bosnia and Herzegovina
  "xk", // Kosovo
  "me", // Montenegro
  "mk", // North Macedonia
  "si", // Slovenia
  "al", // Albania
  "at"  // Austria
];

// i18n map: keys MUST match intl-tel-input's internal English country names
// values = what shows in the dropdown
const i18n = {
  "Germany": "Njemačka",
  "Serbia": "Srbija",
  "Croatia": "Hrvatska",
  "Bosnia and Herzegovina": "Bosna i Hercegovina",
  "Kosovo": "Kosovo",
  "Montenegro": "Crna Gora",
  "North Macedonia": "Makedonija",
  "Slovenia": "Slovenija",
  "Albania": "Albanija",
  "Austria": "Austrija"
};

// 4. grab DOM elements
const input    = document.querySelector("#Telefonnummer-3");
const errorMsg = document.querySelector("#error-msg");
const validMsg = document.querySelector("#valid-msg");
const form     = document.querySelector("#demo-form");

// guard if markup not present
if (!input) {
  console.warn('Phone input "#Telefonnummer-3" not found.');
} else {
  // 5. init intl-tel-input
  const iti = intlTelInput(input, {
    initialCountry: "de",
    onlyCountries: allowedCountries,
    i18n,
    separateDialCode: false,
    loadUtils // <- gives us proper validation and formatting
  });

  // map error codes from intl-tel-input to messages
  const errorTextByCode = [
    "Invalid number",
    "Invalid country code",
    "Too short",
    "Too long",
    "Invalid number"
  ];

  function resetValidationUI() {
    input.classList.remove("error");

    if (errorMsg) {
      errorMsg.textContent = "";
      errorMsg.classList.add("hide");
    }

    if (validMsg) {
      validMsg.classList.add("hide");
    }
  }

  function showValid() {
    if (!validMsg) return;
    validMsg.textContent = "Valid number";
    validMsg.classList.remove("hide");
    validMsg.style.color = "green";
  }

  function showError(code) {
    if (!errorMsg) return;
    const text = errorTextByCode[code] || "Invalid number";
    errorMsg.textContent = text;
    errorMsg.classList.remove("hide");
    errorMsg.style.color = "red";
    input.classList.add("error");
  }

  // on blur → validate using real libphonenumber logic
  input.addEventListener("blur", async () => {
    resetValidationUI();

    const raw = input.value.trim();
    if (!raw) return;

    // make sure utils are loaded before first validation
    await loadUtils();

    if (iti.isValidNumber()) {
      showValid();
    } else {
      const code = iti.getValidationError();
      showError(code);
    }
  });

  // while typing/change → hide messages again
  input.addEventListener("input", resetValidationUI);
  input.addEventListener("change", resetValidationUI);

  // on submit:
  //  - rewrite field value to full international format (e.g. "+4917612345678")
  //  - then let the form submit normally (to whatever action you set in HTML)
  if (form) {
    form.addEventListener("submit", async (e) => {
      // optional: remove this preventDefault if you want REAL submit
      e.preventDefault();

      await loadUtils();
      const internationalNumber = iti.getNumber(); // "+49..."

      // write normalized value back into input before submit
      input.value = internationalNumber;

      // At this point:
      // - you could now actually submit the form (uncomment below)
      // form.submit();

      // or send via fetch:
      // fetch('/your-endpoint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phone: internationalNumber })
      // });
    });
  }
}
