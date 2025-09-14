const version = "1.0.0"; // bump when assets change

// ---------------- Common JS (all pages) ----------------
const commonJs = [
  { type: "js", path: "js/components.js" },
  { type: "js", path: "js/utils.js" },
];

// ---------------- Page-Specific JS ----------------
const pageJs = {
  "index.html": [],
  "emi.html": [{ type: "js", path: "js/emi.js" }],
  "bmi.html": [{ type: "js", path: "js/bmi.js" }],
  "gst.html": [{ type: "js", path: "js/gst.js" }],
  "fuel.html": [{ type: "js", path: "js/fuel.js" }],
  "discount.html": [{ type: "js", path: "js/discount.js" }],
  "gold.html": [{ type: "js", path: "js/gold.js" }],
  "tax.html": [{ type: "js", path: "js/tax.js" }],
  "sip.html": [{ type: "js", path: "js/sip.js" }],
  "age.html": [{ type: "js", path: "js/age.js" }],
  "percentage.html": [{ type: "js", path: "js/percentage.js" }],
};

// ---------------- CSS Handling ----------------
function loadCssForPage(page) {
  if (page === "index.html") {
    // Special preload + async for index
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "style";
    preload.href = `css/styles.css?v=${version}`;
    preload.onload = function () {
      this.onload = null;
      this.rel = "stylesheet";
    };
    document.head.appendChild(preload);

    const noscript = document.createElement("noscript");
    noscript.innerHTML = `<link rel="stylesheet" href="css/styles.css?v=${version}">`;
    document.head.appendChild(noscript);
  } else {
    // Other pages → preload + async common.css + additional.css
    ["common.css", "additional.css"].forEach((file) => {
      const preload = document.createElement("link");
      preload.rel = "preload";
      preload.as = "style";
      preload.href = `css/${file}?v=${version}`;
      document.head.appendChild(preload);

      const asyncCss = document.createElement("link");
      asyncCss.rel = "stylesheet";
      asyncCss.href = `css/${file}?v=${version}`;
      asyncCss.media = "print";
      asyncCss.onload = function () {
        this.media = "all";
      };
      document.head.appendChild(asyncCss);
    });
  }
}

// ---------------- JS Loader ----------------
function loadJs(assets) {
  assets.forEach((asset) => {
    const script = document.createElement("script");
    script.src = `${asset.path}?v=${version}`;
    script.defer = true;
    document.body.appendChild(script);
  });
}

// ---------------- Run Loader ----------------
const currentPage = window.location.pathname.split("/").pop() || "index.html";

// Load CSS based on page
loadCssForPage(currentPage);

// Load JS (common + page specific)
loadJs([...commonJs, ...(pageJs[currentPage] || [])]);
