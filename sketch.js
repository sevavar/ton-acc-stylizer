//Layout
let uiContainer;
let canvasContainer;
let selectedSize;
let displayWidth;
let displayHeight;
let canvas;
const pd = 2;


// UI
let sliders = {};
let inputs = {};
let buttons = {};
let checkboxes = {};
let labels = {};


//2D
let img;
let gridSize = 8 ;
let symbolString = " ·+┼╱｜╲―░▒▓█";
let symbolColor = [255, 255, 255];
let symbolScale = 0;
let indexValue = 0;


//3D
let svgData;
let defaultSVG = 'assets/default.svg';
let aspectRatio = 1;
let shapes = []; // SVG shapes aray
let dragging = false;
let posX = 0;
let posY = 0;
let posZ = 0;
let rotationX = 0;
let rotationY = 0;
let lastMouseX, lastMouseY;
let offscreen; // Ofscreen buffer
let zoom = 0.9;
let extrusionDepth = 50;
let animate = true;



function preload() {
  myFont = loadFont('assets/ark-pixel-16px-proportional-zh_cn.ttf');
}

function createUI() {

  let uiContainer = select('#ui-container');

  // Title
  let label0 = createP(`
     <span class="label-left"><img src="assets/logo.svg" alt="icon" style="height:13px; position: relative; top: 1.5px;"> STYLIZER<sup> BETA</sup></span>
  `);
  label0.class('label-container');
  label0.parent(uiContainer);

  // Description
  let label1 = createP(`
     <span class="label-left">UPLOAD JPG / PNG / WEBP<br>TO PROCESS RASTER IMAGE,<br>OR SVG TO EXTRUDE 3D MODEL<br>

<p style="margin-bottom: -10px;">
  CONTROLS:
  <span style="display: inline-block; width: 150px;">CLICK & DRAG</span>
  <span style="float: right;">ROTATE</span>
  <span style="display: inline-block; width: 150px;">SCROLL</span>
  <span style="float: right;">ZOOM</span>
  <span style="display: inline-block; width: 150px;">ARROW KEYS</span>
  <span style="float: right;">MOVE</span><br><br>
</p>
</span>
  `);
  label1.class('label-container');
  label1.parent(uiContainer);
  
  // Upload Button
    buttons.upload = createButton(`
      <span class="center-align">UPLOAD FILE</span>
    `);
    buttons.upload.class('button');
    buttons.upload.mousePressed(() => upload.elt.click());
    buttons.upload.parent(uiContainer);
    upload = createFileInput(handleFileDrop).addClass('button').hide();
  
    // Symbol String Label
  let label5 = createP(`
    <span class="label-left">SYMBOLS</span>
  `);
  label5.class('label-container');
  label5.parent(uiContainer);

  // Symbol String Field
  inputs.string = createInput(symbolString);
  inputs.string.class('input');
  inputs.string.input(() => {
    symbolString = inputs.string.value();
    label5.html(`
      <span class="label-left">SYMBOLS</span>
    `);
  });
  inputs.string.parent(uiContainer);
  
  
  // Grid Size Label
  let label2 = createP(`
    <span class="label-left">RESOLUTION</span>
    <span class="label-right">${gridSize}</span>
  `);
  label2.class('label-container');
  label2.parent(uiContainer);

  // Grid Size Slider
  sliders.gridSize = createSlider(6, 40, gridSize);
  sliders.gridSize.class('slider');
  sliders.gridSize.input(() => {
    gridSize = sliders.gridSize.value();
    label2.html(`
      <span class="label-left">RESOLUTION</span>
      <span class="label-right">${gridSize}</span>
    `);
  });
  sliders.gridSize.parent(uiContainer);

  // Symbol Size Label
  labels.size = createP(`
    <span class="label-left">SYMBOL SIZE</span>
    <span class="label-right">${symbolScale}</span>
  `);
  labels.size.class('label-container');
  labels.size.parent(uiContainer);

  // Symbol Size Slider
  sliders.symbolScale = createSlider(-10, 10, symbolScale);
  sliders.symbolScale.class('slider');
  sliders.symbolScale.input(() => {
    symbolScale = sliders.symbolScale.value();
    labels.size.html(`
      <span class="label-left">SYMBOL SIZE</span>
      <span class="label-right">${symbolScale}</span>
    `);
  });
  sliders.symbolScale.parent(uiContainer);
    
  // Variation Label
  labels.variation = createP(`
    <span class="label-left">VARIATION</span>
    <span class="label-right">${indexValue}</span>
  `);
  labels.variation.class('label-container');
  labels.variation.parent(uiContainer);

  // Symbol Shift Slider
  sliders.indexValue = createSlider(0, 15, indexValue);
  sliders.indexValue.class('slider');
  sliders.indexValue.input(() => {
    indexValue = sliders.indexValue.value();
    labels.variation.html(`
      <span class="label-left">VARIATION</span>
      <span class="label-right">${indexValue}</span>
    `);
  });
  sliders.indexValue.parent(uiContainer);

  
  // Color Label
  labels.color = createP(`
    <span class="label-left">COLOR</span> 
  `);
  labels.color.class('label-container');
  labels.color.parent(uiContainer);

  // Color Dropdown List
  inputs.color = createSelect();
  inputs.color.class('dropdown');

  inputs.color.option('white', '#fff');
  inputs.color.option('blue', '#00A3FF');
  inputs.color.option('green', '#51FF00');
  inputs.color.option('yellow', '#FED702');
  inputs.color.option('red', '#DF1D1D')

  inputs.color.changed(() => {
    symbolColor = inputs.color.value();
  });

  inputs.color.parent(uiContainer);

 
  // Extrusion
  labels.extrusion = createP(`
    <span class="label-left">EXTRUSION</span>   
  `);
  //<span class="label-right">${extrusionDepth}</span>
  labels.extrusion.class('label-container');
  labels.extrusion.parent(uiContainer);

 sliders.extrusion = createSlider(0, 2000, extrusionDepth);
  sliders.extrusion.class('slider');
  sliders.extrusion.input(() => {
    extrusionDepth = sliders.extrusion.value();
    labels.extrusion.html(`
      <span class="label-left">EXTRUSION</span>
    `);
  });
  sliders.extrusion.parent(uiContainer);
  
  // Animate checkbox
  checkboxes.animate = createCheckbox('ANIMATE', true);
  checkboxes.animate.class('checkbox');
  checkboxes.animate.changed(() => {
  animate = checkboxes.animate.checked();
  });
  checkboxes.animate.parent(uiContainer);
  
   //Format Label
  labels.format = createP(`
    <span class="label-left">FORMAT</span>
  `);
  labels.format.class('label-container');
  labels.format.parent(uiContainer);

 // Format Dropdown
inputs.format = createSelect();
inputs.format.class('dropdown');
inputs.format.option('1080*1080', [540, 540]);
inputs.format.option('1080*1920', [540, 960]);
inputs.format.option('1920*1080', [960, 540]);
inputs.format.option('2048*2048', [1024, 1024]);
inputs.format.option('2560*1440 (2K)', [1280, 720]); 
inputs.format.option('3840*2160 (4K)', [1920, 1080]); 
inputs.format.selected('1:1'); // Default selected value
inputs.format.parent(uiContainer);

inputs.format.changed(() => {
  // Extract dimensions from the selected option
  let selectedSize = inputs.format.value().split(',').map(Number);
  let [displayWidth, displayHeight] = selectedSize;

  // Update canvas style for the display size
  canvas.style('width', `${displayWidth}px`);
  canvas.style('height', `${displayHeight}px`);

  // Resize the main canvas and the offscreen buffer
  resizeCanvas(displayWidth, displayHeight);

  offscreen = createGraphics((displayWidth/2) * pd, (displayHeight/2) * pd, WEBGL);
  offscreen.pixelDensity(pd);
  offscreen.ortho(
    -displayWidth / 2, displayWidth / 2,
    -displayHeight / 2, displayHeight / 2,
    -5000, 5000
  );
  
console.log(`Display Width: ${displayWidth}, Height: ${displayHeight}`);
console.log(`Pixel Density: ${pd}`);
console.log(`Effective Width: ${displayWidth * pd}, Height: ${displayHeight * pd}`);

});

  
  
// Save PNG Button
    buttons.save = createButton(`
      <span class="center-align">SAVE AS PNG</span>
    `);
    buttons.save.class('button');
    buttons.save.mousePressed(savePNG);
    buttons.save.parent(uiContainer);

// Save text Button
    buttons.txt = createButton(`
      <span class="center-align">SAVE AS TXT</span>
    `);
    buttons.txt.class('button');
    buttons.txt.mousePressed(saveASCIIToFile);
    buttons.txt.parent(uiContainer);
  
// Save video Button
    buttons.video = createButton(`
      <span class="center-align">SAVE AS MP4 (SOON)</span>
    `);
    buttons.video.class('button-disabled');
    //buttons.video.mousePressed(saveASCIIToFile);
    buttons.video.parent(uiContainer);
  
    

  
// Credits
  let credits = createP(`
     <span class="credits">MADE BY <a href="https://www.accuraten.com" target="_blank" class="credits-link">ACCURATEN</a> × <a href="https://www.retry.studio" target="_blank" class="credits-link">RETRY</a><br>FOR <a href="https://www.tonacc.org" target="_blank" class="credits-link">TON ACCELERATOR</a> IN 2025
</span>
  `);
  //credits.class('label-container');
  credits.parent(uiContainer);
}
function setup() {
  console.log('Device Pixel Ratio:', window.devicePixelRatio);
  frameRate(60);
  loadStrings(defaultSVG, (data) => {
    let svgData = data.join('\n');
    handleFileDrop({ type: 'image', subtype: 'svg+xml', data: svgData });
  });

  noSmooth();
  uiContainer = select('#ui-container');
  createUI();

  canvasContainer = select('#canvas-container');

  // Desired display size (visual size in pixels)
  displayWidth = 540;
  displayHeight = 540;


  // Create the canvas with the base resolution
  canvas = createCanvas(540, 540, WEBGL);

  canvas.pixelDensity(pd);
  // Set the canvas' CSS to scale it to the visual size (display size) without affecting rendering resolution
  canvas.style('width', displayWidth + 'px');
  canvas.style('height', displayHeight + 'px');

  // Set the canvas parent
  canvas.parent(canvasContainer);

  // Enable file drop functionality
  canvas.drop(handleFileDrop);

  // Set up text rendering settings
  textFont(myFont);
  textAlign(CENTER, CENTER);

  // Create an offscreen buffer with the same size as the actual canvas resolution
  offscreen = createGraphics(displayWidth * pd, displayHeight * pd, WEBGL);
  offscreen.ortho(
    -displayWidth / 2 * pd, displayWidth / 2 * pd,
    -displayHeight / 2 * pd, displayHeight / 2 * pd,
    -5000, 5000
  );

  // Set the correct pixel density for the offscreen buffer
  offscreen.pixelDensity(pd); // Ensures the offscreen buffer matches the scaling
  

}

