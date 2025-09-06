// Age Calculator functions

function calculateAge(birthDate, targetDate = new Date()) {
  try {
    // Validate inputs
    if (!(birthDate instanceof Date) || isNaN(birthDate)) {
      throw new Error("Please enter a valid birth date");
    }
    if (!(targetDate instanceof Date) || isNaN(targetDate)) {
      throw new Error("Please enter a valid target date");
    }
    if (birthDate > targetDate) {
      throw new Error("Birth date cannot be in the future");
    }

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    // Adjust for negative months or days
    if (days < 0) {
      months--;
      // Get days in the previous month
      const previousMonth = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        0
      );
      days += previousMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate total values
    const totalMonths = years * 12 + months;
    const totalDays = Math.floor(
      (targetDate - birthDate) / (1000 * 60 * 60 * 24)
    );
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Calculate next birthday
    let nextBirthday = new Date(
      targetDate.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    if (nextBirthday < targetDate) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil(
      (nextBirthday - targetDate) / (1000 * 60 * 60 * 24)
    );

    // Calculate zodiac sign
    const zodiac = getZodiacSign(birthDate);

    return {
      years,
      months,
      days,
      totalMonths,
      totalDays,
      totalHours,
      totalMinutes,
      daysUntilBirthday,
      zodiac,
    };
  } catch (error) {
    throw new Error("Error calculating age: " + error.message);
  }
}

function getZodiacSign(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;

  const signs = [
    { name: "Capricorn", symbol: "♑", start: [1, 1], end: [1, 19] },
    { name: "Aquarius", symbol: "♒", start: [1, 20], end: [2, 18] },
    { name: "Pisces", symbol: "♓", start: [2, 19], end: [3, 20] },
    { name: "Aries", symbol: "♈", start: [3, 21], end: [4, 19] },
    { name: "Taurus", symbol: "♉", start: [4, 20], end: [5, 20] },
    { name: "Gemini", symbol: "♊", start: [5, 21], end: [6, 20] },
    { name: "Cancer", symbol: "♋", start: [6, 21], end: [7, 22] },
    { name: "Leo", symbol: "♌", start: [7, 23], end: [8, 22] },
    { name: "Virgo", symbol: "♍", start: [8, 23], end: [9, 22] },
    { name: "Libra", symbol: "♎", start: [9, 23], end: [10, 22] },
    { name: "Scorpio", symbol: "♏", start: [10, 23], end: [11, 21] },
    { name: "Sagittarius", symbol: "♐", start: [11, 22], end: [12, 21] },
    { name: "Capricorn", symbol: "♑", start: [12, 22], end: [12, 31] },
  ];

  for (const sign of signs) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;

    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return sign;
    }
  }

  return signs[0]; // Default to Capricorn
}

function updateAgeResults(result) {
  const {
    years,
    months,
    days,
    totalMonths,
    totalDays,
    totalHours,
    totalMinutes,
    daysUntilBirthday,
    zodiac,
  } = result;

  // Update main age display
  document.getElementById(
    "exactAge"
  ).textContent = `${years} years, ${months} months, ${days} days`;
  document.getElementById("totalYears").textContent = years;
  document.getElementById("totalYearsInWords").textContent = numberToWords(
    years,
    "year"
  );
  document.getElementById("totalMonths").textContent = months;
  document.getElementById("totalMonthsInWords").textContent = numberToWords(
    months,
    "month"
  );
  document.getElementById("totalDays").textContent = days;
  document.getElementById("totalDaysInWords").textContent = numberToWords(
    days,
    "day"
  );

  console.log("totalMonths", totalMonths);

  // Update total values
  document.getElementById("lifetimeMonths").textContent =
    totalMonths.toLocaleString();
  document.getElementById("lifetimeWeeks").textContent = Math.floor(
    totalDays / 7
  ).toLocaleString();
  document.getElementById("lifetimeDays").textContent =
    totalDays.toLocaleString();
  document.getElementById("lifetimeHours").textContent =
    totalHours.toLocaleString();

  // Update next birthday
  document.getElementById("daysUntilBirthday").textContent = daysUntilBirthday;
  document.getElementById("daysUntilBirthdayInWords").textContent =
    numberToWords(daysUntilBirthday, "day");

  // Update zodiac sign
  document.getElementById("zodiacEmoji").textContent = zodiac.symbol;
  document.getElementById("zodiacName").textContent = zodiac.name;
  document.getElementById("zodiacDate").textContent = `${zodiac.start[0]
    .toString()
    .padStart(2, "0")}-${zodiac.start[1]
    .toString()
    .padStart(2, "0")} to ${zodiac.end[0]
    .toString()
    .padStart(2, "0")}-${zodiac.end[1].toString().padStart(2, "0")}`;
}

function handleAgeCalculation(event) {
  if (event) event.preventDefault();

  try {
    // Get birth date
    const birthDate = new Date(document.getElementById("birthDate").value);

    // Get target date if provided, otherwise use current date
    const targetDateInput = document.getElementById("calculateTo");
    const targetDate = targetDateInput.value
      ? new Date(targetDateInput.value)
      : new Date();

    // Calculate age details
    const result = calculateAge(birthDate, targetDate);
    console.log(result);

    // Update UI
    const resultElement = document.getElementById("ageResult");
    const timeFactsElement = document.getElementById("timeFacts");
    if (resultElement) {
      resultElement.style.display = "block";
      timeFactsElement.style.display = "block";
      updateAgeResults(result);
    }
  } catch (error) {
    showError(error.message);
    const resultElement = document.getElementById("ageResult");
    const timeFactsElement = document.getElementById("timeFacts");
    if (resultElement) resultElement.style.display = "none";
    if (timeFactsElement) timeFactsElement.style.display = "none";
  }
}

function initializeAgeCalculator() {
  // Set maximum dates
  const today = new Date().toISOString().split("T")[0];
  const birthDateInput = document.getElementById("birthDate");
  const targetDateInput = document.getElementById("calculateTo");

  if (birthDateInput) {
    birthDateInput.max = today;
  }

  if (targetDateInput) {
    targetDateInput.value = today;
  }

  // Set up form submission handler
  const ageForm = document.getElementById("ageForm");
  if (ageForm) {
    ageForm.addEventListener("submit", handleAgeCalculation);
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeAgeCalculator);
