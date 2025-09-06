// Initialize chart instances
let investmentChart = null;
let progressChart = null;

// Helper functions
// function validateNumericInput(value, min = 0, max = Number.MAX_VALUE) {
//   return !isNaN(value) && value >= min && value <= max;
// }

// SIP Calculator functions
function calculateSIP(monthlyInvestment, rateOfReturn, years) {
  try {
    // Validate inputs
    if (!validateNumericInput(monthlyInvestment, 1)) {
      throw new Error(
        "Please enter a valid monthly investment amount greater than 0"
      );
    }
    if (!validateNumericInput(rateOfReturn, 0.1, 100)) {
      throw new Error(
        "Please enter a valid expected return rate between 0.1% and 100%"
      );
    }
    if (!validateNumericInput(years, 1, 50)) {
      throw new Error(
        "Please enter a valid time period between 1 and 50 years"
      );
    }

    // Calculate monthly rate
    const monthlyRate = rateOfReturn / 12 / 100;
    const months = years * 12;

    // Calculate invested amount (Principal)
    const totalInvestment = monthlyInvestment * months;

    // Calculate maturity amount using SIP formula: P * [((1+i)^n - 1) / i]
    const maturityAmount =
      (monthlyInvestment * (Math.pow(1 + monthlyRate, months) - 1)) /
      monthlyRate;

    // Calculate wealth gained (returns)
    const totalReturns = maturityAmount - totalInvestment;

    // Calculate year-by-year breakdown for chart
    const yearlyBreakdown = [];
    for (let y = 1; y <= years; y++) {
      const m = y * 12;
      const invested = monthlyInvestment * m;
      const future =
        (monthlyInvestment * (Math.pow(1 + monthlyRate, m) - 1)) / monthlyRate;
      yearlyBreakdown.push({
        year: y,
        invested: Math.round(invested),
        future: Math.round(future),
        returns: Math.round(future - invested),
      });
    }

    return {
      totalInvestment: Math.round(totalInvestment),
      maturityAmount: Math.round(maturityAmount),
      totalReturns: Math.round(totalReturns),
      monthlyRate,
      months,
      yearlyBreakdown,
    };
  } catch (error) {
    throw new Error("Error calculating SIP: " + error.message);
  }
}

function initializeCharts() {
  const investmentCanvas = document.getElementById("investmentChart");
  const progressCanvas = document.getElementById("progressChart");
  if (!investmentCanvas || !progressCanvas) return; // canvases not in DOM yet

  // If we already created charts earlier, destroy them to avoid duplicates
  if (investmentChart) {
    investmentChart.destroy();
    investmentChart = null;
  }
  if (progressChart) {
    progressChart.destroy();
    progressChart = null;
  }

  const investmentCtx = investmentCanvas.getContext("2d");
  const progressCtx = progressCanvas.getContext("2d");
  if (!investmentCtx || !progressCtx) return; // safety guard

  investmentChart = new Chart(investmentCtx, {
    type: "doughnut",
    data: {
      labels: ["Total Investment", "Total Returns"],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: ["#2563eb", "#10b981"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: "bottom" } },
    },
  });

  progressChart = new Chart(progressCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Invested Amount",
          data: [],
          borderColor: "#2563eb",
          backgroundColor: "#2563eb20",
          fill: true,
        },
        {
          label: "Future Value",
          data: [],
          borderColor: "#10b981",
          backgroundColor: "#10b98120",
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (v) => "₹" + v / 1000 + "K" },
        },
      },
      plugins: { legend: { position: "bottom" } },
    },
  });
}

