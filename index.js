let thresholdSlider;

let frameW = 1080;
let frameH = 1350;

let scaleFactor;
let offsetX, offsetY;

let paint = [];
let prevRows = null;
let prevThreshold = null;

let threshold = 50;

// textos
let titleInput, subtitleInput, infoInput, info2Input;
let titleText = "";
let subtitleText = "";
let infoText = "";
let info2Text = "";

// layout
let layoutSelect;
let layoutMode = "cover";
let coverTexts;

// fonts 
let bertholdFont;
let interFont;

// logos
let cisucLogo;
let logoCheckbox;

// animation
let animationCheckbox;

// background
let bgImage = null;
let bgInput;

function preload() {
    bertholdFont = loadFont("BertholdAkzidenzGroteskExtended.otf");
    interFont = loadFont("InterVariableFont.ttf");
    cisucLogo = loadImage("CISUC_Cybersecurity_Transversal_Lab_logo.png");
}

function setup() {
    let canvas = createCanvas(window.innerWidth - 250, window.innerHeight);
    canvas.parent("canvas-container");

    thresholdSlider = document.getElementById("threshold");

    titleInput = document.getElementById("titleInput");
    subtitleInput = document.getElementById("subtitleInput");
    infoInput = document.getElementById("infoInput");
    info2Input = document.getElementById("info2Input");

    layoutSelect = document.getElementById("layoutSelect");
    coverTexts = document.querySelectorAll(".cover");

    animationCheckbox = document.getElementById("animationToggle");
    logoCheckbox = document.getElementById("logoToggle");

    titleInput.addEventListener("input", () => titleText = titleInput.value);
    subtitleInput.addEventListener("input", () => subtitleText = subtitleInput.value);
    infoInput.addEventListener("input", () => infoText = infoInput.value);
    info2Input.addEventListener("input", () => info2Text = info2Input.value);

    layoutSelect.addEventListener("change", () => {
        layoutMode = layoutSelect.value;

        resetTextLayout();   // limpa texto
        updateLayoutUI();    // mantém UI correta
    });

    bgInput = document.getElementById("bgUpload");
    bgInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                loadImage(e.target.result, (img) => {
                    bgImage = img;

                    // grayscale pixel-based
                    bgImage.loadPixels();
                    for (let i = 0; i < bgImage.pixels.length; i += 4) {
                        let r = bgImage.pixels[i];
                        let g = bgImage.pixels[i + 1];
                        let b = bgImage.pixels[i + 2];

                        let gray = (r + g + b) / 3;

                        bgImage.pixels[i] = gray;
                        bgImage.pixels[i + 1] = gray;
                        bgImage.pixels[i + 2] = gray;
                    }
                    bgImage.updatePixels();
                });
            };

            reader.readAsDataURL(file);
        }
    });

    rectMode(CORNER);

    updateLayoutUI();
}

function draw() {
    background(255);

    scaleFactor = min(width / frameW, height / frameH) * 0.9;

    let displayW = frameW * scaleFactor;
    let displayH = frameH * scaleFactor;

    offsetX = (width - displayW) / 2;
    offsetY = (height - displayH) / 2;

    // animation
    if (animationCheckbox.checked && frameCount % 50 === 0) {
        regenerate();
    }

    // background frame
    push();
    translate(offsetX, offsetY);

    if (bgImage) {
        image(bgImage, 0, 0, displayW, displayH);
        fill(0, 120);
        rect(0, 0, displayW, displayH);
    } else {
        fill(0);
        noStroke();
        rect(0, 0, displayW, displayH);
    }

    pop();

    // GRID FIXA
    let cols = 6;
    let rows = round(cols * (displayH / displayW));

    threshold = int(thresholdSlider.value);

    if (rows !== prevRows || threshold !== prevThreshold) {
        generatePaint(rows, cols);
        prevRows = rows;
        prevThreshold = threshold;
    }

    let squareW = displayW / cols;
    let squareH = displayH / rows;

    drawGrid(rows, cols, squareW, squareH);

    if (logoCheckbox.checked) {
        drawLogos(displayW, displayH);
    }

    drawTexts(displayW, displayH);
}

function generatePaint(rows, cols) {
    paint = [];

    for (let i = 0; i < rows; i++) {
        paint[i] = [];
        for (let j = 0; j < cols; j++) {
            paint[i][j] = random(100) > threshold;
        }
    }
}

