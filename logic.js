// Function to convert number to words (Indian numbering system)
function numberToWords(num) {
  if (num === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertHundreds(n) {
    let result = "";
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n >= 10) {
      result += teens[n - 10] + " ";
      n = 0;
    }
    if (n > 0) {
      result += ones[n] + " ";
    }
    return result;
  }

  let result = "";
  let crore = Math.floor(num / 10000000);
  if (crore > 0) {
    result += convertHundreds(crore) + "Crore ";
    num %= 10000000;
  }

  let lakh = Math.floor(num / 100000);
  if (lakh > 0) {
    result += convertHundreds(lakh) + "Lakh ";
    num %= 100000;
  }

  let thousand = Math.floor(num / 1000);
  if (thousand > 0) {
    result += convertHundreds(thousand) + "Thousand ";
    num %= 1000;
  }

  if (num > 0) {
    result += convertHundreds(num);
  }

  return result.trim() + " Rupees Only";
}

// Show/hide deductions field based on tax regime
document.getElementById("taxRegime").addEventListener("change", function () {
  const deductionsGroup = document.getElementById("deductionsGroup");
  if (this.value === "old") {
    deductionsGroup.style.display = "block";
  } else {
    deductionsGroup.style.display = "none";
  }
});

// Function to update amount in words below input fields
function attachAmountInWords(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  // Create display div if not exists
  let wordsDiv = input.parentElement.querySelector(".amount-in-words");
  if (!wordsDiv) {
    wordsDiv = document.createElement("div");
    wordsDiv.className = "amount-in-words";
    input.parentElement.appendChild(wordsDiv);
  }

  // Add event listener
  input.addEventListener("input", () => {
    const value = parseFloat(input.value);
    if (value && value > 0) {
      wordsDiv.textContent = numberToWords(Math.round(value));
    } else {
      wordsDiv.textContent = "";
    }
  });
}

// Attach to all relevant input fields
document.addEventListener("DOMContentLoaded", function () {
  const fields = [
    "loanAmount",
    "gstAmount",
    "sipAmount",
    "annualIncome",
    "deductions",
    "goldRate",
    "fuelPrice",
    "originalPrice",
  ];
  fields.forEach(attachAmountInWords);

  // Keep age calculator date default
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("ageAsOf").value = today;
});

// EMI Calculator
function calculateEMI() {
  const loanAmount = parseFloat(document.getElementById("loanAmount").value);
  const interestRate = parseFloat(
    document.getElementById("interestRate").value
  );
  const loanTenureInput = parseFloat(
    document.getElementById("loanTenure").value
  );
  const tenureType = document.getElementById("tenureType").value;

  if (!loanAmount || !interestRate || !loanTenureInput) {
    alert("Please fill in all fields");
    return;
  }

  // Convert tenure to months if needed
  const loanTenure =
    tenureType === "years" ? loanTenureInput : loanTenureInput / 12;

  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTenure * 12;

  const emi =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - loanAmount;

  document.getElementById("monthlyEmi").textContent = formatCurrency(emi);
  document.getElementById("emiInWords").textContent = numberToWords(
    Math.round(emi)
  );
  document.getElementById("totalInterest").textContent =
    formatCurrency(totalInterest);
  document.getElementById("interestInWords").textContent = numberToWords(
    Math.round(totalInterest)
  );
  document.getElementById("totalPayment").textContent =
    formatCurrency(totalPayment);
  document.getElementById("totalPaymentInWords").textContent = numberToWords(
    Math.round(totalPayment)
  );
  document.getElementById("emiResult").classList.add("show");
}

// GST Calculator
function calculateGST() {
  const amount = parseFloat(document.getElementById("gstAmount").value);
  const gstRate = parseFloat(document.getElementById("gstRate").value);
  const gstType = document.getElementById("gstType").value;

  if (!amount || gstRate < 0) {
    alert("Please enter valid amount");
    return;
  }

  let netAmount, gstAmount, grossAmount;

  if (gstType === "exclusive") {
    netAmount = amount;
    gstAmount = (netAmount * gstRate) / 100;
    grossAmount = netAmount + gstAmount;
  } else {
    grossAmount = amount;
    netAmount = grossAmount / (1 + gstRate / 100);
    gstAmount = grossAmount - netAmount;
  }

  document.getElementById("netAmount").textContent = formatCurrency(netAmount);
  document.getElementById("netAmountInWords").textContent = numberToWords(
    Math.round(netAmount)
  );
  document.getElementById("gstAmountResult").textContent =
    formatCurrency(gstAmount);
  document.getElementById("gstAmountInWords").textContent = numberToWords(
    Math.round(gstAmount)
  );
  document.getElementById("grossAmount").textContent =
    formatCurrency(grossAmount);
  document.getElementById("grossAmountInWords").textContent = numberToWords(
    Math.round(grossAmount)
  );
  document.getElementById("gstResult").classList.add("show");
}

