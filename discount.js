document.addEventListener("DOMContentLoaded", () => {
  // --- Constants ---
  const ACTIVE_CLASS = "active";
  const SHOW_CLASS = "show";
  const LAST_DISCOUNT_TYPE_KEY = "lastDiscountType";
  const LAST_ORIGINAL_PRICE_KEY = "lastOriginalPrice";
  const LAST_DISCOUNT_PERCENT_KEY = "lastDiscountPercent";
  const LAST_GST_RATE_KEY = "lastGstRate";

  // --- Cached DOM Elements ---
  const discountTypeButtons = document.querySelectorAll(".discount-type-btn");
  const calculatorSections = document.querySelectorAll(".calculator-section");
  const includeTax = document.getElementById("includeTax");
  const gstInput = document.getElementById("gstInput");
  const includeMultiTax = document.getElementById("includeMultiTax");
  const multiGstInput = document.getElementById("multiGstInput");
  const singleDiscountForm = document.getElementById("singleDiscountForm");
  const addItemBtn = document.getElementById("addItemBtn");
  const calculateMultipleBtn = document.getElementById("calculateMultipleBtn");
  const itemList = document.getElementById("itemList");
  const originalPriceInput = document.getElementById("originalPrice");
  const discountPercentInput = document.getElementById("discountPercent");
  const gstRateInput = document.getElementById("gstRate");
  const multiGstRateInput = document.getElementById("multiGstRate");

  // --- Event Listeners ---

  discountTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      activateCalculator(type);
      localStorage.setItem(LAST_DISCOUNT_TYPE_KEY, type);
    });
  });

  includeTax.addEventListener("change", () => toggleGstInput(includeTax, gstInput, "gstRow"));
  includeMultiTax.addEventListener("change", () => toggleGstInput(includeMultiTax, multiGstInput, "multiGstRow"));

  singleDiscountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateSingleDiscount();
  });

  addItemBtn.addEventListener("click", addItem);
  calculateMultipleBtn.addEventListener("click", calculateMultipleDiscount);

  itemList.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("remove-item")) {
      removeItem(e.target.dataset.id);
    }
  });

  // --- UI Functions ---

  function activateCalculator(type) {
    discountTypeButtons.forEach((btn) => btn.classList.remove(ACTIVE_CLASS));
    calculatorSections.forEach((section) => section.classList.remove(ACTIVE_CLASS));

    const button = document.querySelector(`[data-type="${type}"]`);
    if (button) button.classList.add(ACTIVE_CLASS);

    const section = document.getElementById(`${type}Calc`);
    if (section) section.classList.add(ACTIVE_CLASS);

    document.querySelectorAll(".result").forEach((result) => result.classList.remove(SHOW_CLASS));
  }

  function toggleGstInput(checkbox, input, rowId) {
    input.style.display = checkbox.checked ? "block" : "none";
    const row = document.getElementById(rowId);
    if (row) row.style.display = "none";
  }

  // --- Calculation Functions ---

  function calculateGst(amount, rate) {
    return (amount * rate) / 100;
  }

  function calculateSingleDiscount() {
    try {
      const originalPrice = parseFloat(originalPriceInput.value);
      const discountPercent = parseFloat(discountPercentInput.value);

      if (!validateNumericInput(originalPrice, 0.01)) {
        showError("Please enter a valid price.");
        return;
      }
      if (!validateNumericInput(discountPercent, 0, 100)) {
        showError("Please enter a valid discount percentage (0-100).");
        return;
      }

      const includeTaxChecked = includeTax.checked;
      const gstRate = includeTaxChecked ? parseFloat(gstRateInput.value) || 0 : 0;

      const discountAmount = (originalPrice * discountPercent) / 100;
      const priceAfterDiscount = originalPrice - discountAmount;
      const gstAmount = calculateGst(priceAfterDiscount, gstRate);
      const finalPrice = priceAfterDiscount + gstAmount;

      updateSingleResultUI(originalPrice, discountAmount, priceAfterDiscount, gstAmount, finalPrice, discountPercent, includeTaxChecked);

      localStorage.setItem(LAST_ORIGINAL_PRICE_KEY, originalPrice);
      localStorage.setItem(LAST_DISCOUNT_PERCENT_KEY, discountPercent);
      if (includeTaxChecked) localStorage.setItem(LAST_GST_RATE_KEY, gstRate);
    } catch (error) {
      showError(error.message);
    }
  }

  function calculateMultipleDiscount() {
    try {
      const items = Array.from(document.querySelectorAll(".item-row")).map(row => {
        const priceInput = row.querySelector(".item-price");
        const discountInput = row.querySelector(".item-discount");
        return {
          price: parseFloat(priceInput.value) || 0,
          discount: parseFloat(discountInput.value) || 0,
        };
      });

      const includeMultiTaxChecked = includeMultiTax.checked;
      const gstRate = includeMultiTaxChecked ? parseFloat(multiGstRateInput.value) || 0 : 0;

      let totalOriginal = 0;
      let totalDiscount = 0;

      items.forEach((item) => {
        if (item.price > 0) {
            totalOriginal += item.price;
            totalDiscount += (item.price * item.discount) / 100;
        }
      });
      
      if (totalOriginal === 0) {
        showError("Please enter prices for items.");
        return;
      }

      const priceAfterDiscount = totalOriginal - totalDiscount;
      const gstAmount = calculateGst(priceAfterDiscount, gstRate);
      const finalTotal = priceAfterDiscount + gstAmount;

      updateMultipleResultUI(totalOriginal, totalDiscount, priceAfterDiscount, gstAmount, finalTotal, includeMultiTaxChecked);
    } catch (error) {
      showError(error.message);
    }
  }

  // --- Result UI Update Functions ---

  function updateSingleResultUI(originalPrice, discountAmount, priceAfterDiscount, gstAmount, finalPrice, discountPercent, includeTaxChecked) {
    document.getElementById("breakdownOriginal").textContent = formatCurrency(originalPrice);
    document.getElementById("breakdownDiscount").textContent = `-${formatCurrency(discountAmount)}`;
    document.getElementById("breakdownAfterDiscount").textContent = formatCurrency(priceAfterDiscount);

    const gstRow = document.getElementById("gstRow");
    if (includeTaxChecked) {
      document.getElementById("breakdownGST").textContent = formatCurrency(gstAmount);
      gstRow.style.display = "table-row";
    } else {
      gstRow.style.display = "none";
    }

    document.getElementById("breakdownTotal").textContent = formatCurrency(finalPrice);
    document.getElementById("savingsMessage").textContent = `You save ${formatCurrency(discountAmount)} (${discountPercent}% off)`;
    document.getElementById("singleResult").classList.add(SHOW_CLASS);
  }

  function updateMultipleResultUI(totalOriginal, totalDiscount, priceAfterDiscount, gstAmount, finalTotal, includeMultiTaxChecked) {
    document.getElementById("multiBreakdownOriginal").textContent = formatCurrency(totalOriginal);
    document.getElementById("multiBreakdownDiscount").textContent = `-${formatCurrency(totalDiscount)}`;
    document.getElementById("multiBreakdownAfterDiscount").textContent = formatCurrency(priceAfterDiscount);

    const multiGstRow = document.getElementById("multiGstRow");
    if (includeMultiTaxChecked) {
      document.getElementById("multiBreakdownGST").textContent = formatCurrency(gstAmount);
      multiGstRow.style.display = "table-row";
    } else {
      multiGstRow.style.display = "none";
    }

    document.getElementById("multiBreakdownTotal").textContent = formatCurrency(finalTotal);
    const totalDiscountPercent = (totalDiscount / totalOriginal) * 100 || 0;
    document.getElementById("multiSavingsMessage").textContent = `Total savings: ${formatCurrency(totalDiscount)} (${totalDiscountPercent.toFixed(1)}% off)`;
    document.getElementById("multipleResult").classList.add(SHOW_CLASS);
  }

  // --- DOM Manipulation ---

  function addItem() {
    const itemId = Date.now();
    const itemRow = document.createElement("div");
    itemRow.className = "item-row";
    itemRow.dataset.id = itemId;

    itemRow.innerHTML = `
      <input type="text" class="form-input item-name" placeholder="Item name">
      <input type="number" class="form-input item-price" placeholder="Price" min="0.01" step="0.01">
      <input type="number" class="form-input item-discount" placeholder="Discount %" min="0" max="100" step="0.1">
      <button type="button" class="remove-item" data-id="${itemId}">×</button>
    `;

    itemList.appendChild(itemRow);
  }

  function removeItem(itemId) {
    const item = document.querySelector(`.item-row[data-id="${itemId}"]`);
    if (item) item.remove();
  }

  // --- Initialization ---

  function loadSavedValues() {
    const savedDiscountType = localStorage.getItem(LAST_DISCOUNT_TYPE_KEY);
    if (savedDiscountType) {
      activateCalculator(savedDiscountType);
    }

    const savedOriginalPrice = localStorage.getItem(LAST_ORIGINAL_PRICE_KEY);
    if (savedOriginalPrice) originalPriceInput.value = savedOriginalPrice;

    const savedDiscountPercent = localStorage.getItem(LAST_DISCOUNT_PERCENT_KEY);
    if (savedDiscountPercent) discountPercentInput.value = savedDiscountPercent;

    const savedGstRate = localStorage.getItem(LAST_GST_RATE_KEY);
    if (savedGstRate) {
      includeTax.checked = true;
      toggleGstInput(includeTax, gstInput, "gstRow");
      gstRateInput.value = savedGstRate;
    }

    if (itemList.children.length === 0) {
      addItem();
    }
  }

  loadSavedValues();
});