function updateSIPResults(result) {
  const { totalInvestment, maturityAmount, totalReturns, yearlyBreakdown } =
    result;

  // Totals
  const invEl = document.getElementById("totalInvestment");
  if (invEl) invEl.textContent = formatCurrency(totalInvestment);
  const retEl = document.getElementById("totalReturns");
  if (retEl) retEl.textContent = formatCurrency(totalReturns);
  const matEl = document.getElementById("maturityAmount");
  if (matEl) matEl.textContent = formatCurrency(maturityAmount);

  const totalinvestmentWordsElement = document.getElementById(
    "totalInvestmentInWords"
  );
  if (totalinvestmentWordsElement)
    totalinvestmentWordsElement.textContent = numberToWords(totalInvestment);
  const returnsWordsElement = document.getElementById("returnsInWords");
  if (returnsWordsElement)
    returnsWordsElement.textContent = numberToWords(totalReturns);
  const maturityWordsElement = document.getElementById("maturityInWords");
  if (maturityWordsElement)
    maturityWordsElement.textContent = numberToWords(maturityAmount);

  // Charts
  if (investmentChart && progressChart) {
    investmentChart.data.datasets[0].data = [totalInvestment, totalReturns];
    investmentChart.update();

    const years = yearlyBreakdown.map((i) => "Year " + i.year);
    const investedData = yearlyBreakdown.map((i) => i.invested);
    const futureData = yearlyBreakdown.map((i) => i.future);

    progressChart.data.labels = years;
    progressChart.data.datasets[0].data = investedData;
    progressChart.data.datasets[1].data = futureData;
    progressChart.update();
  }
}

function formatSIPAmount(input) {
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
        wordsElement.textContent = numberToWords(numValue);
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

function handleSIPCalculation(event) {
  if (event) event.preventDefault();

  try {
    // Amount (typed as text with commas)
    const investmentInput = document.getElementById("monthlyInvestment");
    const rawInvestment = (investmentInput.value || "").replace(/[^\d]/g, "");
    const monthlyInvestment = parseInt(rawInvestment, 10);
    if (!rawInvestment || isNaN(monthlyInvestment) || monthlyInvestment <= 0) {
      throw new Error("Please enter a valid monthly investment amount");
    }

    const expectedReturn = parseFloat(
      document.getElementById("expectedReturn").value
    );
    const timePeriod = parseInt(
      document.getElementById("timePeriod").value,
      10
    );

    const result = calculateSIP(monthlyInvestment, expectedReturn, timePeriod);

    const resultElement = document.getElementById("sipResult");
    if (resultElement) {
      // 1) Reveal the result card so canvases have real size
      resultElement.style.display = "block";

      // 2) (Re)initialize charts *after* the element is visible (next tick ensures layout)
      setTimeout(() => {
        initializeCharts();
        // 3) Now push data into charts and texts
        updateSIPResults(result);
      }, 0);
    }
  } catch (error) {
    // Optional: simple fallback if showError doesn't exist
    if (typeof showError === "function") {
      showError(error.message);
    } else {
      console.error(error.message);
      alert(error.message);
    }
    const resultElement = document.getElementById("sipResult");
    if (resultElement) resultElement.style.display = "none";
  }
}

function initializeSIPCalculator() {
  // Set up amount input handler
  const amountInput = document.getElementById("monthlyInvestment");
  if (amountInput) {
    amountInput.pattern = "^[\\d,]+$";

    amountInput.addEventListener("input", function (e) {
      formatSIPAmount(this);
    });

    amountInput.addEventListener("blur", function (e) {
      if (this.value) formatSIPAmount(this);
    });
  }

  // Set up return rate input handler
  const rateInput = document.getElementById("expectedReturn");
  if (rateInput) {
    rateInput.addEventListener("input", function (e) {
      const value = parseFloat(this.value);
      if (value < 0) this.value = 0;
      if (value > 100) this.value = 100;
    });
  }

  // Set up time period input handler
  const periodInput = document.getElementById("timePeriod");
  if (periodInput) {
    periodInput.addEventListener("input", function (e) {
      const value = parseInt(this.value, 10);
      if (value < 1) this.value = 1;
      if (value > 50) this.value = 50;
    });
  }

  // Set up form submission handler
  const sipForm = document.getElementById("sipForm");
  if (sipForm) {
    sipForm.addEventListener("submit", handleSIPCalculation);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  initializeSIPCalculator();
  // Charts will now be created on first calculate, after the result is shown.
});
