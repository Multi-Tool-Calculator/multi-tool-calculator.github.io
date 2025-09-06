// calculate gold values (pure value considering karat)
function calculateGoldValue(weight, purityKarat = 24, ratePerGram) {
  // purityKarat is between 1..24
  if (!validateNumericInput(weight, 0.001)) {
    throw new Error("Please enter a valid weight greater than 0");
  }
  if (!validateNumericInput(ratePerGram, 0.01)) {
    throw new Error("Please enter a valid gold rate greater than 0");
  }
  if (!validateNumericInput(purityKarat, 1, 24)) {
    throw new Error("Please enter a valid purity between 1 and 24 karats");
  }

  const purityRatio = purityKarat / 24; // e.g. 22/24
  const baseValue = weight * ratePerGram; // 24K equivalent value (if purity were 24)
  const actualValue = baseValue * purityRatio; // value at selected karat
  const purityPercentage = purityRatio * 100;
  const pureGoldWeight = weight * purityRatio;

  return {
    baseValue: Math.round(baseValue),
    actualValue: Math.round(actualValue),
    purityPercentage: Math.round(purityPercentage * 100) / 100,
    pureGoldWeight: Math.round(pureGoldWeight * 1000) / 1000,
  };
}

// Update DOM results (IDs used in your HTML)
function updateGoldResults(result, makingChargesAmount = 0) {
  const { baseValue, actualValue, purityPercentage, pureGoldWeight } = result;

  const goldValueEl = document.getElementById("goldValue");
  const goldValueWordsEl = document.getElementById("goldValueWords");
  if (goldValueEl) goldValueEl.textContent = formatCurrency(actualValue);
  if (goldValueWordsEl)
    goldValueWordsEl.textContent = numberToWords(
      Math.round(actualValue),
      "currency"
    );

  const makingChargesEl = document.getElementById("makingCharges");
  const makingChargesWordsEl = document.getElementById("makingChargesWords");
  const makingChargesResultEl = document.getElementById("makingChargesResult");
  if (makingChargesAmount && makingChargesResultEl) {
    if (makingChargesEl)
      makingChargesEl.textContent = formatCurrency(
        Math.round(makingChargesAmount)
      );
    if (makingChargesWordsEl)
      makingChargesWordsEl.textContent = numberToWords(
        Math.round(makingChargesAmount),
        "currency"
      );
    makingChargesResultEl.style.display = "flex";
  } else if (makingChargesResultEl) {
    makingChargesResultEl.style.display = "none";
  }

  const totalValueEl = document.getElementById("totalValue");
  const totalValueWordsEl = document.getElementById("totalValueWords");
  const total = Math.round(actualValue + (makingChargesAmount || 0));
  if (totalValueEl) totalValueEl.textContent = formatCurrency(total);
  if (totalValueWordsEl)
    totalValueWordsEl.textContent = numberToWords(total, "currency");

  // optional elements (update if exist)
  const purityElem = document.getElementById("purityPercentage");
  if (purityElem) purityElem.textContent = `${purityPercentage}%`;

  const pureGoldElem = document.getElementById("pureGoldWeight");
  if (pureGoldElem)
    pureGoldElem.textContent = `${formatNumber(pureGoldWeight, 3)} grams`;
}

// Format goldRate input (commas + words)
function formatGoldRate(input) {
  if (!input) return;
  // Keep digits and decimals, remove commas and spaces
  let rawValue = input.value.replace(/,/g, "").trim();
  // allow decimal point
  rawValue = rawValue.replace(/[^\d.]/g, "");
  if (rawValue) {
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      // Format with Indian number system for integers and keep decimals if present
      const parts = numValue.toString().split(".");
      parts[0] = parseInt(parts[0], 10).toLocaleString("en-IN");
      input.value = parts.join(".");

      // Update amount-in-words for the input wrapper (if present)
      const wordsElement =
        input.parentElement?.querySelector(".amount-in-words");
      if (wordsElement) {
        wordsElement.textContent = numberToWords(
          Math.round(numValue),
          "currency"
        );
      }

      input.setCustomValidity("");
      input.checkValidity();
      return;
    }
  }
  input.value = "";
  const wordsElement = input.parentElement?.querySelector(".amount-in-words");
  if (wordsElement) wordsElement.textContent = "";
}

