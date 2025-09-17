const fs = require("fs");
const path = require("path");

const CACHE_VERSION = "v1.0.0"; // bump this each release
const PROJECT_DIR = "./"; // root directory of the project

// Regex: matches href/src pointing to .css or .js files
const regex = /(href|src)\s*=\s*(['"])([^'"]+?\.(?:css|js))(?:\?v=[^'"]*)?\2/gi;

function updateCacheVersionInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  const updatedContent = content.replace(regex, (match, attr, quote, url) => {
    // Skip external URLs (CDN, http, https, protocol-relative //)
    if (/^(https?:)?\/\//i.test(url)) {
      return match; // keep original
    }

    // Remove any existing ?v=... and add the new version
    const cleanUrl = url.replace(/\?v=.*$/, "");
    return `${attr}=${quote}${cleanUrl}?v=${CACHE_VERSION}${quote}`;
  });

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, "utf8");
    console.log(`✅ Updated cache version in: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (stat.isFile() && path.extname(fullPath) === ".html") {
      updateCacheVersionInFile(fullPath);
    }
  }
}

walkDir(PROJECT_DIR);
console.log("🎉 Cache version update completed.");