// SIP Calculator
function calculateSIP() {
  const monthlyInvestment = parseFloat(
    document.getElementById("sipAmount").value
  );
  const annualReturn = parseFloat(document.getElementById("sipReturn").value);
  const duration = parseFloat(document.getElementById("sipDuration").value);

  if (!monthlyInvestment || !annualReturn || !duration) {
    alert("Please fill in all fields");
    return;
  }

  const monthlyReturn = annualReturn / 100 / 12;
  const totalMonths = duration * 12;
  const totalInvestment = monthlyInvestment * totalMonths;

  const futureValue =
    ((monthlyInvestment * (Math.pow(1 + monthlyReturn, totalMonths) - 1)) /
      monthlyReturn) *
    (1 + monthlyReturn);

  const estimatedReturns = futureValue - totalInvestment;

  document.getElementById("sipInvested").textContent =
    formatCurrency(totalInvestment);
  document.getElementById("sipInvestedInWords").textContent = numberToWords(
    Math.round(totalInvestment)
  );
  document.getElementById("sipReturns").textContent =
    formatCurrency(estimatedReturns);
  document.getElementById("sipReturnsInWords").textContent = numberToWords(
    Math.round(estimatedReturns)
  );
  document.getElementById("sipTotal").textContent = formatCurrency(futureValue);
  document.getElementById("sipTotalInWords").textContent = numberToWords(
    Math.round(futureValue)
  );
  document.getElementById("sipResult").classList.add("show");
}

// Income Tax Calculator (Updated for FY 2024-25)
function calculateIncomeTax() {
  const income = parseFloat(document.getElementById("annualIncome").value) || 0;
  const ageGroup = document.getElementById("ageGroup").value;
  const taxRegime = document.getElementById("taxRegime").value;
  const deductions =
    parseFloat(document.getElementById("deductions").value) || 0;

  if (!income) {
    alert("Please enter annual income");
    return;
  }

  let taxableIncome = 0;
  let tax = 0;

  if (taxRegime === "new") {
    const stdDeduction = 75000;
    taxableIncome = Math.max(0, income - stdDeduction - deductions);

    const slabs = [
      { limit: 400000, rate: 0 },
      { limit: 800000, rate: 0.05 },
      { limit: 1200000, rate: 0.1 },
      { limit: 1600000, rate: 0.15 },
      { limit: 2000000, rate: 0.2 },
      { limit: 2400000, rate: 0.25 },
      { limit: Infinity, rate: 0.3 },
    ];

    let prevLimit = 0;
    let remaining = taxableIncome;

    for (const slab of slabs) {
      if (taxableIncome > prevLimit) {
        const taxablePortion = Math.min(taxableIncome, slab.limit) - prevLimit;
        tax += Math.max(0, taxablePortion) * slab.rate;
        prevLimit = slab.limit;
      } else {
        break;
      }
    }

    if (taxableIncome <= 1200000) {
      const rebate = Math.min(60000, tax);
      tax -= rebate;
    }
  } else {
    let exemption = 250000;
    if (ageGroup === "senior") exemption = 300000;
    else if (ageGroup === "super") exemption = 500000;

    taxableIncome = Math.max(0, income - exemption - deductions);

    if (taxableIncome > 250000) {
      tax += (Math.min(taxableIncome, 500000) - 250000) * 0.05;
    }
    if (taxableIncome > 500000) {
      tax += (Math.min(taxableIncome, 1000000) - 500000) * 0.2;
    }
    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.3;
    }
  }

  tax = tax * 1.04;

  const netIncome = income - tax;

  document.getElementById("taxableIncome").textContent =
    formatCurrency(taxableIncome);
  document.getElementById("taxableIncomeInWords").textContent = numberToWords(
    Math.round(taxableIncome)
  );
  document.getElementById("incomeTax").textContent = formatCurrency(tax);
  document.getElementById("incomeTaxInWords").textContent = numberToWords(
    Math.round(tax)
  );
  document.getElementById("netIncome").textContent = formatCurrency(netIncome);
  document.getElementById("netIncomeInWords").textContent = numberToWords(
    Math.round(netIncome)
  );
  document.getElementById("taxResult").classList.add("show");
}

