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

function showError(message, duration = 5000) {
  const existingError = document.querySelector(".error-message");
  if (existingError) existingError.remove();

  const errorDiv = document.createElement("div");
  errorDiv.id = "errorMessage";
  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  const targetElement = document.querySelector("form, .result");
  if (targetElement) {
    targetElement.parentNode.insertBefore(errorDiv, targetElement);
  }

  setTimeout(() => errorDiv.remove(), duration);
}

function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function numberToWords(num, type = "currency") {
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

  // 10 Lakh Crore (1e13) support
  let lakhCrore = Math.floor(num / 1e12);
  if (lakhCrore > 0) {
    result += convertHundreds(lakhCrore) + "Lakh Crore ";
    num %= 1e12;
  }

  let crore = Math.floor(num / 1e7);
  if (crore > 0) {
    result += convertHundreds(crore) + "Crore ";
    num %= 1e7;
  }

  let lakh = Math.floor(num / 1e5);
  if (lakh > 0) {
    result += convertHundreds(lakh) + "Lakh ";
    num %= 1e5;
  }

  let thousand = Math.floor(num / 1000);
  if (thousand > 0) {
    result += convertHundreds(thousand) + "Thousand ";
    num %= 1000;
  }

  if (num > 0) {
    result += convertHundreds(num);
  }

  // Format suffix
  let suffix = "";
  if (type === "currency") {
    suffix =
      num === 1 && result.trim() === "One" ? "Rupee Only" : "Rupees Only";
  } else {
    suffix =
      num === 1 && result.trim() === "One"
        ? capitalizeFirstLetter(type)
        : capitalizeFirstLetter(type) + "s";
  }

  return result.trim() + " " + suffix;
}
