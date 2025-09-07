// Utility function to get current page name
function getCurrentPage() {
  return window.location.pathname.split("/").pop().replace(".html", "");
}

// Custom Header Component
class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const title = this.getAttribute("title") || "Multi-Tool Calculator";
    const subtitle = this.getAttribute("subtitle") || "";
    const currentPage = getCurrentPage();

    const getNavLinks = () => `
      <a href="index.html" class="${
        currentPage === "index" ? "active" : ""
      }">Home</a>
      <a href="emi.html" class="${
        currentPage === "emi" ? "active" : ""
      }">EMI</a>
      <a href="gst.html" class="${
        currentPage === "gst" ? "active" : ""
      }">GST</a>
      <a href="sip.html" class="${
        currentPage === "sip" ? "active" : ""
      }">SIP</a>
      <a href="tax.html" class="${
        currentPage === "tax" ? "active" : ""
      }">Tax</a>
      <a href="bmi.html" class="${
        currentPage === "bmi" ? "active" : ""
      }">BMI</a>
      <a href="age.html" class="${
        currentPage === "age" ? "active" : ""
      }">Age</a>
      <a href="gold.html" class="${
        currentPage === "gold" ? "active" : ""
      }">Gold</a>
      <a href="fuel.html" class="${
        currentPage === "fuel" ? "active" : ""
      }">Fuel</a>
      <a href="percentage.html" class="${
        currentPage === "percentage" ? "active" : ""
      }">Percentage</a>
      <a href="discount.html" class="${
        currentPage === "discount" ? "active" : ""
      }">Discount</a>
    `;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background: var(--primary-color, #2196F3);
          color: var(--text-light, #ffffff);
        }
        .app-header {
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
        }
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        .header-title {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 600;
        }
        .header-subtitle {
          margin: 0.5rem 0;
          font-size: 1rem;
          opacity: 0.9;
        }

        /* Desktop Nav */
        .nav-menu {
          margin-top: 1rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
        }
        .nav-menu a {
          color: var(--text-light, #ffffff);
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: background-color 0.3s;
        }
        .nav-menu a:hover {
          background-color: rgba(255,255,255,0.1);
        }
        .nav-menu a.active {
          background-color: rgba(255,255,255,0.2);
          font-weight: 600;
        }

        /* Mobile Hamburger */
        .hamburger {
          display: none;
          font-size: 1.5rem;
          cursor: pointer;
          background: none;
          border: none;
          color: var(--text-light, #ffffff);
          position: absolute;
          right: 1rem;
          top: 1rem;
        }

        .side-menu{
          display: none;}


        @media (max-width: 768px) {
          .nav-menu {
            display: none; /* hide desktop nav */
          }
          .hamburger {
            display: block; /* show hamburger */
          }
            /* Side menu */
          .side-menu {
            display: block;
            position: fixed;
            top: 0;
            left: -285px;
            height: 100%;
            width: 250px;
            background: var(--primary-color, #2196F3);
            box-shadow: 2px 0 5px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            padding: 1rem;
            transition: left 0.3s ease;
            z-index: 1000;
          }
          .side-menu.open {
            left: 0;
          }
          .side-menu a {
            color: var(--text-light, #ffffff);
            text-decoration: none;
            padding: 0.75rem 1rem;
            border-radius: 4px;
            margin-bottom: 0.5rem;
          }
          .side-menu a.active {
            background-color: rgba(255,255,255,0.2);
            font-weight: 600;
          }
        }
      </style>

      <header class="app-header">
        <div class="header-content">
          <h1 class="header-title">${title}</h1>
          ${subtitle ? `<p class="header-subtitle">${subtitle}</p>` : ""}
          <button class="hamburger">&#9776;</button>
          <nav class="nav-menu">
            ${getNavLinks()}
          </nav>
        </div>
      </header>

      <!-- Side Menu for Mobile -->
      <nav class="side-menu">
        ${getNavLinks()}
      </nav>
    `;

    // Add toggle for side menu
    const hamburger = this.shadowRoot.querySelector(".hamburger");
    const sideMenu = this.shadowRoot.querySelector(".side-menu");
    hamburger.addEventListener("click", () => {
      sideMenu.classList.toggle("open");
    });
  }
}

// Custom Footer Component
class AppFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const year = new Date().getFullYear();

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          background: var(--footer-bg, #f5f5f5);
          color: var(--text-dark, #333);
          box-shadow: 0 0 20px rgba(0, 0, 0, .2);
        }
        .footer {
          padding: 1rem;
          text-align: center;
          font-size: 0.9rem;
        }
        .footer p {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
        }
        .footer a {
          color: var(--primary-color, #2196F3);
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
      <footer class="footer">
        <p>© ${year} Multi-Tool Calculator. All rights reserved. <a href="terms.html">Terms of Use</a></p>
      </footer>
    `;
  }
}

// Custom Result Display Component
class ResultDisplay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["value", "label", "type"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.shadowRoot.innerHTML !== "") {
      this.updateContent();
    }
  }

  connectedCallback() {
    this.updateContent();
  }

  updateContent() {
    const value = this.getAttribute("value") || "0";
    const label = this.getAttribute("label") || "";
    const type = this.getAttribute("type") || "text";

    // Convert to number safely
    const numericValue = parseFloat(value.replace(/,/g, "")) || 0;

    // Convert number to words (requires global numberToWords function)
    const words =
      numericValue > 0 ? numberToWords(Math.round(numericValue)) : "";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 0.5rem 0;
        }
        .result-container {
          background: var(--surface-color, #ffffff);
          padding: 1rem;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .result-label {
          color: var(--text-secondary, #666);
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        .result-value {
          color: var(--text-primary, #333);
          font-size: 1.2rem;
          font-weight: 600;
        }
        .result-value.currency::before {
          content: '₹';
          margin-right: 0.25rem;
        }
        .result-value.percentage::after {
          content: '%';
          margin-left: 0.25rem;
        }
      </style>
      <div class="result-container">
        <div class="result-label">${label}</div>
        <div class="result-value ${type}">${value}</div>
        <div class="amount-in-words">${words}</div>
      </div>
    `;
  }
}

// Register Custom Elements
customElements.define("app-header", AppHeader);
customElements.define("app-footer", AppFooter);
customElements.define("result-display", ResultDisplay);
