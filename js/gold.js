// Gold Calculator functions

function calculateGoldValue(weight, purity = 24, rate) {
  try {
    // Validate inputs
    if (!validateNumericInput(weight, 0.01)) {
      throw new Error("Please enter a valid weight greater than 0");
    }
    if (!validateNumericInput(rate, 1)) {
      throw new Error("Please enter a valid gold rate greater than 0");
    }
    if (!validateNumericInput(purity, 1, 24)) {
      throw new Error("Please enter a valid purity between 1 and 24 karats");
    }

    const purityRatio = purity / 24;
    const baseValue = weight * rate;
    const actualValue = baseValue * purityRatio;
    const purityPercentage = purityRatio * 100;

    return {
      baseValue: Math.round(baseValue),
      actualValue: Math.round(actualValue),
      purityPercentage: Math.round(purityPercentage * 100) / 100,
      pureGoldWeight: Math.round(weight * purityRatio * 1000) / 1000,
    };
  } catch (error) {
    throw new Error("Error calculating gold value: " + error.message);
  }
}

function updateGoldResults(result) {
  const { baseValue, actualValue, purityPercentage, pureGoldWeight } = result;

  // Update base value (24K)
  const baseValueElement = document.getElementById("baseValue");
  const baseValueWordsElement = document.getElementById("baseValueInWords");
  if (baseValueElement)
    baseValueElement.textContent = formatCurrency(baseValue);
  if (baseValueWordsElement)
    baseValueWordsElement.textContent = numberToWords(baseValue);

  // Update actual value
  const actualValueElement = document.getElementById("actualValue");
  const actualValueWordsElement = document.getElementById("actualValueInWords");
  if (actualValueElement)
    actualValueElement.textContent = formatCurrency(actualValue);
  if (actualValueWordsElement)
    actualValueWordsElement.textContent = numberToWords(actualValue);

  // Update purity details
  const purityElement = document.getElementById("purityPercentage");
  if (purityElement)
    purityElement.textContent = formatNumber(purityPercentage, 2) + "%"

  const pureGoldElement = document.getElementById("pureGoldWeight");
  if (pureGoldElement)
    pureGoldElement.textContent = formatNumber(pureGoldWeight, 3) + " grams";
}

function formatGoldRate(input) {
  // Remove any non-numeric characters
  let rawValue = input.value.replace(/[^\d]/g, "");

  if (rawValue) {
    // Parse as number
    const numValue = parseInt(rawValue, 10);
    if (!isNaN(numValue)) {
      // Format with Indian number system
      input.value = numValue.toLocaleString("en-IN");

      // Update amount in words
      const wordsElement =
        input.parentElement.querySelector(".amount-in-words");
      if (wordsElement) {
        wordsElement.textContent = numberToWords(numValue) + " Rupees Only";
      }

      // Clear any validation errors
      input.setCustomValidity("");
      input.checkValidity();
    }
  } else {
    input.value = "";
  }
}

function handleGoldCalculation(event) {
  if (event) event.preventDefault();

  try {
    // Get and validate weight
    const weight = parseFloat(document.getElementById("goldWeight").value);
    if (!weight || isNaN(weight)) {
      throw new Error("Please enter a valid weight");
    }

    // Get gold rate
    const rateInput = document.getElementById("goldRate");
    const rawRate = rateInput.value.replace(/[^\d]/g, "");
    const rate = parseInt(rawRate, 10);
    if (!rawRate || isNaN(rate)) {
      throw new Error("Please enter a valid gold rate");
    }

    // Get purity
    const purity = parseInt(document.getElementById("goldPurity").value);

    // Calculate gold value
    const result = calculateGoldValue(weight, purity, rate);

    // Update UI
    const resultElement = document.getElementById("goldResult");
    if (resultElement) {
      resultElement.style.display = "block";
      updateGoldResults(result);
    }
  } catch (error) {
    showError(error.message);
    const resultElement = document.getElementById("goldResult");
    if (resultElement) resultElement.style.display = "none";
  }
}

function initializeGoldCalculator() {
  // Set up gold rate input handler
  const rateInput = document.getElementById("goldRate");
  if (rateInput) {
    rateInput.pattern = "^[\\d,]+$";

    rateInput.addEventListener("input", function (e) {
      formatGoldRate(this);
    });

    rateInput.addEventListener("blur", function (e) {
      if (this.value) formatGoldRate(this);
    });
  }

  // Set up weight input handler
  const weightInput = document.getElementById("goldWeight");
  if (weightInput) {
    weightInput.addEventListener("input", function (e) {
      const value = parseFloat(this.value);
      if (value < 0) this.value = 0;
    });
  }

  // Set up form submission handler
  const goldForm = document.getElementById("goldForm");
  if (goldForm) {
    goldForm.addEventListener("submit", handleGoldCalculation);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeGoldCalculator);