function draw() {
  background("#070708");
  offscreen.background(0);
  
  handleKeyboardInput();
  if (animate) rotationY += 0.1;
  
  posZ = extrusionDepth / 2;

  // Check if we have an SVG or a raster image
  offscreen.push();
  offscreen.rotateX(rotationX);
  offscreen.rotateY(rotationY);
  offscreen.scale(zoom * pd);
  offscreen.translate(posX, posY, posZ);

  if (shapes.length > 0) {
    // SVG case: Draw the extruded 3D model
    offscreen.noStroke();

    let lightDirection = createVector(0, -1, 0); // Light direction

    // Loop through shapes for 3D drawing
    for (let points of shapes) {
      // Front and back faces
      offscreen.fill(255);
      offscreen.beginShape();
      points.forEach(p => offscreen.vertex(p.x, p.y, -extrusionDepth));
      offscreen.endShape(CLOSE);

      offscreen.beginShape();
      points.forEach(p => offscreen.vertex(p.x, p.y, 0));
      offscreen.endShape(CLOSE);

      // Loop through each side face and draw it
      let n = points.length;
      for (let i = 0; i < n; i++) {
        let next = (i + 1) % n;
        let v1 = createVector(points[i].x, points[i].y, -extrusionDepth);
        let v2 = createVector(points[next].x, points[next].y, -extrusionDepth);
        let v3 = createVector(points[next].x, points[next].y, 0);
        let v4 = createVector(points[i].x, points[i].y, 0);

        // Calculate normal for the face
        let normal = p5.Vector.sub(v2, v1).cross(p5.Vector.sub(v3, v1)).normalize();
        let shade = map(normal.dot(lightDirection), -1, 1, 50, 150); // Map the dot product to a shade value

        offscreen.fill(shade);
        offscreen.beginShape();
        offscreen.vertex(v1.x, v1.y, v1.z);
        offscreen.vertex(v2.x, v2.y, v2.z);
        offscreen.vertex(v3.x, v3.y, v3.z);
        offscreen.vertex(v4.x, v4.y, v4.z);
        offscreen.endShape(CLOSE);
      }
    }
  } else if (img) {
    // Raster image case: Draw the image onto the offscreen buffer
    offscreen.image(img, -width / 2 * pd, -height / 2 * pd, width * pd, height * pd);
  }

  offscreen.pop();

  // Process pixels for ASCII art conversion
  offscreen.loadPixels();
  let columns = ceil(width / gridSize);
  let rows = ceil(height / gridSize);

  textFont(myFont);
  asciiArt = ""; // Clear the buffer before starting

  // Instead of calling offscreen.pixels[i] inside the loop repeatedly, batch access pixels
  let pixelData = offscreen.pixels;
  
  for (let y = 0; y < rows; y++) {
    let rowString = ""; // Buffer for the current row
    for (let x = 0; x < columns; x++) {
      let imgX = floor(map(x, 0, columns, 0, offscreen.width * pd));
      let imgY = floor(map(y, 0, rows, 0, offscreen.height * pd));

      // Calculate the pixel index
      let i = (imgY * offscreen.width * pd + imgX) * 4;
      let r = pixelData[i];
      let g = pixelData[i + 1];
      let b = pixelData[i + 2];

      let luma = 0.299 * r + 0.587 * g + 0.114 * b;
      let symbolIndex = int(map(luma, 0, 255, 0, symbolString.length)) + indexValue;
      symbolIndex = constrain(symbolIndex, 0, symbolString.length - 1);

      let symbol = symbolString.charAt(symbolIndex);
      rowString += symbol; // Append symbol to the row
    }
    asciiArt += rowString + "\n"; // Append row to the buffer with a newline
  }

  renderASCIIToCanvas(asciiArt);

  // Save the ASCII art to a text file
  // saveASCIIToFile();
}


