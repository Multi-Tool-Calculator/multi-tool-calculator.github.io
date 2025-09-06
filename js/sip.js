// Initialize chart instances
let investmentChart = null;
let progressChart = null;

// Helper functions
function validateNumericInput(value, min = 0, max = Number.MAX_VALUE) {
  return !isNaN(value) && value >= min && value <= max;
}

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

    // Calculate maturity amount using SIP formula: P * ((1 + r)^n - 1) * (1 + r)/r
    const maturityAmount =
      (monthlyInvestment *
        ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate))) /
      monthlyRate;

    // Calculate wealth gained (returns)
    const totalReturns = maturityAmount - totalInvestment;

    // Calculate year-by-year breakdown for chart
    const yearlyBreakdown = [];
    for (let y = 1; y <= years; y++) {
      const m = y * 12;
      const invested = monthlyInvestment * m;
      const future =
        (monthlyInvestment *
          ((Math.pow(1 + monthlyRate, m) - 1) * (1 + monthlyRate))) /
        monthlyRate;
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
  try {
    const investmentCtx = document
      .getElementById("investmentChart")
      .getContext("2d");
    const progressCtx = document
      .getElementById("progressChart")
      .getContext("2d");

    // Initialize investment distribution chart
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
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });

    // Initialize yearly progress chart
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
            ticks: {
              callback: (value) => "₹" + value / 1000 + "K",
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error initializing charts:", error);
  }
}

function updateSIPResults(result) {
  const { totalInvestment, maturityAmount, totalReturns, yearlyBreakdown } = result;

  // Update total investment amount
  const investmentElement = document.getElementById("totalInvestment");
  const investmentWordsElement = document.getElementById("investmentInWords");
  if (investmentElement)
    investmentElement.textContent = formatCurrency(totalInvestment);
  if (investmentWordsElement)
    investmentWordsElement.textContent = numberToWords(totalInvestment);

  // Update returns amount
  const returnsElement = document.getElementById("totalReturns");
  const returnsWordsElement = document.getElementById("returnsInWords");
  if (returnsElement) returnsElement.textContent = formatCurrency(totalReturns);
  if (returnsWordsElement)
    returnsWordsElement.textContent = numberToWords(totalReturns);

  // Update maturity amount
  const maturityElement = document.getElementById("maturityAmount");
  const maturityWordsElement = document.getElementById("maturityInWords");
  if (maturityElement)
    maturityElement.textContent = formatCurrency(maturityAmount);
  if (maturityWordsElement)
    maturityWordsElement.textContent = numberToWords(maturityAmount);

  // Update charts if they are initialized
  if (investmentChart && progressChart) {
    // Update investment distribution chart
    investmentChart.data.datasets[0].data = [totalInvestment, totalReturns];
    investmentChart.update();

    // Update yearly progression chart
    const years = yearlyBreakdown.map((item) => "Year " + item.year);
    const investedData = yearlyBreakdown.map((item) => item.invested);
    const futureData = yearlyBreakdown.map((item) => item.future);

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

function handleSIPCalculation(event) {
  if (event) event.preventDefault();

  try {
    // Get and validate monthly investment
    const investmentInput = document.getElementById("monthlyInvestment");
    const rawInvestment = investmentInput.value.replace(/[^\d]/g, "");
    const monthlyInvestment = parseInt(rawInvestment, 10);

    if (!rawInvestment || isNaN(monthlyInvestment)) {
      throw new Error("Please enter a valid monthly investment amount");
    }

    // Get other input values
    const expectedReturn = parseFloat(
      document.getElementById("expectedReturn").value
    );
    const timePeriod = parseInt(
      document.getElementById("timePeriod").value,
      10
    );

    // Calculate SIP details
    const result = calculateSIP(monthlyInvestment, expectedReturn, timePeriod);

    // Update UI
    const resultElement = document.getElementById("sipResult");
    if (resultElement) {
      resultElement.style.display = "block";
      updateSIPResults(result);
    }
  } catch (error) {
    showError(error.message);
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
  initializeCharts();
});