function drawGrid(rows, cols, squareW, squareH) {
    push();
    translate(offsetX, offsetY);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            let posX = x * squareW;
            let posY = y * squareH;

            if (paint[y] && paint[y][x]) {
                fill("#D2232A");
            } else {
                noFill();
            }

            noStroke();
            rect(posX, posY, squareW + 1, squareH + 1);
        }
    }

    pop();
}

function drawTexts(displayW, displayH) {
    push();

    let baseX = offsetX + displayW * 0.1;
    let baseY = offsetY + displayH * 0.45;

    let wideWidth = displayW * 0.8;
    let midWidth = displayW * 0.6;
    let narrowWidth = displayW * 0.22;

    let spacing = 20 * scaleFactor;

    fill(225);
    textAlign(LEFT, TOP);

    // TITLE
    textFont(bertholdFont);
    textSize(60 * scaleFactor);

    let titleY = (layoutMode === "cover") ? baseY : baseY + 100;
    let titleHeight = drawWrappedText(titleText.toUpperCase(), baseX, titleY, wideWidth);

    // SUBTITLE
    textFont(interFont);
    textSize(35 * scaleFactor);

    if (layoutMode === "cover") {
        let subtitleY = titleY + titleHeight + spacing;
        drawWrappedText(subtitleText.toUpperCase(), baseX, subtitleY, wideWidth);
    }

    // INFO
    textSize(27 * scaleFactor);

    if (layoutMode === "cover") {
        drawWrappedText(infoText.toUpperCase(), baseX, baseY - 250 * scaleFactor, narrowWidth);
    } else {
        drawWrappedText(infoText.toUpperCase(), baseX, baseY + 300 * scaleFactor, midWidth);
    }

    // INFO 2
    if (layoutMode === "cover") {
        drawWrappedText(info2Text.toUpperCase(), baseX, baseY + 500 * scaleFactor, midWidth);
    }

    pop();
}

function drawWrappedText(txt, x, y, maxWidth) {
    let words = txt.split(" ");
    let line = "";
    let lineHeight = textSize() * 1.2;

    let startY = y;

    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";

        if (textWidth(testLine) > maxWidth && i > 0) {
            text(line, x, y);
            line = words[i] + " ";
            y += lineHeight;
        } else {
            line = testLine;
        }
    }

    text(line, x, y);
    return (y - startY) + lineHeight;
}

function drawLogos(displayW, displayH) {
    if (!cisucLogo) return;

    push();
    translate(offsetX, offsetY);

    let margin = displayW * 0.1;

    let imgWidth = displayW * 0.25;
    let imgHeight = imgWidth * (cisucLogo.height / cisucLogo.width);

    image(cisucLogo, margin, displayH * 0.05, imgWidth, imgHeight);

    pop();
}

function regenerate() {
    prevRows = null;
    prevThreshold = null;
}

function clearCanvas() {
    thresholdSlider.value = 80;
    updateSlider(thresholdSlider);

    titleInput.value = "";
    subtitleInput.value = "";
    infoInput.value = "";
    info2Input.value = "";

    titleText = "";
    subtitleText = "";
    infoText = "";
    info2Text = "";

    bgImage = null;

    animationCheckbox.checked = false;
    logoCheckbox.checked = true;

    layoutSelect.value = "cover";
    layoutMode = "cover";
    updateLayoutUI();

    regenerate();
}

function resetTextLayout() {
    titleText = "";
    subtitleText = "";
    infoText = "";
    info2Text = "";

    titleInput.value = "";
    subtitleInput.value = "";
    infoInput.value = "";
    info2Input.value = "";
}

function saveCanvasImage() { 
    // CASO PNG (sem animação) 
    if (!animationCheckbox.checked) { 
        saveCanvas("cs_lab_tool", "png"); 
        return; 
    } else { // CASO GIF (com animação) 
        saveGif('cs_lab_tool', 2); // esperar acabar e remover overlay 
        setTimeout(() => { 
            let progressBar = document.getElementById("progressBar"); 
            if (progressBar) progressBar.remove();
        }, 7000); // tempo > duração do gif 
    } 
}

function updateLayoutUI() {
    coverTexts.forEach(el => {
        el.style.display = layoutMode === "cover" ? "block" : "none";
    });
}

function updateSlider(slider) {
    let min = slider.min;
    let max = slider.max;
    let val = slider.value;

    let percent = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--value', percent + '%');
}

document.querySelectorAll('input[type="range"]').forEach(slider => {
    updateSlider(slider);
    slider.addEventListener("input", () => updateSlider(slider));
});