function renderASCIIToCanvas(ascii) {
  push();
  translate(-width / 2, -height / 2);

  let lines = ascii.split("\n");
  for (let y = 0; y < lines.length; y++) {
    let line = lines[y];
    for (let x = 0; x < line.length; x++) {
      let symbol = line.charAt(x);
      fill(symbolColor);
      noStroke();
      textSize(gridSize + symbolScale);
      text(symbol, x * gridSize + gridSize / 2, y * gridSize + gridSize / 2);
    }
  }

  pop();
}

function saveASCIIToFile() {
  let filename = "ascii_art.txt";
  saveStrings(asciiArt.split("\n"), filename); // Save the buffer as a text file
}

// Rotation
function mousePressed() {
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  dragging = true;
}
function mouseReleased() {
  dragging = false;

}
function mouseDragged() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    if (dragging) {
      let dx = mouseX - lastMouseX;
      let dy = mouseY - lastMouseY;
      rotationY += dx * 0.01;
      rotationX += dy * 0.01;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }
  }
}

// Zoom
function mouseWheel(event) {
  zoom -= event.delta * 0.001;
  zoom = constrain(zoom, 0.1, 5);
}

// Move
function handleKeyboardInput() {
  if (keyIsDown(LEFT_ARROW)) {
    posX -= 10;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    posX += 10;
  }
  if (keyIsDown(UP_ARROW)) {
    posY -= 10;
  }
  if (keyIsDown(DOWN_ARROW)) {
    posY += 10;
  }
}

