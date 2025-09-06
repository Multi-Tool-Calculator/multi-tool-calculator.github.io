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

  document.getElementById("basicPercentageForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleBasicPercentageCalculation();
  });

  document.getElementById("percentageChangeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handlePercentageChangeCalculation();
  });

  document.getElementById("ratioPercentageForm").addEventListener("submit", (e) => {
    e.preventDefault();
    handleRatioPercentageCalculation();
  });

  // --- UI Functions ---

  function activateCalculator(type) {
    calcTypeButtons.forEach((btn) => btn.classList.remove("active"));
    calculatorSections.forEach((section) => section.classList.remove("active"));

    const button = document.querySelector(`[data-type="${type}"]`);
    if (button) button.classList.add("active");

    const section = document.getElementById(`${type}Calc`);
    if (section) section.classList.add("active");

    document.querySelectorAll(".result").forEach((result) => result.classList.remove("show"));
  }

  // --- Calculation Handlers ---

  function handleBasicPercentageCalculation() {
    try {
      const percentage = parseFloat(document.getElementById("percentage").value);
      const value = parseFloat(document.getElementById("value").value);

      if (!validateNumericInput(percentage) || !validateNumericInput(value)) {
        showError("Please enter valid numbers.");
        return;
      }

      const result = (percentage * value) / 100;

      document.getElementById("percentageAmount").textContent = formatNumber(result);
      document.getElementById("percentageAmountInWords").textContent = numberToWords(result);
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
        showError("Please enter valid numbers.");
        return;
      }

      const change = newValue - oldValue;
      const percentageChange = (change / oldValue) * 100;

      document.getElementById("percentageChange").textContent = `${formatNumber(percentageChange, 2)}%`;
      document.getElementById("percentageChangeInWords").textContent = numberToWords(percentageChange);
      document.getElementById("absoluteChange").textContent = formatNumber(change);
      document.getElementById("absoluteChangeInWords").textContent = numberToWords(change);
      document.getElementById("changeResult").classList.add("show");
    } catch (error) {
      showError(error.message);
    }
  }

  function handleRatioPercentageCalculation() {
    try {
      const numerator = parseFloat(document.getElementById("numerator").value);
      const denominator = parseFloat(document.getElementById("denominator").value);

      if (!validateNumericInput(numerator) || !validateNumericInput(denominator) || denominator === 0) {
        showError("Please enter valid numbers. Denominator cannot be zero.");
        return;
      }

      const decimal = numerator / denominator;
      const percentage = decimal * 100;

      document.getElementById("ratioPercentage").textContent = `${formatNumber(percentage, 2)}%`;
      document.getElementById("ratioPercentageInWords").textContent = numberToWords(percentage);
      document.getElementById("ratioDecimal").textContent = formatNumber(decimal, 4);
      document.getElementById("ratioDecimalInWords").textContent = numberToWords(decimal);
      document.getElementById("ratioResult").classList.add("show");
    } catch (error) {
      showError(error.message);
    }
  }
});