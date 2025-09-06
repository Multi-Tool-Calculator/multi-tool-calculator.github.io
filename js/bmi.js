// BMI Calculator functions

function calculateBMI(weight, height, unit = "metric") {
  try {
    // Validate inputs
    if (!validateNumericInput(weight, 1)) {
      throw new Error("Please enter a valid weight greater than 0");
    }
    if (!validateNumericInput(height, 1)) {
      throw new Error("Please enter a valid height greater than 0");
    }

    let bmi;
    if (unit === "metric") {
      // Weight in kg, height in cm
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
    } else {
      // Weight in lbs, height in inches
      bmi = (weight * 703) / (height * height);
    }

    const category = getBMICategory(bmi);
    const idealWeight = calculateIdealWeight(height, unit);

    return {
      bmi: Math.round(bmi * 10) / 10,
      category,
      idealWeight,
    };
  } catch (error) {
    throw new Error("Error calculating BMI: " + error.message);
  }
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return { name: "Underweight", class: "bmi-underweight" };
  if (bmi < 24.9) return { name: "Normal Weight", class: "bmi-normal" };
  if (bmi < 29.9) return { name: "Overweight", class: "bmi-overweight" };
  return { name: "Obese", class: "bmi-obese" };
}

function calculateIdealWeight(height, unit = "metric") {
  // Using the Hamwi formula
  let idealWeight;
  if (unit === "metric") {
    // Convert cm to inches for calculation
    const heightInInches = height / 2.54;
    if (heightInInches > 60) {
      idealWeight = {
        min: Math.round((heightInInches - 60) * 1.9 + 48.5),
        max: Math.round((heightInInches - 60) * 2.4 + 48.5),
      };
      // Convert pounds to kg for metric
      idealWeight.min = Math.round(idealWeight.min * 0.453592);
      idealWeight.max = Math.round(idealWeight.max * 0.453592);
    } else {
      idealWeight = { min: 45, max: 55 }; // Minimum healthy weight range in kg
    }
  }
  else {
    if (height > 60) {
      idealWeight = {
        min: Math.round((height - 60) * 1.9 + 48.5),
        max: Math.round((height - 60) * 2.4 + 48.5),
      };
    } else {
      idealWeight = { min: 100, max: 120 }; // Minimum healthy weight range in lbs
    }
  }
  return idealWeight;
}

function updateBMIResults(result) {
  const { bmi, category, idealWeight } = result;

  // Update BMI value
  const bmiElement = document.getElementById("bmiValue");
  if (bmiElement) bmiElement.textContent = formatNumber(bmi, 1);
  document.getElementById("bmiValueInWords").textContent = numberToWords(bmi);

  // Update BMI category
  const categoryElement = document.getElementById("bmiCategory");
  if (categoryElement) {
    categoryElement.textContent = category.name;
    categoryElement.className = "bmi-category " + category.class;
  }

  // Update ideal weight range
  const idealWeightElement = document.getElementById("idealWeight");
  if (idealWeightElement) {
    const unit = document
      .getElementById("metricToggle")
      .classList.contains("active")
      ? "kg"
      : "lbs";
    idealWeightElement.textContent = `${idealWeight.min} - ${idealWeight.max} ${unit}`;
  }

  // Update BMI chart highlighting
  const rows = document.querySelectorAll(".bmi-chart tr");
  rows.forEach((row) => {
    const range = row.dataset.range;
    if (range) {
      const [min, max] = range.split("-").map(Number);
      row.classList.toggle("active", bmi >= min && (!max || bmi <= max));
    }
  });
}

function handleBMICalculation(event) {
  if (event) event.preventDefault();

  try {
    const isMetric = document
      .getElementById("metricToggle")
      .classList.contains("active");
    let weight, height;

    if (isMetric) {
      weight = parseFloat(document.getElementById("weightKg").value);
      height = parseFloat(document.getElementById("heightCm").value);
    } else {
      weight = parseFloat(document.getElementById("weightLbs").value);
      const feet = parseInt(document.getElementById("heightFt").value) || 0;
      const inches = parseInt(document.getElementById("heightIn").value) || 0;
      height = feet * 12 + inches;
    }

    // Calculate BMI details
    const result = calculateBMI(
      weight,
      height,
      isMetric ? "metric" : "imperial"
    );

    // Update UI
    const resultElement = document.getElementById("bmiResult");
    if (resultElement) {
      resultElement.style.display = "block";
      updateBMIResults(result);
    }
  } catch (error) {
    showError(error.message);
    const resultElement = document.getElementById("bmiResult");
    if (resultElement) resultElement.style.display = "none";
  }
}

function toggleUnits(isMetric) {
  document.getElementById("metricToggle").classList.toggle("active", isMetric);
  document
    .getElementById("imperialToggle")
    .classList.toggle("active", !isMetric);
  document.getElementById("metricInputs").style.display = isMetric
    ? "block"
    : "none";
  document.getElementById("imperialInputs").style.display = isMetric
    ? "none"
    : "block";
}

function initializeBMICalculator() {
  // Set up unit toggle handlers
  document
    .getElementById("metricToggle")
    .addEventListener("click", () => toggleUnits(true));
  document
    .getElementById("imperialToggle")
    .addEventListener("click", () => toggleUnits(false));

  // Set up input validation
  const inputs = ["weightKg", "heightCm", "weightLbs", "heightFt", "heightIn"];
  inputs.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", () => {
        const value = parseFloat(input.value);
        if (value < 0) input.value = 0;
      });
    }
  });

  // Set up form submission handler
  const bmiForm = document.getElementById("bmiForm");
  if (bmiForm) {
    bmiForm.addEventListener("submit", handleBMICalculation);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeBMICalculator);