// File Handling
function handleFileDrop(file) {
    if (file.type === 'image' && file.subtype === 'svg+xml') {
      sliders.extrusion.show();
      labels.extrusion.show();
      svgData = file.data;
      handleSVG(svgData);
      rotationY = 0;
      rotationX = 0;
      animate = true;
      checkboxes.animate.checked(true);
      
    } else if (file.type === 'image'){

    img = loadImage(file.data, () => {
      img.resize(width, height);
      rotationY = 0;
      rotationX = 0;
      animate = false;
      checkboxes.animate.checked(false);
      sliders.extrusion.hide();
      labels.extrusion.hide();
      
    });
    shapes.length = 0;
    }

}


        function handleSVG ()
{
        
        // Handle base64 encoded SVG
        if (svgData.startsWith('data:image/svg+xml;base64,')) {
            const base64Data = svgData.split(',')[1];
            svgData = atob(base64Data);
        }

        // Create temporary container
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.visibility = 'hidden';
        document.body.appendChild(container);

        try {
            // Parse SVG dimensions and viewBox
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
            const svgElement = svgDoc.querySelector('svg');
            
            // Get SVG dimensions and viewBox
            let viewBox = svgElement.viewBox.baseVal;
            let svgWidth, svgHeight;
            
            if (viewBox && viewBox.width && viewBox.height) {
                // Use viewBox dimensions if available
                svgWidth = viewBox.width;
                svgHeight = viewBox.height;
            } else {
                // Fall back to width/height attributes or default dimensions
                svgWidth = parseFloat(svgElement.getAttribute('width')) || displayWidth;
                svgHeight = parseFloat(svgElement.getAttribute('height')) || displayHeight;
                
                // Create viewBox if it doesn't exist
                viewBox = {
                    x: 0,
                    y: 0,
                    width: svgWidth,
                    height: svgHeight
                };
            }

            // Initialize SVG.js with display dimensions
            const draw = SVG().addTo(container).size(displayWidth, displayHeight);
            const svg = draw.svg(svgData);
            
            // Calculate scale to fit while maintaining aspect ratio
            const scaleX = displayWidth / svgWidth;
            const scaleY = displayHeight / svgHeight;
            const scale = Math.min(scaleX, scaleY) * 1; // 90% of available space for padding
            
            // Calculate centering offsets
            const offsetX = (-1*(svgWidth * scale)) / 2;
            const offsetY = (-1*(svgHeight * scale)) / 2;

            // Reset shapes array
            shapes = [];

            // Function to transform point coordinates
            function transformPoint(x, y) {
                // Normalize coordinates relative to viewBox
                const normalizedX = (x - (viewBox.x || 0)) / viewBox.width * svgWidth;
                const normalizedY = (y - (viewBox.y || 0)) / viewBox.height * svgHeight;
                
                // Apply scale and center
                return {
                    x: normalizedX * scale + offsetX,
                    y: normalizedY * scale + offsetY
                };
            }

            // Function to extract points from path data
            function extractPointsFromPath(pathData) {
                const points = [];
                const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathEl.setAttribute('d', pathData);
                
                // Get total length of path
                const length = pathEl.getTotalLength();
                const numPoints = Math.max(20, Math.ceil(length / 10)); // Adjust sampling density

                // Sample points along the path
                for (let i = 0; i <= numPoints; i++) {
                    const point = pathEl.getPointAtLength(i / numPoints * length);
                    const transformed = transformPoint(point.x, point.y);
                    points.push(transformed);
                }
                return points;
            }

            // Process all SVG elements
            svg.find('*').forEach(el => {
                let points = [];
                
                switch (el.type) {
                    case 'path':
                        points = extractPointsFromPath(el.attr('d'));
                        break;
                        
                    case 'rect':
                        const x = parseFloat(el.attr('x')) || 0;
                        const y = parseFloat(el.attr('y')) || 0;
                        const w = parseFloat(el.attr('width'));
                        const h = parseFloat(el.attr('height'));
                        const rectPath = `M${x},${y} h${w} v${h} h-${w} Z`;
                        points = extractPointsFromPath(rectPath);
                        break;
                        
                    case 'circle':
                        const cx = parseFloat(el.attr('cx')) || 0;
                        const cy = parseFloat(el.attr('cy')) || 0;
                        const r = parseFloat(el.attr('r'));
                        const circlePath = `M${cx-r},${cy} a${r},${r} 0 1,0 ${r*2},0 a${r},${r} 0 1,0 -${r*2},0`;
                        points = extractPointsFromPath(circlePath);
                        break;
                        
                    case 'polygon':
                    case 'polyline':
                        const pointsAttr = el.attr('points').trim();
                        const coords = pointsAttr.split(/[\s,]+/).map(Number);
                        for (let i = 0; i < coords.length; i += 2) {
                            const transformed = transformPoint(coords[i], coords[i+1]);
                            points.push(transformed);
                        }
                        if (el.type === 'polygon') {
                            points.push({...points[0]}); // Close polygon
                        }
                        break;
                }

                if (points.length > 0) {
                    shapes.push(points);
                }
            });

            // Cleanup
            container.remove();
            console.log('Extracted shapes:', shapes);

        } catch (error) {
            console.error('Error processing SVG:', error);
            container.remove();
        }
}


function savePNG() {
  save(createFileName('tonacc-stylizer', 'png'));
}

function createFileName(prefix, extension){
  let now = new Date();
  let datePart = `${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}`;
  let timePart = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
  return `${prefix}_${datePart}${timePart}.${extension}`;
}
