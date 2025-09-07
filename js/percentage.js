document.addEventListener("DOMContentLoaded", () => {
  const calcTypeButtons = document.querySelectorAll(".calc-type-btn");
  const calculatorSections = document.querySelectorAll(".calculator-section");

  // --- Event Listeners ---
  calcTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      activateCalculator(type);
    });
  });

  // Attach event listeners for each form
  document
    .getElementById("basicPercentageForm")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      handleBasicPercentageCalculation();
    });

  document
    .getElementById("percentageChangeForm")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      handlePercentageChangeCalculation();
    });

  document
    .getElementById("ratioPercentageForm")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      handleRatioPercentageCalculation();
    });

  document
    .getElementById("marksPercentageForm")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      handleMarksPercentageCalculation();
    });

  document.getElementById("discountForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleDiscountCalculation();
  });

  // --- UI Functions ---
  function activateCalculator(type) {
    calcTypeButtons.forEach((btn) => btn.classList.remove("active"));
    calculatorSections.forEach((section) => section.classList.remove("active"));

    const button = document.querySelector(`[data-type="${type}"]`);
    if (button) button.classList.add("active");

    const section = document.getElementById(`${type}Calc`);
    if (section) section.classList.add("active");

    // reset results
    document
      .querySelectorAll(".result")
      .forEach((result) => result.classList.remove("show"));

    // save last used type
    localStorage.setItem("lastCalcType", type);
  }

  // --- Calculation Handlers ---

  function handleBasicPercentageCalculation() {
    try {
      const percentage = parseFloat(
        document.getElementById("percentageInput").value
      );
      const value = parseFloat(document.getElementById("valueInput").value);

      if (!validateNumericInput(percentage) || !validateNumericInput(value)) {
        return showError("Please enter valid numbers.");
      }

      const result = (percentage * value) / 100;

      updateResult("percentageAmount", result, "");
      document.getElementById(
        "basicSteps"
      ).innerHTML = `${percentage}% of ${formatNumber(
        value
      )} = (${percentage} × ${formatNumber(value)}) ÷ 100 = ${formatNumber(
        result
      )}`;

      document.getElementById("basicResult").classList.add("show");
    } catch (error) {
      showError(error.message);
    }
  }

  function handlePercentageChangeCalculation() {
    try {
      const oldValue = parseFloat(document.getElementById("oldValue").value);
      const newValue = parseFloat(document.getElementById("newValue").value);

      if (!validateNumericInput(oldValue) || !validateNumericInput(newValue)) {
        return showError("Please enter valid numbers.");
      }

      const change = newValue - oldValue;
      const percentageChange = (change / oldValue) * 100;

      updateResult("percentageChange", percentageChange, "percentage", "%");
      updateResult("absoluteChange", change, "");
      document.getElementById(
        "changeSteps"
      ).innerHTML = `Change: ${formatNumber(newValue)} - ${formatNumber(
        oldValue
      )} = ${formatNumber(change)} <br>
         Percentage Change = (${formatNumber(change)} ÷ ${formatNumber(
        oldValue
      )}) × 100 = ${formatNumber(percentageChange, 2)}%`;
      document.getElementById("changeResult").classList.add("show");
    } catch (error) {
      showError(error.message);
    }
  }

  function handleRatioPercentageCalculation() {
    try {
      const numerator = parseFloat(document.getElementById("numerator").value);
      const denominator = parseFloat(
        document.getElementById("denominator").value
      );

      if (
        !validateNumericInput(numerator) ||
        !validateNumericInput(denominator) ||
        denominator === 0
      ) {
        return showError(
          "Please enter valid numbers. Denominator cannot be zero."
        );
      }

      const decimal = numerator / denominator;
      const percentage = decimal * 100;

      updateResult("ratioPercentage", percentage, "percentage", "%");
      updateResult("ratioDecimal", decimal, "decimal");
      document.getElementById(
        "ratioSteps"
      ).innerHTML = `${numerator} ÷ ${denominator} = ${formatNumber(
        decimal,
        4
      )} <br>
         × 100 = ${formatNumber(percentage, 2)}%`;
      document.getElementById("ratioResult").classList.add("show");
    } catch (error) {
      showError(error.message);
    }
  }

  function handleMarksPercentageCalculation() {
    try {
      const obtained = parseFloat(
        document.getElementById("marksObtained").value
      );
      const total = parseFloat(document.getElementById("marksTotal").value);

      if (
        !validateNumericInput(obtained) ||
        !validateNumericInput(total) ||
        total === 0
      ) {
        return showError("Please enter valid marks. Total cannot be zero.");
      }

      const percentage = (obtained / total) * 100;

      updateResult("marksPercentage", percentage, "percentage", "%");
      document.getElementById(
        "marksSteps"
      ).innerHTML = `${obtained} ÷ ${total} × 100 = ${formatNumber(
        percentage,
        2
      )}%`;
      document.getElementById("marksResult").classList.add("show");
    } catch (error) {
      showError(error.message);
    }
  }

  // function handleDiscountCalculation() {
  //   try {
  //     const price = parseFloat(document.getElementById("originalPrice").value);
  //     const discount = parseFloat(
  //       document.getElementById("discountPercent").value
  //     );

  //     if (!validateNumericInput(price) || !validateNumericInput(discount)) {
  //       return showError("Please enter valid numbers.");
  //     }

  //     const discountAmount = (discount / 100) * price;
  //     const finalPrice = price - discountAmount;

  //     updateResult("discountAmount", discountAmount, "currency", " ₹");
  //     updateResult("finalPrice", finalPrice, "currency", " ₹");
  //     document.getElementById(
  //       "discountSteps"
  //     ).innerHTML = `Discount = (${discount}% of ${formatNumber(
  //       price
  //     )}) = ${formatNumber(discountAmount)} <br>
  //        Final Price = ${formatNumber(price)} - ${formatNumber(
  //       discountAmount
  //     )} = ${formatNumber(finalPrice)}`;
  //     document.getElementById("discountResult").classList.add("show");
  //   } catch (error) {
  //     showError(error.message);
  //   }
  // }

  // --- Helpers ---
  function updateResult(elementId, value, type = "number", suffix = "") {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Format value
    el.textContent = `${formatNumber(value, 2)}${suffix}`;

    // Update words if the element exists
    const wordsId = elementId + "InWords";
    const wordsEl = document.getElementById(wordsId);
    if (wordsEl) {
      wordsEl.textContent = numberToWords(value, type);
    }
  }

  function showError(message) {
    alert(message); // simple for now, can be styled
  }

  function validateNumericInput(val) {
    return typeof val === "number" && !isNaN(val);
  }

  // restore last calculator used
  const savedCalcType = localStorage.getItem("lastCalcType");
  if (savedCalcType) activateCalculator(savedCalcType);
});
