// Utility Functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatNumber = (num, decimals = 2) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

const validateNumericInput = (
  value,
  min = 0,
  max = Number.MAX_SAFE_INTEGER
) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Error Handling
const showError = (message, duration = 5000) => {
  const existingError = document.querySelector(".error-message");
  if (existingError) existingError.remove();

  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  const targetElement = document.querySelector("form, .result");
  if (targetElement) {
    targetElement.parentNode.insertBefore(errorDiv, targetElement);
  }

  setTimeout(() => errorDiv.remove(), duration);
};

// EMI Calculator functions
function calculateEMIDetails(amount, rate, tenure, type = "years") {
  try {
    if (!validateNumericInput(amount, 1000)) {
      throw new Error("Loan amount should be at least ₹1,000");
    }
    if (!validateNumericInput(rate, 0.1, 100)) {
      throw new Error("Interest rate should be between 0.1 and 100");
    }
    if (!validateNumericInput(tenure, 1)) {
      throw new Error("Loan tenure should be at least 1");
    }

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

// Update EMI results in the UI
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

// Draw or update the EMI chart
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
          backgroundColor: [
            "rgba(79, 70, 229, 0.8)",
            "rgba(107, 33, 168, 0.8)",
          ],
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

// Handle EMI form submission
function handleEMICalculation(event) {
  event.preventDefault();

  try {
    // Get and validate loan amount (remove commas before parsing)
    const loanInput = document.getElementById("loanAmount");
    const amount = parseFloat(loanInput.value.replace(/,/g, ""));

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

// Initialize EMI calculator
function initializeEMICalculator() {
  const form = document.getElementById("emiForm");
  if (form) {
    form.addEventListener("submit", handleEMICalculation);
  }

  // Set up loan amount input handler
  const loanInput = document.getElementById("loanAmount");
  if (loanInput) {
    loanInput.addEventListener("input", function (e) {
      // Remove non-numeric characters and commas
      let value = this.value.replace(/[^\d]/g, "");
      if (value) {
        // Convert to number and format with commas
        const numValue = parseInt(value);
        this.value = numValue.toLocaleString("en-IN");

        // Update amount in words
        const wordsElement = document.getElementById("loanAmountWords");
        if (wordsElement) {
          wordsElement.textContent = numberToWords(numValue) + " Rupees Only";
        }
      } else {
        this.value = "";
        const wordsElement = document.getElementById("loanAmountWords");
        if (wordsElement) {
          wordsElement.textContent = "";
        }
      }
    });
  }

  // Initialize empty chart
  drawEMIChart(0, 0);
}

// GST Calculator functions
function calculateGST(amount, rate, type = "exclusive") {
  if (!validateNumericInput(amount, 0) || !validateNumericInput(rate, 0, 100)) {
    throw new Error("Invalid input values");
  }

  const gstAmount =
    type === "exclusive"
      ? (amount * rate) / 100
      : amount - (amount * 100) / (100 + rate);

  const baseAmount = type === "exclusive" ? amount : amount - gstAmount;
  const totalAmount = type === "exclusive" ? amount + gstAmount : amount;

  return { baseAmount, gstAmount, totalAmount };
}

// SIP Calculator functions
function calculateSIP(monthlyInvestment, rateOfReturn, years) {
  if (
    !validateNumericInput(monthlyInvestment, 1) ||
    !validateNumericInput(rateOfReturn, 0.1, 100) ||
    !validateNumericInput(years, 1)
  ) {
    throw new Error("Invalid input values");
  }

  const monthlyRate = rateOfReturn / 12 / 100;
  const months = years * 12;

  const investedAmount = monthlyInvestment * months;
  const maturityAmount =
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);
  const wealthGained = maturityAmount - investedAmount;

  return {
    investedAmount,
    maturityAmount,
    wealthGained,
    monthlyRate,
    months,
  };
}

// Tax Calculator functions
const taxSlabs = {
  old: [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 5 },
    { limit: 750000, rate: 20 },
    { limit: 1000000, rate: 20 },
    { limit: 1250000, rate: 30 },
    { limit: 1500000, rate: 30 },
    { limit: Infinity, rate: 30 },
  ],
  new: [
    { limit: 300000, rate: 0 },
    { limit: 600000, rate: 5 },
    { limit: 900000, rate: 10 },
    { limit: 1200000, rate: 15 },
    { limit: 1500000, rate: 20 },
    { limit: Infinity, rate: 30 },
  ],
};

function calculateTax(income, regime = "old") {
  if (!validateNumericInput(income, 0)) {
    throw new Error("Invalid income value");
  }

  const slabs = taxSlabs[regime];
  let tax = 0;
  let remainingIncome = income;
  let previousLimit = 0;

  const breakdown = slabs.map((slab) => {
    const slabIncome = Math.min(
      Math.max(remainingIncome, 0),
      slab.limit - previousLimit
    );
    const slabTax = (slabIncome * slab.rate) / 100;
    remainingIncome -= slabIncome;
    previousLimit = slab.limit;

    return {
      income: slabIncome,
      rate: slab.rate,
      tax: slabTax,
    };
  });

  tax = breakdown.reduce((total, slab) => total + slab.tax, 0);
  const cess = (tax * 4) / 100;

  return {
    tax,
    cess,
    totalTax: tax + cess,
    breakdown,
    taxableIncome: income,
  };
}

// Gold Calculator functions
function calculateGoldValue(weight, rate, purity) {
  if (!validateNumericInput(weight, 0.1) || !validateNumericInput(rate, 1)) {
    throw new Error("Invalid input values");
  }

  const purityPercentage = {
    24: 100,
    22: 91.6,
    18: 75.0,
    14: 58.3,
  }[purity];

  if (!purityPercentage) {
    throw new Error("Invalid gold purity");
  }

  const value = (weight * rate * purityPercentage) / 100;
  return { value, purityPercentage };
}

// Fuel Calculator functions
function calculateFuelCost(distance, mileage, fuelPrice, unit = "km") {
  if (
    !validateNumericInput(distance, 0.1) ||
    !validateNumericInput(mileage, 0.1) ||
    !validateNumericInput(fuelPrice, 0.1)
  ) {
    throw new Error("Invalid input values");
  }

  let distanceInKm = unit === "miles" ? distance * 1.60934 : distance;
  let kmPerLiter = unit === "miles" ? mileage * 0.425144 : mileage;

  const fuelRequired = distanceInKm / kmPerLiter;
  const totalCost = fuelRequired * fuelPrice;
  const costPerUnit = totalCost / distance;

  return {
    fuelRequired,
    totalCost,
    costPerUnit,
    co2Emissions: fuelRequired * 2.31, // kg CO2 per liter of fuel (approximate)
  };
}

// Percentage Calculator functions
function calculatePercentageValue(percentage, value) {
  if (!validateNumericInput(percentage, 0) || !validateNumericInput(value)) {
    throw new Error("Invalid input values");
  }

  return (percentage * value) / 100;
}

function calculatePercentageChange(oldValue, newValue) {
  if (
    !validateNumericInput(oldValue, 0.1) ||
    !validateNumericInput(newValue, 0)
  ) {
    throw new Error("Invalid input values");
  }

  const absoluteChange = newValue - oldValue;
  const percentageChange = (absoluteChange / oldValue) * 100;

  return {
    absoluteChange,
    percentageChange,
    isIncrease: percentageChange > 0,
  };
}

// Discount Calculator functions
function calculateDiscount(
  originalPrice,
  discountPercent,
  includeTax = false,
  taxRate = 0
) {
  if (
    !validateNumericInput(originalPrice, 0.01) ||
    !validateNumericInput(discountPercent, 0, 100) ||
    !validateNumericInput(taxRate, 0, 100)
  ) {
    throw new Error("Invalid input values");
  }

  const discountAmount = (originalPrice * discountPercent) / 100;
  const priceAfterDiscount = originalPrice - discountAmount;

  let finalPrice = priceAfterDiscount;
  let taxAmount = 0;

  if (includeTax && taxRate > 0) {
    taxAmount = (priceAfterDiscount * taxRate) / 100;
    finalPrice += taxAmount;
  }

  return {
    originalPrice,
    discountAmount,
    priceAfterDiscount,
    taxAmount,
    finalPrice,
    savedAmount: discountAmount,
    savedPercentage: discountPercent,
  };
}

// Add global error handler
window.addEventListener("error", function (e) {
  console.error("Calculator Error:", e.message);
  showError(
    "An error occurred while performing the calculation. Please check your inputs and try again."
  );
});

// GST Calculator functions
function calculateGST(amount, rate, type = "exclusive") {
  if (!validateNumericInput(amount, 0) || !validateNumericInput(rate, 0, 100)) {
    throw new Error("Invalid input values");
  }

  const gstRate = rate / 100;

  if (type === "exclusive") {
    const gstAmount = amount * gstRate;
    const totalAmount = amount + gstAmount;
    return { baseAmount: amount, gstAmount, totalAmount };
  } else {
    const baseAmount = amount / (1 + gstRate);
    const gstAmount = amount - baseAmount;
    return { baseAmount, gstAmount, totalAmount: amount };
  }
}

// SIP Calculator functions
function calculateSIP(amount, rate, tenure, frequency = "monthly") {
  if (
    !validateNumericInput(amount, 1) ||
    !validateNumericInput(rate, 0.1, 100) ||
    !validateNumericInput(tenure, 1)
  ) {
    throw new Error("Invalid input values");
  }

  const monthlyRate = rate / 100 / 12;
  const months = tenure * 12;
  const futureValue =
    amount *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);
  const totalInvestment = amount * months;
  const totalReturns = futureValue - totalInvestment;

  return {
    futureValue: Math.round(futureValue),
    totalInvestment: Math.round(totalInvestment),
    totalReturns: Math.round(totalReturns),
  };
}

// BMI Calculator functions
function calculateBMI(weight, height, unit = "metric") {
  if (!validateNumericInput(weight, 1) || !validateNumericInput(height, 1)) {
    throw new Error("Invalid input values");
  }

  let bmi;
  if (unit === "metric") {
    // Weight in kg, height in cm
    bmi = weight / Math.pow(height / 100, 2);
  } else {
    // Weight in lbs, height in inches
    bmi = (weight * 703) / Math.pow(height, 2);
  }

  let category;
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  return { bmi: bmi.toFixed(1), category };
}

// Age Calculator functions
function calculateAge(birthDate, toDate = new Date()) {
  const birth = new Date(birthDate);
  const today = new Date(toDate);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      birth.getDate()
    );
    days = Math.floor((today - prevMonth) / (1000 * 60 * 60 * 24));
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

// Income Tax Calculator functions (for India FY 2023-24)
function calculateIncomeTax(income, regime = "new") {
  if (!validateNumericInput(income, 0)) {
    throw new Error("Invalid income value");
  }

  let tax = 0;
  let surcharge = 0;
  let cess = 0;

  if (regime === "new") {
    // New Tax Regime 2023-24
    if (income <= 300000) {
      tax = 0;
    } else if (income <= 600000) {
      tax = (income - 300000) * 0.05;
    } else if (income <= 900000) {
      tax = 15000 + (income - 600000) * 0.1;
    } else if (income <= 1200000) {
      tax = 45000 + (income - 900000) * 0.15;
    } else if (income <= 1500000) {
      tax = 90000 + (income - 1200000) * 0.2;
    } else {
      tax = 150000 + (income - 1500000) * 0.3;
    }
  } else {
    // Old Tax Regime 2023-24
    if (income <= 250000) {
      tax = 0;
    } else if (income <= 500000) {
      tax = (income - 250000) * 0.05;
    } else if (income <= 1000000) {
      tax = 12500 + (income - 500000) * 0.2;
    } else {
      tax = 112500 + (income - 1000000) * 0.3;
    }
  }

  // Calculate surcharge
  if (income > 5000000 && income <= 10000000) {
    surcharge = tax * 0.1;
  } else if (income > 10000000 && income <= 20000000) {
    surcharge = tax * 0.15;
  } else if (income > 20000000 && income <= 50000000) {
    surcharge = tax * 0.25;
  } else if (income > 50000000) {
    surcharge = tax * 0.37;
  }

  // Calculate health and education cess
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

// Gold Rate Calculator
function calculateGoldValue(weight, purity, rate) {
  if (
    !validateNumericInput(weight, 0.01) ||
    !validateNumericInput(purity, 1, 100) ||
    !validateNumericInput(rate, 1)
  ) {
    throw new Error("Invalid input values");
  }

  const purityFactor = purity / 24;
  const value = weight * rate * purityFactor;
  return { value: Math.round(value) };
}

// Fuel Cost Calculator
function calculateFuelCost(distance, mileage, fuelPrice) {
  if (
    !validateNumericInput(distance, 0.1) ||
    !validateNumericInput(mileage, 0.1) ||
    !validateNumericInput(fuelPrice, 0.1)
  ) {
    throw new Error("Invalid input values");
  }

  const fuelNeeded = distance / mileage;
  const totalCost = fuelNeeded * fuelPrice;

  return {
    fuelQuantity: fuelNeeded.toFixed(2),
    totalCost: Math.round(totalCost),
  };
}

// Percentage Calculator
function calculatePercentage(value, percentage) {
  if (!validateNumericInput(value) || !validateNumericInput(percentage)) {
    throw new Error("Invalid input values");
  }

  const result = (value * percentage) / 100;
  return {
    result: result.toFixed(2),
    decimal: (percentage / 100).toFixed(4),
  };
}

// Discount Calculator
function calculateDiscount(originalPrice, discountPercentage) {
  if (
    !validateNumericInput(originalPrice, 0.01) ||
    !validateNumericInput(discountPercentage, 0, 100)
  ) {
    throw new Error("Invalid input values");
  }

  const discountAmount = (originalPrice * discountPercentage) / 100;
  const finalPrice = originalPrice - discountAmount;
  const savings = discountAmount;

  return {
    discountAmount: Math.round(discountAmount),
    finalPrice: Math.round(finalPrice),
    savings: Math.round(savings),
  };
}
