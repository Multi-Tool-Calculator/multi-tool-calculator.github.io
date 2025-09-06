document.addEventListener("DOMContentLoaded", () => {
  const taxForm = document.getElementById("taxForm");
  const newRegimeBtn = document.getElementById("newRegimeBtn");
  const oldRegimeBtn = document.getElementById("oldRegimeBtn");
  const slabsTitle = document.getElementById("slabsTitle");
  const newRegimeSlabs = document.getElementById("newRegimeSlabs");
  const oldRegimeSlabs = document.getElementById("oldRegimeSlabs");
  const annualIncomeInput = document.getElementById("annualIncome");
  const incomeInWords = document.getElementById("incomeInWords");

  // --- Event Listeners ---

  newRegimeBtn.addEventListener("click", () => toggleRegime(true));
  oldRegimeBtn.addEventListener("click", () => toggleRegime(false));

  taxForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleTaxCalculation();
  });

  annualIncomeInput.addEventListener("input", () => {
    const value = parseFloat(annualIncomeInput.value.replace(/,/g, ""));
    incomeInWords.textContent = value > 0 ? numberToWords(Math.round(value)) : "";
  });

  // --- UI Functions ---

  function toggleRegime(isNew) {
    newRegimeBtn.classList.toggle("active", isNew);
    oldRegimeBtn.classList.toggle("active", !isNew);
    slabsTitle.textContent = `Tax Slabs (${isNew ? "New" : "Old"} Regime) - FY 2024-25`;
    newRegimeSlabs.style.display = isNew ? "block" : "none";
    oldRegimeSlabs.style.display = isNew ? "none" : "block";
  }

  // --- Calculation ---

  function handleTaxCalculation() {
    try {
      const income = parseFloat(annualIncomeInput.value.replace(/,/g, ""));
      if (!validateNumericInput(income)) {
        showError("Please enter a valid annual income.");
        return;
      }

      const regime = newRegimeBtn.classList.contains("active") ? "new" : "old";
      const result = calculateIncomeTax(income, regime);

      updateTaxResults(result, income);
      document.getElementById("taxResult").classList.add("show");
    } catch (error) {
      showError(error.message);
    }
  }

  function calculateIncomeTax(income, regime) {
    let tax = 0;
    let surcharge = 0;
    let cess = 0;

    if (regime === "new") {
        // FY 2024-25 New Regime
        if (income <= 300000) {
            tax = 0;
        } else if (income <= 700000) {
            tax = (income - 300000) * 0.05;
        } else if (income <= 1000000) {
            tax = 20000 + (income - 700000) * 0.10;
        } else if (income <= 1200000) {
            tax = 50000 + (income - 1000000) * 0.15;
        } else if (income <= 1500000) {
            tax = 80000 + (income - 1200000) * 0.20;
        } else {
            tax = 140000 + (income - 1500000) * 0.30;
        }

        if (income <= 700000) {
            tax = 0; // Rebate under Section 87A
        }
    } else { // Old Regime (no changes for FY 2024-25)
      if (income > 250000) tax += (Math.min(income, 500000) - 250000) * 0.05;
      if (income > 500000) tax += (Math.min(income, 1000000) - 500000) * 0.20;
      if (income > 1000000) tax += (income - 1000000) * 0.30;
    }

    if (income > 5000000) surcharge = tax * 0.10;
    if (income > 10000000) surcharge = tax * 0.15;
    if (income > 20000000) surcharge = tax * 0.25;
    if (income > 50000000) surcharge = tax * 0.37;

    cess = (tax + surcharge) * 0.04;
    const totalTax = tax + surcharge + cess;

    return {
      basicTax: Math.round(tax),
      surcharge: Math.round(surcharge),
      cess: Math.round(cess),
      totalTax: Math.round(totalTax),
      effectiveRate: ((totalTax / income) * 100).toFixed(2),
    };
  }

  function updateTaxResults(result, income) {
    document.getElementById("basicTax").textContent = formatCurrency(result.basicTax);
    document.getElementById("basicTaxInWords").textContent = numberToWords(result.basicTax);
    document.getElementById("surcharge").textContent = formatCurrency(result.surcharge);
    document.getElementById("surchargeInWords").textContent = numberToWords(result.surcharge);
    document.getElementById("cess").textContent = formatCurrency(result.cess);
    document.getElementById("cessInWords").textContent = numberToWords(result.cess);
    document.getElementById("totalTax").textContent = formatCurrency(result.totalTax);
    document.getElementById("totalTaxInWords").textContent = numberToWords(result.totalTax);
    document.getElementById("monthlyTax").textContent = formatCurrency(result.totalTax / 12);
    document.getElementById("monthlyTaxInWords").textContent = numberToWords(result.totalTax / 12);
    document.getElementById("monthlyIncome").textContent = formatCurrency(income / 12);
    document.getElementById("monthlyIncomeInWords").textContent = numberToWords(income / 12);
    document.getElementById("effectiveRate").textContent = `${result.effectiveRate}%`;
  }
});