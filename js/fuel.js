// Fuel Calculator functions

function calculateFuelCost(distance, efficiency, fuelPrice, unit = "kmpl") {
  try {
    // Validate inputs
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
    if (unit === "mpg") {
      // Convert miles to kilometers and gallons to liters
      distance = distance * 1.60934;
      efficiency = efficiency * 0.425144; // Convert MPG to km/L
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
  const { fuelNeeded, totalCost, costPerKm, distance } = result;

  // Update fuel needed
  const fuelElement = document.getElementById("fuelRequired");
  if (fuelElement) fuelElement.textContent = formatNumber(fuelNeeded, 2) + " L";
  document.getElementById("fuelRequiredInWords").textContent = numberToWords(
    fuelNeeded,
    "liter"
  );

  // Update total cost
  const costElement = document.getElementById("totalCost");
  const costWordsElement = document.getElementById("totalCostInWords");
  if (costElement) costElement.textContent = formatCurrency(totalCost);
  if (costWordsElement) costWordsElement.textContent = numberToWords(totalCost);

  // Update cost per km
  const costPerKmElement = document.getElementById("costPerUnit");
  if (costPerKmElement)
    costPerKmElement.textContent = "₹" + formatNumber(costPerKm, 2) + "/km";
  document.getElementById("costPerUnitInWords").textContent =
    numberToWords(costPerKm);

  // Update distance breakdown
  document.getElementById("roundTripCost").textContent = formatCurrency(
    totalCost * 2
  );
  document.getElementById("roundTripCostInWords").textContent = numberToWords(
    totalCost * 2
  );
  document.getElementById("monthlyCost").textContent = formatCurrency(
    totalCost * 40
  );
  document.getElementById("monthlyCostInWords").textContent = numberToWords(
    totalCost * 40
  );

  // Update CO2 emissions (rough estimate)
  const emissionFactors = {
    petrol: 2.31, // kg CO2 per liter
    diesel: 2.68,
    cng: 2.75, // kg CO2 per kg of CNG
  };

  const fuelType = document.querySelector(".fuel-type-btn.active").dataset.type;
  const emissions = fuelNeeded * emissionFactors[fuelType];
  document.getElementById("emissions").textContent = `${emissions.toFixed(
    1
  )} kg`;
}

function updateDistanceBreakdown(distance, costPerKm) {
  const breakdowns = [
    { label: "50 km", distance: 50 },
    { label: "100 km", distance: 100 },
    { label: "500 km", distance: 500 },
    { label: "1000 km", distance: 1000 },
  ];

  const breakdownContainer = document.getElementById("distanceBreakdown");
  if (!breakdownContainer) return;

  let html = '<div class="cost-breakdown">';
  breakdowns.forEach((item) => {
    const cost = item.distance * costPerKm;
    html += `
      <div class="cost-breakdown-item">
        <span>${item.label}</span>
        <span>${formatCurrency(Math.round(cost))}</span>
      </div>`;
  });
  html += "</div>";
  breakdownContainer.innerHTML = html;
}

function formatFuelPrice(input) {
  // Remove any non-numeric characters
  let rawValue = input.value.replace(/[^\d.]/g, "");

  if (rawValue) {
    // Parse as number
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      input.value = numValue.toFixed(2);
      // Clear any validation errors
      input.setCustomValidity("");
      input.checkValidity();
    }
  } else {
    input.value = "";
  }
}

function handleFuelCalculation(event) {
  if (event) event.preventDefault();

  try {
    // Get input values
    const distance = parseFloat(document.getElementById("distance").value);
    const efficiency = parseFloat(document.getElementById("mileage").value);
    const fuelPrice = parseFloat(document.getElementById("fuelPrice").value);
    const unit = document.querySelector(
      'input[name="distanceUnit"]:checked'
    ).value;

    // Calculate fuel details
    const result = calculateFuelCost(distance, efficiency, fuelPrice, unit);

    // Update UI
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

function updateEfficiencyLabel() {
  const isImperial = document.getElementById("imperialUnits").checked;
  const label = document.querySelector('label[for="efficiency"]');
  if (label) {
    label.textContent = `Fuel Efficiency (${
      isImperial ? "Miles per Gallon" : "Kilometers per Liter"
    })`;
  }
}

function initializeFuelCalculator() {
  // Set up fuel price input handler
  const priceInput = document.getElementById("fuelPrice");
  if (priceInput) {
    priceInput.addEventListener("input", function (e) {
      formatFuelPrice(this);
    });
  }

  // Set up number input handlers
  const numberInputs = ["distance", "mileage"];
  numberInputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", function (e) {
        const value = parseFloat(this.value);
        if (value < 0) input.value = 0;
      });
    }
  });

  // Set up unit toggle handler
  const unitToggle = document.getElementById("imperialUnits");
  if (unitToggle) {
    unitToggle.addEventListener("change", function () {
      updateEfficiencyLabel();
    });
  }

  // Set up form submission handler
  const fuelForm = document.getElementById("fuelForm");
  if (fuelForm) {
    fuelForm.addEventListener("submit", handleFuelCalculation);
  }

  // Set initial efficiency label
  updateEfficiencyLabel();
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeFuelCalculator);