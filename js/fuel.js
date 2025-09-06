// Fuel Calculator functions
function calculateFuelCost(distance, efficiency, fuelPrice, unit = "km") {
  try {
    if (!validateNumericInput(distance, 0.1)) {
      throw new Error("Please enter a valid distance greater than 0");
    }
    if (!validateNumericInput(efficiency, 0.1)) {
      throw new Error("Please enter a valid fuel efficiency greater than 0");
    }
    if (!validateNumericInput(fuelPrice, 0.1)) {
      throw new Error("Please enter a valid fuel price greater than 0");
    }

    // Convert imperial to metric if needed
    if (unit === "miles") {
      distance = distance * 1.60934; // miles → km
      efficiency = efficiency * 0.425144; // mpg → km/l
    }

    const fuelNeeded = distance / efficiency;
    const totalCost = fuelNeeded * fuelPrice;
    const costPerKm = totalCost / distance;

    return {
      fuelNeeded: Math.round(fuelNeeded * 100) / 100,
      totalCost: Math.round(totalCost),
      costPerKm: Math.round(costPerKm * 100) / 100,
      distance: Math.round(distance * 100) / 100,
    };
  } catch (error) {
    throw new Error("Error calculating fuel cost: " + error.message);
  }
}

function updateFuelResults(result) {
  const { fuelNeeded, totalCost, costPerKm } = result;

  // Determine fuel unit
  const fuelType = document.querySelector(".fuel-type-btn.active").dataset.type;
  const fuelUnit = fuelType === "cng" ? "kg" : "L";
  const fuelLabel = fuelUnit === "kg" ? " Kilograms" : " Liters";

  // Update fuel needed
  document.getElementById("fuelRequired").textContent =
    formatNumber(fuelNeeded, 2) + " " + fuelUnit;
  document.getElementById("fuelRequiredInWords").textContent =
    numberToWords(fuelNeeded, "decimal") + fuelLabel;

  // Update total cost
  document.getElementById("totalCost").textContent = formatCurrency(totalCost);
  document.getElementById("totalCostInWords").textContent = numberToWords(
    totalCost,
    "currency"
  );

  // Update cost per unit (km or mile)
  const unit = document.querySelector(
    'input[name="distanceUnit"]:checked'
  ).value;
  document.getElementById("costPerUnit").textContent =
    "₹" + formatNumber(costPerKm, 2) + "/" + (unit === "km" ? "km" : "mile");
  document.getElementById("costPerUnitInWords").textContent =
    numberToWords(costPerKm, "currency") +
    " per " +
    (unit === "km" ? "Kilometer" : "Mile");

  // Round trip and monthly
  const roundTrip = totalCost * 2;
  const monthly = totalCost * 40; // 20 round trips
  document.getElementById("roundTripCost").textContent =
    formatCurrency(roundTrip);
  document.getElementById("roundTripCostInWords").textContent = numberToWords(
    roundTrip,
    "currency"
  );
  // document.getElementById("monthlyCost").textContent = formatCurrency(monthly);
  // document.getElementById("monthlyCostInWords").textContent = numberToWords(
  //   monthly,
  //   "decimal"
  // );

  // CO2 emissions
  const emissionFactors = { petrol: 2.31, diesel: 2.68, cng: 2.75 };
  const emissions = fuelNeeded * emissionFactors[fuelType];
  document.getElementById("emissions").textContent = `${emissions.toFixed(
    1
  )} kg`;
}

// sanitize value: allow digits and one dot, max 2 decimals
function _sanitizeCurrencyString(value) {
  // remove everything except digits and dots
  let s = value.replace(/[^\d.]/g, "");
  if (!s) return "";

  // keep only first dot, and max 2 decimal digits
  const parts = s.split(".");
  if (parts.length === 1) {
    return parts[0];
  }
  const intPart = parts.shift(); // first part before dot
  const decPart = parts.join("").slice(0, 2); // join any extra dots, then cap 2 digits
  return intPart + "." + decPart;
}

function formatFuelPrice(input, { onBlur = false } = {}) {
  if (!input) return;

  // sanitize current value
  const raw = input.value || "";
  const sanitized = _sanitizeCurrencyString(raw);

  if (sanitized === "") {
    input.value = "";
    return;
  }

  if (!onBlur) {
    // during typing: only replace with sanitized string (no toFixed, no grouping)
    input.value = sanitized;
  } else {
    // on blur: format to exactly 2 decimals for display
    const num = parseFloat(sanitized);
    if (isNaN(num)) {
      input.value = "";
    } else {
      // keep simple two-decimal format (no grouping) to avoid UI surprises
      input.value = num.toFixed(2);
    }
  }
}

function handleFuelCalculation(event) {
  if (event) event.preventDefault();

  try {
    const distance = parseFloat(document.getElementById("distance").value);
    const efficiency = parseFloat(document.getElementById("mileage").value);
    const fuelPrice = parseFloat(document.getElementById("fuelPrice").value);
    const unit = document.querySelector(
      'input[name="distanceUnit"]:checked'
    ).value;

    const result = calculateFuelCost(distance, efficiency, fuelPrice, unit);

    const resultElement = document.getElementById("fuelResult");
    if (resultElement) {
      resultElement.style.display = "block";
      updateFuelResults(result);
    }
  } catch (error) {
    showError(error.message);
    const resultElement = document.getElementById("fuelResult");
    if (resultElement) resultElement.style.display = "none";
  }
}

function initializeFuelTypeSwitch() {
  const buttons = document.querySelectorAll(".fuel-type-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove 'active' from all
      buttons.forEach((b) => b.classList.remove("active"));
      // Set current button active
      this.classList.add("active");

      // Only recalc if all inputs are non-empty & >0
      const distance = parseFloat(document.getElementById("distance").value);
      const efficiency = parseFloat(document.getElementById("mileage").value);
      const fuelPrice = parseFloat(document.getElementById("fuelPrice").value);

      if (distance > 0 && efficiency > 0 && fuelPrice > 0) {
        handleFuelCalculation();
      } else {
        // Clear results if inputs not valid
        const resultElement = document.getElementById("fuelResult");
        if (resultElement) resultElement.style.display = "none";
      }
    });
  });
}

function initializeFuelCalculator() {
  // Price input formatting
  // Set up fuel price input handler — sanitize while typing, format on blur
  const priceInput = document.getElementById("fuelPrice");
  if (priceInput) {
    // keep typing smooth — only sanitize the value as user types
    priceInput.addEventListener("input", function () {
      formatFuelPrice(this, { onBlur: false });
    });

    // when user leaves the field, format to two decimals
    priceInput.addEventListener("blur", function () {
      formatFuelPrice(this, { onBlur: true });
    });

    // optional: if you want to format when page loads and there's a saved value
    if (priceInput.value) {
      formatFuelPrice(priceInput, { onBlur: true });
    }
  }

  // Ensure distance and mileage are positive
  ["distance", "mileage"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", function () {
        const value = parseFloat(this.value);
        if (value < 0) this.value = 0;
      });
    }
  });

  initializeFuelTypeSwitch();

  // Form submission
  const fuelForm = document.getElementById("fuelForm");
  if (fuelForm) {
    fuelForm.addEventListener("submit", handleFuelCalculation);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeFuelCalculator);
