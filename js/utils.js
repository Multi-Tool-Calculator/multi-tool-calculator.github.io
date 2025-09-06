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
  if (num == null || isNaN(num)) return "";

  if (num === 0) {
    if (type === "currency") return "Zero Rupees";
    if (type === "percentage") return "Zero Percent";
    if (type === "decimal") return "Zero";
    return "Zero" + capitalizeFirstLetter(type);
  }

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
  const scales = ["", "Thousand", "Lakh", "Crore", "Lakh Crore"]; // Indian numbering system

  function convertHundreds(n) {
    let word = "";
    if (n > 99) {
      word += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n > 19) {
      word += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n >= 10) {
      word += teens[n - 10] + " ";
      n = 0;
    }
    if (n > 0) word += ones[n] + " ";
    return word.trim();
  }

  function convertIntegerPart(num) {
    let word = "";
    const parts = [];

    // Split according to Indian numbering system
    let crorePart = Math.floor(num / 10000000);
    if (crorePart) {
      parts.push({ value: crorePart, scale: "Crore" });
      num %= 10000000;
    }

    let lakhPart = Math.floor(num / 100000);
    if (lakhPart) {
      parts.push({ value: lakhPart, scale: "Lakh" });
      num %= 100000;
    }

    let thousandPart = Math.floor(num / 1000);
    if (thousandPart) {
      parts.push({ value: thousandPart, scale: "Thousand" });
      num %= 1000;
    }

    if (num > 0) {
      parts.push({ value: num, scale: "" });
    }

    parts.forEach((p) => {
      word += convertHundreds(p.value) + (p.scale ? " " + p.scale : "") + " ";
    });

    return word.trim();
  }

  // Split into integer and decimal parts (rounded to 2 digits)
  const [integerPart, rawDecimal] = num.toString().split(".");
  const integerWord = convertIntegerPart(parseInt(integerPart));

  let decimalWord = "";
  if (rawDecimal) {
    // Round to 2 decimal places
    const roundedDecimal = Math.round(parseFloat("0." + rawDecimal) * 100)
      .toString()
      .padStart(2, "0"); // ensure 2 digits (e.g., "5" -> "05")

    if (parseInt(roundedDecimal) > 0) {
      decimalWord = roundedDecimal
        .split("")
        .map((d) => ones[parseInt(d, 10)])
        .join(" ");
    }
  }

  if (type === "currency") {
    if (decimalWord) return `${integerWord} Rupees and ${decimalWord} Paise`;
    return `${integerWord} Rupees`;
  }

  if (type === "decimal") {
    if (decimalWord) return `${integerWord} Point ${decimalWord}`;
    return `${integerWord}`;
  }

  if (type === "percentage") {
    if (decimalWord) return `${integerWord} Point ${decimalWord} Percent`;
    return `${integerWord} Percent`;
  }

  if (type === "year")
    return integerWord + (parseInt(integerPart) === 1 ? " Year" : " Years");
  if (type === "month")
    return integerWord + (parseInt(integerPart) === 1 ? " Month" : " Months");
  if (type === "day")
    return integerWord + (parseInt(integerPart) === 1 ? " Day" : " Days");

  return integerWord + capitalizeFirstLetter(type);
}