// Percentage Calculator
function calculatePercentage() {
  const obtained = parseFloat(document.getElementById("marksObtained").value);
  const total = parseFloat(document.getElementById("totalMarks").value);

  if (!obtained || !total || total <= 0) {
    alert("Please enter valid marks");
    return;
  }

  const percentage = (obtained / total) * 100;
  let grade = "F";

  if (percentage >= 90) grade = "A+";
  else if (percentage >= 80) grade = "A";
  else if (percentage >= 70) grade = "B+";
  else if (percentage >= 60) grade = "B";
  else if (percentage >= 50) grade = "C";
  else if (percentage >= 40) grade = "D";

  document.getElementById("percentageScore").textContent =
    formatNumber(percentage, 2) + "%";
  document.getElementById("grade").textContent = grade;
  document.getElementById("percentageResult").classList.add("show");
}

// Age Calculator
function calculateAge() {
  const birthDate = new Date(document.getElementById("birthDate").value);
  const ageAsOfInput = document.getElementById("ageAsOf").value;
  const ageAsOf = ageAsOfInput ? new Date(ageAsOfInput) : new Date();

  if (!birthDate || isNaN(birthDate.getTime())) {
    alert("Please enter a valid birth date");
    return;
  }

  if (birthDate > ageAsOf) {
    alert("Birth date cannot be in the future");
    return;
  }

  let years = ageAsOf.getFullYear() - birthDate.getFullYear();
  let months = ageAsOf.getMonth() - birthDate.getMonth();
  let days = ageAsOf.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(ageAsOf.getFullYear(), ageAsOf.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((ageAsOf - birthDate) / (1000 * 60 * 60 * 24));

  document.getElementById(
    "exactAge"
  ).textContent = `${years} years, ${months} months, ${days} days`;
  document.getElementById("totalDays").textContent =
    formatNumber(totalDays, 0) + " days";
  document.getElementById("ageResult").classList.add("show");
}

// Gold Rate Calculator
function calculateGoldValue() {
  const weight = parseFloat(document.getElementById("goldWeight").value);
  const weightUnit = document.getElementById("goldWeightUnit").value;
  const purity = parseFloat(document.getElementById("goldPurity").value);
  const rate = parseFloat(document.getElementById("goldRate").value);

  if (!weight || !rate || weight <= 0 || rate <= 0) {
    alert("Please enter valid values");
    return;
  }

  let weightInGrams = weight;
  if (weightUnit === "kg") {
    weightInGrams = weight * 1000;
  }

  let purityPercent;
  if (purity === 24) purityPercent = 99.9;
  else if (purity === 22) purityPercent = 91.6;
  else if (purity === 18) purityPercent = 75.0;

  const pureWeight = (weightInGrams * purityPercent) / 100;
  const totalValue = pureWeight * rate;

  document.getElementById("pureGoldWeight").textContent =
    formatNumber(pureWeight, 2) + "g";
  document.getElementById("goldValue").textContent = formatCurrency(totalValue);
  document.getElementById("goldValueInWords").textContent = numberToWords(
    Math.round(totalValue)
  );
  document.getElementById("goldResult").classList.add("show");
}

// BMI Calculator
function calculateBMI() {
  const height = parseFloat(document.getElementById("height").value);
  const heightUnit = document.getElementById("heightUnit").value;
  const weight = parseFloat(document.getElementById("weight").value);
  const weightUnit = document.getElementById("weightUnit").value;

  if (!height || !weight || height <= 0 || weight <= 0) {
    alert("Please enter valid height and weight");
    return;
  }

  let heightInMeters;
  if (heightUnit === "cm") {
    heightInMeters = height / 100;
  } else if (heightUnit === "feet") {
    heightInMeters = height * 0.3048;
  } else if (heightUnit === "inches") {
    heightInMeters = height * 0.0254;
  }

  let weightInKg = weight;
  if (weightUnit === "lbs") {
    weightInKg = weight * 0.453592;
  }

  const bmi = weightInKg / (heightInMeters * heightInMeters);

  let category;
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  document.getElementById("bmiScore").textContent = formatNumber(bmi, 1);
  document.getElementById("bmiCategory").textContent = category;
  document.getElementById("bmiResult").classList.add("show");
}

// Fuel Cost Calculator
function calculateFuelCost() {
  const distance = parseFloat(document.getElementById("distance").value);
  const mileage = parseFloat(document.getElementById("mileage").value);
  const fuelPrice = parseFloat(document.getElementById("fuelPrice").value);

  if (
    !distance ||
    !mileage ||
    !fuelPrice ||
    distance <= 0 ||
    mileage <= 0 ||
    fuelPrice <= 0
  ) {
    alert("Please enter valid values");
    return;
  }

  const fuelNeeded = distance / mileage;
  const totalCost = fuelNeeded * fuelPrice;

  document.getElementById("fuelNeeded").textContent =
    formatNumber(fuelNeeded, 2) + " liters";
  document.getElementById("totalFuelCost").textContent =
    formatCurrency(totalCost);
  document.getElementById("fuelCostInWords").textContent = numberToWords(
    Math.round(totalCost)
  );
  document.getElementById("fuelResult").classList.add("show");
}

// Single Item Discount Calculator
function calculateSingleDiscount() {
  const originalPrice = parseFloat(
    document.getElementById("originalPrice").value
  );
  const discountPercent = parseFloat(
    document.getElementById("discountPercent").value
  );

  if (
    !originalPrice ||
    !discountPercent ||
    originalPrice <= 0 ||
    discountPercent < 0
  ) {
    alert("Please enter valid values");
    return;
  }

  const discountAmount = (originalPrice * discountPercent) / 100;
  const finalPrice = originalPrice - discountAmount;

  document.getElementById("discountAmount").textContent =
    formatCurrency(discountAmount);
  document.getElementById("discountAmountInWords").textContent = numberToWords(
    Math.round(discountAmount)
  );
  document.getElementById("finalPrice").textContent =
    formatCurrency(finalPrice);
  document.getElementById("finalPriceInWords").textContent = numberToWords(
    Math.round(finalPrice)
  );
  document.getElementById("amountSaved").textContent =
    formatCurrency(discountAmount);
  document.getElementById("amountSavedInWords").textContent = numberToWords(
    Math.round(discountAmount)
  );
  document.getElementById("discountResult").classList.add("show");
}

// Multiple Items Discount Calculator
function calculateMultipleDiscount() {
  const items = document.querySelectorAll(".discount-item");
  let totalOriginalPrice = 0;
  let totalDiscountAmount = 0;

  for (const item of items) {
    const originalPrice =
      parseFloat(item.querySelector(".item-price").value) || 0;
    const discountPercent =
      parseFloat(item.querySelector(".item-discount").value) || 0;

    if (originalPrice <= 0 || discountPercent < 0) {
      alert("Please enter valid values for all items");
      return;
    }

    totalOriginalPrice += originalPrice;
    totalDiscountAmount += (originalPrice * discountPercent) / 100;
  }

  const totalFinalPrice = totalOriginalPrice - totalDiscountAmount;

  document.getElementById("totalOriginalPrice").textContent =
    formatCurrency(totalOriginalPrice);
  document.getElementById("totalOriginalPriceInWords").textContent =
    numberToWords(Math.round(totalOriginalPrice));
  document.getElementById("totalDiscountAmount").textContent =
    formatCurrency(totalDiscountAmount);
  document.getElementById("totalDiscountAmountInWords").textContent =
    numberToWords(Math.round(totalDiscountAmount));
  document.getElementById("totalFinalPrice").textContent =
    formatCurrency(totalFinalPrice);
  document.getElementById("totalFinalPriceInWords").textContent = numberToWords(
    Math.round(totalFinalPrice)
  );
  document.getElementById("multipleDiscountResult").classList.add("show");
}

// Add event listeners for all calculator forms
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date().toISOString().split("T")[0];
  if (document.getElementById("ageAsOf")) {
    document.getElementById("ageAsOf").value = today;
  }

  // Basic Percentage Calculator
  function calculateBasicPercentage() {
    const percentage = parseFloat(document.getElementById("percentage").value);
    const value = parseFloat(document.getElementById("value").value);

    if (!percentage || !value || percentage < 0 || value < 0) {
      alert("Please enter valid values");
      return;
    }

    const result = (percentage * value) / 100;

    document.getElementById("basicResult").textContent = formatNumber(
      result,
      2
    );
    document.getElementById("basicResultInWords").textContent = numberToWords(
      Math.round(result)
    );
    document.getElementById("basicPercentageResult").classList.add("show");
  }

  // Percentage Change Calculator
  function calculatePercentageChange() {
    const oldValue = parseFloat(document.getElementById("oldValue").value);
    const newValue = parseFloat(document.getElementById("newValue").value);

    if (!oldValue || !newValue || oldValue <= 0 || newValue < 0) {
      alert("Please enter valid values");
      return;
    }

    const change = newValue - oldValue;
    const percentageChange = (change / oldValue) * 100;

    document.getElementById("changeResult").textContent =
      formatNumber(percentageChange, 2) + "%";
    document.getElementById("changeAmount").textContent = formatCurrency(
      Math.abs(change)
    );
    document.getElementById("changeDirection").textContent =
      change >= 0 ? "increase" : "decrease";
    document.getElementById("percentageChangeResult").classList.add("show");
  }

  // Ratio to Percentage Calculator
  function calculateRatioPercentage() {
    const numerator = parseFloat(document.getElementById("numerator").value);
    const denominator = parseFloat(
      document.getElementById("denominator").value
    );

    if (!numerator || !denominator || numerator < 0 || denominator <= 0) {
      alert("Please enter valid values");
      return;
    }

    const percentage = (numerator / denominator) * 100;

    document.getElementById("ratioResult").textContent =
      formatNumber(percentage, 2) + "%";
    document.getElementById("decimalResult").textContent = formatNumber(
      numerator / denominator,
      4
    );
    document.getElementById("ratioPercentageResult").classList.add("show");
  }

  // EMI Calculator
  const emiForm = document.getElementById("emiForm");
  if (emiForm) {
    emiForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateEMI();
    });
  }

  // SIP Calculator
  const sipForm = document.getElementById("sipForm");
  if (sipForm) {
    sipForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateSIP();
    });
  }

  // GST Calculator
  const gstForm = document.getElementById("gstForm");
  if (gstForm) {
    gstForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateGST();
    });
  }

  // Income Tax Calculator
  const taxForm = document.getElementById("taxForm");
  if (taxForm) {
    taxForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateIncomeTax();
    });
  }

  // Percentage Calculator - Basic
  const basicPercentageForm = document.getElementById("basicPercentageForm");
  if (basicPercentageForm) {
    basicPercentageForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateBasicPercentage();
    });
  }

  // Percentage Calculator - Change
  const percentageChangeForm = document.getElementById("percentageChangeForm");
  if (percentageChangeForm) {
    percentageChangeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculatePercentageChange();
    });
  }

  // Percentage Calculator - Ratio
  const ratioPercentageForm = document.getElementById("ratioPercentageForm");
  if (ratioPercentageForm) {
    ratioPercentageForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateRatioPercentage();
    });
  }

  // Age Calculator
  const ageForm = document.getElementById("ageForm");
  if (ageForm) {
    ageForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateAge();
    });
  }

  // Gold Rate Calculator
  const goldForm = document.getElementById("goldForm");
  if (goldForm) {
    goldForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateGoldValue();
    });
  }

  // BMI Calculator
  const bmiForm = document.getElementById("bmiForm");
  if (bmiForm) {
    bmiForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateBMI();
    });
  }

  // Fuel Cost Calculator
  const fuelForm = document.getElementById("fuelForm");
  if (fuelForm) {
    fuelForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateFuelCost();
    });
  }

  // Discount Calculator - Single Item
  const singleDiscountForm = document.getElementById("singleDiscountForm");
  if (singleDiscountForm) {
    singleDiscountForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateSingleDiscount();
    });
  }

  // Discount Calculator - Multiple Items
  const multipleDiscountForm = document.getElementById("multipleDiscountForm");
  if (multipleDiscountForm) {
    multipleDiscountForm.addEventListener("submit", function (e) {
      e.preventDefault();
      calculateMultipleDiscount();
    });
  }
});
