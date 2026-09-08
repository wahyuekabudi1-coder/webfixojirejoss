const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '..', 'node_modules', '@arto-pay', 'js-sdk', 'dist', 'arto-pay-sdk.esm.js'),
  path.join(__dirname, '..', 'node_modules', '@arto-pay', 'js-sdk', 'dist', 'arto-pay-sdk.umd.js')
];

targetFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');

    // 1. Ensure dynamic public key fallback lookup
    code = code.replace(
      /null===\(S=document\.currentScript\)\|\|void 0===S\?void 0:S\.getAttribute\("data-client-key"\)/g,
      'typeof document !== "undefined" ? (document.currentScript?.getAttribute("data-client-key") || (document.getElementById("arto-pay-sdk-script")?.getAttribute("data-client-key") && !document.getElementById("arto-pay-sdk-script")?.getAttribute("data-client-key")?.startsWith("%") ? document.getElementById("arto-pay-sdk-script")?.getAttribute("data-client-key") : undefined) || (typeof window !== "undefined" ? window.__ARTOPAY_PUBLIC_KEY__ : undefined) || "pk_41cb9f2fd802ef417de4e82f8c32a80d356a02cdf32b52e68ad0") : undefined'
    );

    // 2. Ensure openPayment / $ accepts direct publicKey or dynamic lookup
    code = code.replace(
      /if\(!I\)throw new Error\("\[arto-pay\/js-sdk\] Payment publicKey is required"\);/g,
      'const resolvedKey = n.publicKey || I || (typeof window !== "undefined" ? (window.__ARTOPAY_PUBLIC_KEY__ || (document.getElementById("arto-pay-sdk-script")?.getAttribute("data-client-key") && !document.getElementById("arto-pay-sdk-script")?.getAttribute("data-client-key")?.startsWith("%") ? document.getElementById("arto-pay-sdk-script")?.getAttribute("data-client-key") : undefined)) : undefined); if(!resolvedKey) throw new Error("[arto-pay/js-sdk] Payment publicKey is required");'
    );

    code = code.replace(
      /,k\(o,r,I,a,p\)/g,
      ',k(o,r,resolvedKey,a,p)'
    );

    fs.writeFileSync(file, code, 'utf8');
    console.log(`[ArtoPay SDK Patch] Successfully patched ${file}`);
  }
});
