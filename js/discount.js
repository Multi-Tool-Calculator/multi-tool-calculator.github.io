// Discount Calculator functions

function calculateDiscount(originalPrice, discount, type = "percentage") {
  try {
    // Validate inputs
    if (!validateNumericInput(originalPrice, 0.01)) {
      throw new Error("Please enter a valid price greater than 0");
    }
    if (!validateNumericInput(discount, 0)) {
      throw new Error("Please enter a valid discount amount");
    }

    let discountAmount;
    if (type === "percentage") {
      if (discount > 100) {
        throw new Error("Discount percentage cannot be greater than 100%");
      }
      discountAmount = (originalPrice * discount) / 100;
    } else {
      if (discount > originalPrice) {
        throw new Error(
          "Discount amount cannot be greater than original price"
        );
      }
      discountAmount = discount;
    }

    const finalPrice = originalPrice - discountAmount;
    const savingsPercentage = (discountAmount / originalPrice) * 100;

    return {
      originalPrice: Math.round(originalPrice),
      discountAmount: Math.round(discountAmount),
      finalPrice: Math.round(finalPrice),
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
    };
  } catch (error) {
    throw new Error("Error calculating discount: " + error.message);
  }
}

function updateDiscountResults(result) {
  const { originalPrice, discountAmount, finalPrice, savingsPercentage } =
    result;

  // Update original price
  const originalPriceElement = document.getElementById("originalPriceDisplay");
  const originalPriceWordsElement = document.getElementById(
    "originalPriceInWords"
  );
  if (originalPriceElement)
    originalPriceElement.textContent = formatCurrency(originalPrice);
  if (originalPriceWordsElement)
    originalPriceWordsElement.textContent = numberToWords(originalPrice);

  // Update discount amount
  const discountAmountElement = document.getElementById("discountAmount");
  const discountAmountWordsElement = document.getElementById("discountInWords");
  if (discountAmountElement)
    discountAmountElement.textContent = formatCurrency(discountAmount);
  if (discountAmountWordsElement)
    discountAmountWordsElement.textContent = numberToWords(discountAmount);

  // Update final price
  const finalPriceElement = document.getElementById("finalPrice");
  const finalPriceWordsElement = document.getElementById("finalPriceInWords");
  if (finalPriceElement)
    finalPriceElement.textContent = formatCurrency(finalPrice);
  if (finalPriceWordsElement)
    finalPriceWordsElement.textContent = numberToWords(finalPrice);

  // Update savings percentage
  const savingsElement = document.getElementById("savingsPercentage");
  if (savingsElement)
    savingsElement.textContent = formatNumber(savingsPercentage, 2) + "%";
}

function formatDiscountAmount(input) {
  // Remove any non-numeric characters
  let rawValue = input.value.replace(/[^\d]/g, "");

  if (rawValue) {
    // Parse as number
    const numValue = parseInt(rawValue, 10);
    if (!isNaN(numValue)) {
      // Format with Indian number system
      input.value = numValue.toLocaleString("en-IN");

      // Update amount in words if needed
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
    const wordsElement = input.parentElement.querySelector(".amount-in-words");
    if (wordsElement) {
      wordsElement.textContent = "";
    }
  }
}

function toggleDiscountType(isPercentage) {
  document
    .getElementById("percentageToggle")
    .classList.toggle("active", isPercentage);
  document
    .getElementById("amountToggle")
    .classList.toggle("active", !isPercentage);

  const discountInput = document.getElementById("discountValue");
  if (discountInput) {
    if (isPercentage) {
      discountInput.setAttribute("max", "100");
      discountInput.setAttribute("step", "0.1");
    } else {
      discountInput.removeAttribute("max");
      discountInput.setAttribute("step", "1");
    }
  }
}

function handleDiscountCalculation(event) {
  if (event) event.preventDefault();

  try {
    // Get and validate original price
    const priceInput = document.getElementById("originalPrice");
    const rawPrice = priceInput.value.replace(/[^\d]/g, "");
    const originalPrice = parseInt(rawPrice, 10);

    if (!rawPrice || isNaN(originalPrice)) {
      throw new Error("Please enter a valid original price");
    }

    // Get discount type and value
    const isPercentage = document
      .getElementById("percentageToggle")
      .classList.contains("active");
    const discountValue = parseFloat(
      document.getElementById("discountValue").value
    );

    // Calculate discount details
    const result = calculateDiscount(
      originalPrice,
      discountValue,
      isPercentage ? "percentage" : "amount"
    );

    // Update UI
    const resultElement = document.getElementById("discountResult");
    if (resultElement) {
      resultElement.style.display = "block";
      updateDiscountResults(result);
    }
  } catch (error) {
    showError(error.message);
    const resultElement = document.getElementById("discountResult");
    if (resultElement) resultElement.style.display = "none";
  }
}

function initializeDiscountCalculator() {
  // Set up amount input handler
  const priceInput = document.getElementById("originalPrice");
  if (priceInput) {
    priceInput.pattern = "^[\\d,]+$";

    priceInput.addEventListener("input", function (e) {
      formatDiscountAmount(this);
    });

    priceInput.addEventListener("blur", function (e) {
      if (this.value) formatDiscountAmount(this);
    });
  }

  // Set up discount value input handler
  const discountInput = document.getElementById("discountValue");
  if (discountInput) {
    discountInput.addEventListener("input", function (e) {
      const value = parseFloat(this.value);
      const isPercentage = document
        .getElementById("percentageToggle")
        .classList.contains("active");

      if (isPercentage) {
        if (value < 0) this.value = 0;
        if (value > 100) this.value = 100;
      } else if (value < 0) {
        this.value = 0;
      }
    });
  }

  // Set up discount type toggle handlers
  document
    .getElementById("percentageToggle")
    .addEventListener("click", () => toggleDiscountType(true));
  document
    .getElementById("amountToggle")
    .addEventListener("click", () => toggleDiscountType(false));

  // Set up calculate button handler
  const calculateBtn = document.getElementById("calculateDiscountBtn");
  if (calculateBtn) {
    calculateBtn.addEventListener("click", handleDiscountCalculation);
  }

  // Load saved preferences
  const savedType = localStorage.getItem("discountType");
  if (savedType) {
    toggleDiscountType(savedType === "percentage");
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeDiscountCalculator);
