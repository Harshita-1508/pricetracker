console.log("Visual Product Finder loaded");

// ---- Floating Button ----
const button = document.createElement("div");
button.innerText = "🔍 Select";
button.style.position = "fixed";
button.style.bottom = "20px";
button.style.right = "20px";
button.style.background = "#000";
button.style.color = "#fff";
button.style.padding = "10px 14px";
button.style.borderRadius = "20px";
button.style.cursor = "pointer";
button.style.zIndex = "999999999";
button.style.fontSize = "14px";
button.style.boxShadow = "0 4px 10px rgba(0,0,0,0.4)";

document.body.appendChild(button);

// ---- Selection Logic ----
let overlay, box;
let startX, startY;
let selecting = false;

button.addEventListener("click", () => {
  startSelectionMode();
});

function startSelectionMode() {
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.2)";
  overlay.style.zIndex = "999999998";
  overlay.style.cursor = "crosshair";

  document.body.appendChild(overlay);

  overlay.addEventListener("mousedown", onDown);
  overlay.addEventListener("mousemove", onMove);
  overlay.addEventListener("mouseup", onUp);
}

function onDown(e) {
  selecting = true;
  startX = e.clientX;
  startY = e.clientY;

  box = document.createElement("div");
  box.style.position = "fixed";
  box.style.border = "2px dashed #00ff00";
  box.style.background = "rgba(0,255,0,0.1)";
  box.style.zIndex = "999999999";
  box.style.pointerEvents = "none"; // important fix

  document.body.appendChild(box);
}

function onMove(e) {
  if (!selecting) return;

  const x = Math.min(startX, e.clientX);
  const y = Math.min(startY, e.clientY);
  const w = Math.abs(e.clientX - startX);
  const h = Math.abs(e.clientY - startY);

  box.style.left = x + "px";
  box.style.top = y + "px";
  box.style.width = w + "px";
  box.style.height = h + "px";
}

function onUp() {
  selecting = false;

  const rect = box.getBoundingClientRect();

  overlay.remove();
  box.remove();
  overlay = null;
  box = null;

  captureSelectedArea(rect);
}

// ---- Capture and Preview ----
function captureSelectedArea(rect) {
  chrome.runtime.sendMessage({ action: "CAPTURE_SCREEN" }, (response) => {
    const img = new Image();
    img.src = response.screenshot;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        img,
        rect.left,
        rect.top,
        rect.width,
        rect.height,
        0,
        0,
        rect.width,
        rect.height
      );

      const cropped = canvas.toDataURL("image/png");
      showPreview(cropped);
    };
  });
}


function showPreview(imgSrc) {
  const old = document.getElementById("vp-preview");
  if (old) old.remove();

  const panel = document.createElement("div");
  panel.id = "vp-preview";
  panel.style.position = "fixed";
  panel.style.bottom = "80px";
  panel.style.right = "20px";
  panel.style.background = "#111";
  panel.style.padding = "10px";
  panel.style.borderRadius = "10px";
  panel.style.zIndex = "999999999";
  panel.style.color = "#fff";
  panel.style.boxShadow = "0 5px 15px rgba(0,0,0,0.5)";

  panel.innerHTML = `
    <div style="margin-bottom:6px;font-size:13px;">Captured Image</div>
    <img src="${imgSrc}" style="width:200px;border-radius:8px;display:block;" />
  `;

  document.body.appendChild(panel);
}