// Main calculation handler (wired to form submit)
function handleGoldCalculation(event) {
  if (event) event.preventDefault();

  try {
    // Inputs
    const weightInput = document.getElementById("goldWeight");
    if (!weightInput) throw new Error("Weight input not found in DOM");
    const weight = parseFloat(weightInput.value);
    if (!weight || isNaN(weight))
      throw new Error("Please enter a valid weight");

    const rateInput = document.getElementById("goldRate");
    if (!rateInput) throw new Error("Gold rate input not found in DOM");
    const rawRate = (rateInput.value || "").replace(/,/g, "").trim(); // remove commas
    const rate = parseFloat(rawRate);
    if (!rawRate || isNaN(rate))
      throw new Error("Please enter a valid gold rate");

    // Purity: get from active button
    const activePurityBtn = document.querySelector(".gold-type-btn.active");
    if (!activePurityBtn)
      throw new Error("Please select a purity (24K/22K/18K/14K)");
    const purityKarat = parseInt(activePurityBtn.dataset.purity, 10);

    // Calculate base result
    const result = calculateGoldValue(weight, purityKarat, rate);

    // Making charges if enabled
    let makingChargesAmount = 0;
    const includeMaking = document.getElementById("includeMaking");
    if (includeMaking && includeMaking.checked) {
      const makingRateInput = document.getElementById("makingRate");
      const makingTypeSelect = document.getElementById("makingType");
      const makingRaw = makingRateInput ? parseFloat(makingRateInput.value) : 0;
      const makingType = makingTypeSelect
        ? makingTypeSelect.value
        : "percentage";
      if (makingType === "percentage") {
        // Calculate on actual value (value after purity)
        makingChargesAmount = result.actualValue * (makingRaw / 100) || 0;
      } else {
        // fixed amount (₹)
        makingChargesAmount = !isNaN(makingRaw) ? makingRaw : 0;
      }
    }

    // Update UI
    const goldResultDiv = document.getElementById("goldResult");
    if (goldResultDiv) {
      goldResultDiv.style.display = "block";
      // initialize or update results
      updateGoldResults(result, makingChargesAmount);
    }

    // Persist last used values
    localStorage.setItem("lastGoldWeight", weight);
    localStorage.setItem("lastGoldRate", rate);
    localStorage.setItem("lastGoldPurity", purityKarat);
  } catch (err) {
    if (typeof showError === "function") showError(err.message);
    else alert(err.message);
    const goldResultDiv = document.getElementById("goldResult");
    if (goldResultDiv) goldResultDiv.style.display = "none";
  }
}

// init: wire up buttons, inputs, form
function initializeGoldCalculator() {
  // Purity buttons
  const goldTypeButtons = document.querySelectorAll(".gold-type-btn");
  const purityMap = { 24: 100, 22: 91.6, 18: 75.0, 14: 58.3 };

  goldTypeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      goldTypeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const k = parseInt(btn.dataset.purity, 10);
      const perc = purityMap[k] ?? Math.round((k / 24) * 100 * 100) / 100;
      const purityPercentageEl = document.getElementById("purityPercentage");
      if (purityPercentageEl) purityPercentageEl.textContent = `${perc}%`;
      localStorage.setItem("lastGoldPurity", k);
    });
  });

  // Making charges toggle
  const includeMaking = document.getElementById("includeMaking");
  const makingChargesInput = document.getElementById("makingChargesInput");
  const makingChargesResult = document.getElementById("makingChargesResult");
  if (includeMaking) {
    includeMaking.addEventListener("change", () => {
      if (makingChargesInput)
        makingChargesInput.style.display = includeMaking.checked
          ? "block"
          : "none";
      if (makingChargesResult) makingChargesResult.style.display = "none";
    });
  }

  // Format goldRate while typing
  const rateInput = document.getElementById("goldRate");
  if (rateInput) {
    rateInput.pattern = "^[\\d,\\.]+$";
    rateInput.addEventListener("input", function () {
      formatGoldRate(this);
    });
    rateInput.addEventListener("blur", function () {
      if (this.value) formatGoldRate(this);
    });
  }

  // Weight input validation
  const weightInput = document.getElementById("goldWeight");
  if (weightInput) {
    weightInput.addEventListener("input", function () {
      const v = parseFloat(this.value);
      if (!isNaN(v) && v < 0) this.value = 0;
    });
  }

  // Form submit
  const goldForm = document.getElementById("goldForm");
  if (goldForm) {
    goldForm.addEventListener("submit", handleGoldCalculation);
  }

  // Load saved values if any
  const savedPurity = localStorage.getItem("lastGoldPurity");
  if (savedPurity) {
    const btn = document.querySelector(
      `.gold-type-btn[data-purity="${savedPurity}"]`
    );
    if (btn) btn.click();
  }
  const savedWeight = localStorage.getItem("lastGoldWeight");
  const savedRate = localStorage.getItem("lastGoldRate");
  if (savedWeight && weightInput) weightInput.value = savedWeight;
  if (savedRate && rateInput) {
    // format saved rate
    rateInput.value = parseFloat(savedRate).toLocaleString("en-IN");
    formatGoldRate(rateInput);
  }
}

// initialize on DOM ready
document.addEventListener("DOMContentLoaded", initializeGoldCalculator);
