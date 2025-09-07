document.addEventListener("DOMContentLoaded", () => {
  // CONFIG: update if rules change
  const CONFIG = {
    newRegime: {
      slabs: [
        { upTo: 400000, rate: 0 }, // Up to 4L
        { upTo: 800000, rate: 0.05 }, // 4L - 8L
        { upTo: 1200000, rate: 0.1 }, // 8L - 12L
        { upTo: 1600000, rate: 0.15 }, // 12L - 16L
        { upTo: 2000000, rate: 0.2 }, // 16L - 20L
        { upTo: 2400000, rate: 0.25 }, // 20L - 24L
        { upTo: Infinity, rate: 0.3 }, // >24L
      ],
      rebateThreshold: 1200000,
      rebateAmount: 60000,
    },
    oldRegime: {
      slabs: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.2 },
        { upTo: Infinity, rate: 0.3 },
      ],
      rebateThreshold: 500000,
      rebateAmount: 12500,
      section80Ccap: 150000,
    },
    surchargeRates: [
      { threshold: 50000000, rate: 0.37 },
      { threshold: 20000000, rate: 0.25 },
      { threshold: 10000000, rate: 0.15 },
      { threshold: 5000000, rate: 0.1 },
    ],
    defaultStandardDeduction: 50000,
    salariedStandardNew: 75000,
    salariedStandardOld: 50000,
  };

  // DOM refs (safe: check if present)
  const taxForm = document.getElementById("taxForm");
  const newRegimeBtn = document.getElementById("newRegimeBtn");
  const oldRegimeBtn = document.getElementById("oldRegimeBtn");
  const slabsTitle = document.getElementById("slabsTitle");
  const newRegimeSlabs = document.getElementById("newRegimeSlabs");
  const oldRegimeSlabs = document.getElementById("oldRegimeSlabs");
  const annualIncomeInput = document.getElementById("annualIncome");
  const incomeInWords = document.getElementById("incomeInWords");
  const oldRegimeDeductions = document.getElementById("oldRegimeDeductions");
  const newRegimeNote = document.getElementById("newRegimeNote");
  const newRegimeDeductions = document.getElementById("newRegimeDeductions");
  const standardDeduction = document.getElementById("standardDeduction");
  const isSalariedInput = document.getElementById("isSalaried");

  // deduction inputs (might be missing in DOM; that's okay)
  const sec80CInput = document.getElementById("section80C");
  const sec80DInput = document.getElementById("section80D");
  const hraInput = document.getElementById("hraExemption");
  const housingLoanInput = document.getElementById("housingLoan");

  const section80CWords = document.getElementById("section80CWords");
  const section80DWords = document.getElementById("section80DWords");
  const hraExemptionWords = document.getElementById("hraExemptionWords");
  const housingLoanWords = document.getElementById("housingLoanWords");

  // Helpers
  function parseInputValue(el) {
    if (!el) return 0;
    const v = (el.value || "").toString().replace(/,/g, "").trim();
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }
  function validateNumericInput(n) {
    return typeof n === "number" && isFinite(n) && n > 0;
  }
  function showError(msg) {
    if (typeof window.showError === "function") return window.showError(msg);
    alert(msg);
  }
  function formatCurrency(n) {
    if (n == null || isNaN(n)) return "₹0";
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }
  // number -> words for currency (integer + paise)
  function numberToWordsCurrency(num) {
    if (num == null || isNaN(num)) return "";
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
    function inWords(n) {
      n = Math.floor(n);
      if (n < 20) return ones[n];
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + inWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          inWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + inWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          inWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + inWords(n % 100000) : "")
        );
      return (
        inWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + inWords(n % 10000000) : "")
      );
    }
    const rounded = Math.round(parseFloat(num) * 100) / 100;
    const integerPart = Math.floor(rounded);
    const paise = Math.round((rounded - integerPart) * 100);
    let words = inWords(integerPart)
      ? inWords(integerPart) + " Rupees"
      : "Zero Rupees";
    if (paise > 0) words += " and " + inWords(paise) + " Paise";
    return words;
  }

  function computeTaxFromSlabs(taxableIncome, slabs) {
    let tax = 0;
    let prev = 0;
    for (let i = 0; i < slabs.length; i++) {
      const { upTo, rate } = slabs[i];
      const upper = upTo === Infinity ? taxableIncome : upTo;
      if (taxableIncome > prev) {
        const taxableInBracket = Math.min(taxableIncome, upper) - prev;
        tax += taxableInBracket * rate;
      }
      prev = upTo;
      if (prev >= taxableIncome) break;
    }
    return tax;
  }
  function findSurchargeRate(income) {
    for (let s of CONFIG.surchargeRates) {
      if (income > s.threshold) return s.rate;
    }
    return 0;
  }

  // ✅ Unified amount in words + validation
  function updateAmountInWords(input, wordsElementId, maxLimit = null) {
    let value = parseInt((input.value || "").replace(/,/g, "")) || 0;

    if (maxLimit !== null && value > maxLimit) {
      value = maxLimit;
      input.value = maxLimit.toLocaleString("en-IN");
    } else if (value > 0) {
      input.value = value.toLocaleString("en-IN");
    }

    const words = numberToWordsCurrency(value);
    const target = document.getElementById(wordsElementId);
    if (target) target.textContent = words || "";
  }

  // Toggle regime and preserve income; update deduction defaults
  function toggleRegime(isNew) {
    const incomePreserve = annualIncomeInput ? annualIncomeInput.value : "";

    if (newRegimeBtn) newRegimeBtn.classList.toggle("active", isNew);
    if (oldRegimeBtn) oldRegimeBtn.classList.toggle("active", !isNew);

    if (slabsTitle)
      slabsTitle.textContent = `Tax Slabs (${
        isNew ? "New" : "Old"
      } Regime) - FY 2025-26`;
    if (newRegimeSlabs) newRegimeSlabs.style.display = isNew ? "block" : "none";
    if (oldRegimeSlabs) oldRegimeSlabs.style.display = isNew ? "none" : "block";

    if (oldRegimeDeductions)
      oldRegimeDeductions.style.display = isNew ? "none" : "block";
    if (newRegimeNote) newRegimeNote.style.display = isNew ? "block" : "none";
    if (newRegimeDeductions)
      newRegimeDeductions.style.display = isNew ? "block" : "none";

    // clear deduction inputs except income and standardDeduction
    if (taxForm) {
      const inputs = taxForm.querySelectorAll(
        "input[type='text'], input[type='number']"
      );
      inputs.forEach((inp) => {
        if (!inp.id) return;
        if (inp.id === "annualIncome" || inp.id === "standardDeduction") return;
        // preserve 'isSalaried' checkbox
        if (inp.type === "checkbox") return;
        inp.value = "";
      });
    }

    // set standard deduction based on salaried checkbox (if present)
    if (standardDeduction) {
      if (isSalariedInput && isSalariedInput.checked) {
        standardDeduction.value = (
          isNew ? CONFIG.salariedStandardNew : CONFIG.salariedStandardOld
        ).toLocaleString("en-IN");
      } else {
        // non-salaried -> no standard deduction shown
        standardDeduction.value = "0";
      }
    }
  }

  // Update standard deduction when salaried checkbox toggles
  if (isSalariedInput) {
    isSalariedInput.addEventListener("change", () => {
      // reapply based on current active regime
      const activeIsNew =
        newRegimeBtn && newRegimeBtn.classList.contains("active");
      toggleRegime(activeIsNew);
    });
  }

  // wire buttons
  if (newRegimeBtn)
    newRegimeBtn.addEventListener("click", () => toggleRegime(true));
  if (oldRegimeBtn)
    oldRegimeBtn.addEventListener("click", () => toggleRegime(false));

  // live income-in-words & format on blur
  if (annualIncomeInput) {
    annualIncomeInput.addEventListener("input", () => {
      const v = parseInputValue(annualIncomeInput);
      if (incomeInWords)
        incomeInWords.textContent = v > 0 ? numberToWordsCurrency(v) : "";
      annualIncomeInput.dataset.lastValue = annualIncomeInput.value;
    });
    annualIncomeInput.addEventListener("blur", () => {
      const v = parseInputValue(annualIncomeInput);
      if (!isNaN(v) && v !== 0)
        annualIncomeInput.value = Math.round(v).toLocaleString("en-IN");
    });
  }

  // core calculation
  function calculateIncomeTax(incomeRaw, regimeName) {
    const income = Math.max(0, parseFloat(incomeRaw) || 0);

    // determine standard deduction
    let stdDed = 0;
    if (isSalariedInput && isSalariedInput.checked) {
      stdDed =
        regimeName === "new"
          ? CONFIG.salariedStandardNew
          : CONFIG.salariedStandardOld;
    } else {
      // fallback to UI standardDeduction value if present (but prefer salaried flags)
      const uiStd = parseInputValue(standardDeduction);
      stdDed = uiStd || 0;
    }

    let deductions = 0;
    if (regimeName === "old") {
      const sec80C = Math.min(
        parseInputValue(sec80CInput),
        CONFIG.oldRegime.section80Ccap
      );
      const sec80D = parseInputValue(sec80DInput);
      const hra = parseInputValue(hraInput);
      const housingLoan = parseInputValue(housingLoanInput);
      deductions = sec80C + sec80D + hra + housingLoan + stdDed;
    } else {
      deductions = stdDed;
    }

    const taxableIncome = Math.max(0, income - deductions);

    const regimeConfig =
      regimeName === "new" ? CONFIG.newRegime : CONFIG.oldRegime;
    const baseTax = computeTaxFromSlabs(taxableIncome, regimeConfig.slabs);

    // rebate (based on taxable income threshold)
    let rebate = 0;
    if (taxableIncome <= regimeConfig.rebateThreshold) {
      rebate = Math.min(regimeConfig.rebateAmount, baseTax);
    }
    const taxAfterRebate = Math.max(0, baseTax - rebate);

    const surchargeRate = findSurchargeRate(income);
    const surcharge = taxAfterRebate * surchargeRate;
    const cess = 0.04 * (taxAfterRebate + surcharge);
    const totalTax = Math.round(taxAfterRebate + surcharge + cess);

    return {
      taxableIncome: Math.round(taxableIncome),
      baseTax: Math.round(baseTax),
      rebate: Math.round(rebate),
      taxAfterRebate: Math.round(taxAfterRebate),
      surcharge: Math.round(surcharge),
      cess: Math.round(cess),
      totalTax,
      effectiveRate:
        income > 0 ? ((totalTax / income) * 100).toFixed(2) : "0.00",
      deductionsApplied: Math.round(deductions),
    };
  }

  function updateTaxResults(result, income) {
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText("basicTax", formatCurrency(result.taxAfterRebate));
    setText("basicTaxInWords", numberToWordsCurrency(result.taxAfterRebate));
    setText("surcharge", formatCurrency(result.surcharge));
    setText("surchargeInWords", numberToWordsCurrency(result.surcharge));
    setText("cess", formatCurrency(result.cess));
    setText("cessInWords", numberToWordsCurrency(result.cess));
    setText("totalTax", formatCurrency(result.totalTax));
    setText("totalTaxInWords", numberToWordsCurrency(result.totalTax));

    const monthlyTaxValue = Math.round(result.totalTax / 12);
    setText("monthlyTax", formatCurrency(monthlyTaxValue));
    setText("monthlyTaxInWords", numberToWordsCurrency(monthlyTaxValue));

    setText("monthlyIncome", formatCurrency(Math.round(income / 12)));
    setText(
      "monthlyIncomeInWords",
      numberToWordsCurrency(Math.round(income / 12))
    );
    setText("effectiveRate", `${result.effectiveRate}%`);

    // optional: show taxable income / deductions if present
    const taxableEl = document.getElementById("taxableIncome");
    if (taxableEl) taxableEl.textContent = formatCurrency(result.taxableIncome);
    const deductionsEl = document.getElementById("deductionsApplied");
    if (deductionsEl)
      deductionsEl.textContent = formatCurrency(result.deductionsApplied);

    const taxResultEl = document.getElementById("taxResult");
    if (taxResultEl) taxResultEl.style.display = "block";
  }

  // submit handler
  if (taxForm) {
    taxForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const raw =
        annualIncomeInput && annualIncomeInput.value
          ? annualIncomeInput.value.toString().replace(/,/g, "").trim()
          : "";
      const income = parseFloat(raw);
      if (!validateNumericInput(income)) {
        showError("Please enter a valid annual income greater than 0.");
        return;
      }
      const regime =
        newRegimeBtn && newRegimeBtn.classList.contains("active")
          ? "new"
          : "old";
      const result = calculateIncomeTax(income, regime);
      updateTaxResults(result, income);
    });
  }

  // init: set standard deduction based on salaried flag and default to New regime
  if (standardDeduction) {
    const salaried = isSalariedInput ? isSalariedInput.checked : false;
    standardDeduction.value = salaried
      ? CONFIG.salariedStandardNew.toLocaleString("en-IN")
      : "0";
  }

  // Attach input listeners
  if (annualIncomeInput)
    annualIncomeInput.addEventListener("input", () =>
      updateAmountInWords(annualIncomeInput, "incomeInWords")
    );

  if (sec80CInput)
    sec80CInput.addEventListener("input", () =>
      updateAmountInWords(sec80CInput, "section80CWords", 150000)
    );

  if (sec80DInput)
    sec80DInput.addEventListener("input", () =>
      updateAmountInWords(sec80DInput, "section80DWords", 50000)
    );

  if (hraInput)
    hraInput.addEventListener("input", () =>
      updateAmountInWords(hraInput, "hraExemptionWords")
    );

  if (housingLoanInput)
    housingLoanInput.addEventListener("input", () =>
      updateAmountInWords(housingLoanInput, "housingLoanWords", 200000)
    );

  // default to New regime
  toggleRegime(true);
});
