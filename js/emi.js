// EMI Calculator functions
let emiChart = null;

function calculateEMIDetails(amount, rate, tenure, type = "years") {
  try {
    // Validate inputs
    if (!validateNumericInput(amount, 1000)) {
      throw new Error("Loan amount should be at least ₹1,000");
    }
    if (!validateNumericInput(rate, 0.1, 100)) {
      throw new Error("Interest rate should be between 0.1 and 100");
    }
    if (!validateNumericInput(tenure, 1)) {
      throw new Error("Loan tenure should be at least 1");
    }

    // Calculate EMI
    const months = type === "years" ? tenure * 12 : tenure;
    const monthlyRate = rate / 100 / 12;

    const emi =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalAmount = emi * months;
    const totalInterest = totalAmount - amount;

    return {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
    };
  } catch (error) {
    throw new Error(
      "An error occurred while calculating EMI: " + error.message
    );
  }
}

function updateEMIResults(result) {
  const emiResult = document.getElementById("emiResult");
  const totalInterestResult = document.getElementById("totalInterestResult");
  const totalPaymentResult = document.getElementById("totalPaymentResult");

  if (emiResult && totalInterestResult && totalPaymentResult) {
    emiResult.setAttribute(
      "value",
      Math.round(result.emi).toLocaleString("en-IN")
    );
    totalInterestResult.setAttribute(
      "value",
      Math.round(result.totalInterest).toLocaleString("en-IN")
    );
    totalPaymentResult.setAttribute(
      "value",
      Math.round(result.totalAmount).toLocaleString("en-IN")
    );
  }
}

function drawEMIChart(principal, interest) {
  const ctx = document.getElementById("emiChart");
  if (!ctx) return;

  const chartContext = ctx.getContext("2d");

  if (emiChart) {
    emiChart.destroy();
  }

  const total = principal + interest;
  const principalPercentage = ((principal / total) * 100).toFixed(1);
  const interestPercentage = ((interest / total) * 100).toFixed(1);

  emiChart = new Chart(chartContext, {
    type: "doughnut",
    data: {
      labels: ["Principal Amount", "Interest Amount"],
      datasets: [
        {
          data: [principal, interest],
          backgroundColor: ["#2563eb", "#10b981"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label;
              const value = context.raw;
              const percentage =
                context.dataIndex === 0
                  ? principalPercentage
                  : interestPercentage;
              return `${label}: ${percentage}% (₹${value.toLocaleString(
                "en-IN"
              )})`;
            },
          },
        },
      },
    },
  });
}

function handleEMICalculation(event) {
  event.preventDefault();

  try {
    // Get and validate loan amount
    const loanInput = document.getElementById("loanAmount");
    const rawValue = loanInput.value.replace(/[^\d]/g, "");

    // Validate the input format
    if (!rawValue || !/^\d+$/.test(rawValue)) {
      throw new Error("Please enter a valid loan amount");
    }

    const amount = parseInt(rawValue, 10);
    if (amount < 1000) {
      throw new Error("Loan amount should be at least ₹1,000");
    }

    // Get other input values
    const rate = parseFloat(document.getElementById("interestRate").value);
    const tenure = parseInt(document.getElementById("loanTenure").value);
    const type = document.getElementById("tenureType").value;

    // Calculate EMI details
    const result = calculateEMIDetails(amount, rate, tenure, type);

    // Update UI
    const errorElement = document.getElementById("errorMessage");
    const resultsElement = document.getElementById("results");

    if (errorElement) errorElement.style.display = "none";
    if (resultsElement) resultsElement.style.display = "block";

    updateEMIResults(result);
    drawEMIChart(amount, result.totalInterest);
  } catch (error) {
    showError(error.message);
    const resultsElement = document.getElementById("results");
    if (resultsElement) resultsElement.style.display = "none";
  }
}

function formatLoanAmount(input) {
  // Remove any non-numeric characters
  let rawValue = input.value.replace(/[^\d]/g, "");

  if (rawValue) {
    // Parse as number
    const numValue = parseInt(rawValue, 10);
    if (!isNaN(numValue)) {
      // Format with Indian number system
      input.value = numValue.toLocaleString("en-IN");

      // Update amount in words
      const wordsElement = document.getElementById("loanAmountWords");
      if (wordsElement) {
        wordsElement.textContent = numberToWords(numValue);
      }

      // Clear any validation errors
      input.setCustomValidity("");
      input.checkValidity();
    }
  } else {
    input.value = "";
    const wordsElement = document.getElementById("loanAmountWords");
    if (wordsElement) {
      wordsElement.textContent = "";
    }
  }
}

function initializeEMICalculator() {
  const form = document.getElementById("emiForm");
  if (form) {
    form.addEventListener("submit", handleEMICalculation);
  }

  // Set up loan amount input handler
  const loanInput = document.getElementById("loanAmount");
  if (loanInput) {
    // Set initial pattern for validation
    loanInput.pattern = "^[\\d,]+$";

    loanInput.addEventListener("input", function (e) {
      formatLoanAmount(this);
    });

    // Also format on blur to ensure proper formatting
    loanInput.addEventListener("blur", function (e) {
      if (this.value) formatLoanAmount(this);
    });
  }

  // Initialize empty chart
  drawEMIChart(0, 0);
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeEMICalculator);
