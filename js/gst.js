// GST Calculator functions
function calculateGST(amount, rate, type = "exclusive") {
  try {
    // Validate inputs
    if (!validateNumericInput(amount, 0)) {
      throw new Error("Please enter a valid amount");
    }
    if (!validateNumericInput(rate, 0, 100)) {
      throw new Error("GST rate should be between 0 and 100");
    }

    const gstAmount =
      type === "exclusive"
        ? (amount * rate) / 100
        : amount - (amount * 100) / (100 + rate);

    const baseAmount = type === "exclusive" ? amount : amount - gstAmount;
    const totalAmount = type === "exclusive" ? amount + gstAmount : amount;

    return { baseAmount, gstAmount, totalAmount };
  } catch (error) {
    throw new Error(
      "An error occurred while calculating GST: " + error.message
    );
  }
}

function updateGSTResults(result) {
  const { baseAmount, gstAmount, totalAmount } = result;

  // Update net amount
  const netAmountElement = document.getElementById("netAmount");
  const netAmountWordsElement = document.getElementById("netAmountInWords");
  if (netAmountElement)
    netAmountElement.textContent = formatCurrency(baseAmount);
  if (netAmountWordsElement)
    netAmountWordsElement.textContent = numberToWords(Math.round(baseAmount));

  // Update GST amount
  const gstAmountElement = document.getElementById("gstAmountResult");
  const gstAmountWordsElement = document.getElementById("gstAmountInWords");
  if (gstAmountElement)
    gstAmountElement.textContent = formatCurrency(gstAmount);
  if (gstAmountWordsElement)
    gstAmountWordsElement.textContent = numberToWords(Math.round(gstAmount));

  // Update gross amount
  const grossAmountElement = document.getElementById("grossAmount");
  const grossAmountWordsElement = document.getElementById("grossAmountInWords");
  if (grossAmountElement)
    grossAmountElement.textContent = formatCurrency(totalAmount);
  if (grossAmountWordsElement)
    grossAmountWordsElement.textContent = numberToWords(
      Math.round(totalAmount)
    );
}

function formatGSTAmount(input) {
  // Remove any non-numeric characters
  let rawValue = input.value.replace(/[^\d.]/g, "");

  if (rawValue) {
    // Parse as number
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      // Format with Indian number system
      input.value = numValue.toLocaleString("en-IN");

      // Update amount in words
      const wordsElement = document.getElementById("gstAmountWords");
      if (wordsElement) {
        wordsElement.textContent =
          numberToWords(Math.round(numValue)) + " Rupees";
      }

      // Clear any validation errors
      input.setCustomValidity("");
      input.checkValidity();
    }
  } else {
    input.value = "";
    const wordsElement = document.getElementById("gstAmountWords");
    if (wordsElement) {
      wordsElement.textContent = "";
    }
  }
}

function handleGSTCalculation(event) {
  event.preventDefault();

  try {
    // Get and validate amount
    const amountInput = document.getElementById("gstAmount");
    const rawValue = amountInput.value.replace(/[^\d.]/g, "");

    // Validate the input format
    if (!rawValue || isNaN(parseFloat(rawValue))) {
      throw new Error("Please enter a valid amount");
    }

    const amount = parseFloat(rawValue);
    const rate = parseFloat(document.getElementById("gstRate").value);
    const type = document.getElementById("gstType").value;

    // Calculate GST details
    const result = calculateGST(amount, rate, type);

    // Update UI
    const resultElement = document.getElementById("gstResult");
    if (resultElement) {
      resultElement.style.display = "block";
      updateGSTResults(result);
    }
  } catch (error) {
    showError(error.message);
    const resultElement = document.getElementById("gstResult");
    if (resultElement) resultElement.style.display = "none";
  }
}

function initializeGSTCalculator() {
  // Set up amount input handler
  const amountInput = document.getElementById("gstAmount");
  if (amountInput) {
    amountInput.pattern = "^[\\d,]+$";

    amountInput.addEventListener("input", function (e) {
      formatGSTAmount(this);
    });

    amountInput.addEventListener("blur", function (e) {
      if (this.value) formatGSTAmount(this);
    });
  }

  // Set up form submission handler
  const gstForm = document.getElementById("gstForm");
  if (gstForm) {
    gstForm.addEventListener("submit", handleGSTCalculation);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeGSTCalculator);
