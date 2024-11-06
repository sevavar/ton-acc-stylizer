//Layout
let uiContainer;
let canvasContainer;
let selectedSize;
let canvas;


// UI
let sliders = {};
let inputs = {};
let buttons = {};


//2D
let img;
let gridSize = 20;
let symbolString = "┼:╱╱╱░▒▓ ╱—:╱█";
let symbolColor = [255, 255, 255];
let symbolScale = 1;
let indexValue = 0;


//3D
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
let zoom = 0.8;
let extrusionDepth = 200;



function preload() {
  myFont = loadFont('assets/ark-pixel-16px-proportional-zh_cn.ttf');
}

function createUI() {

  let uiContainer = select('#ui-container');

  // Title
  let label0 = createP(`
     <span class="label-left"><img src="assets/logo.svg" alt="icon" style="height:15px; vertical-align:bottom"> | STYLIZER<sup> β</sup></span>
  `);
  label0.class('label-container');
  label0.parent(uiContainer);

  // Description
  let label1 = createP(`
     <span class="label-left">Drag .png / .jpg<br>to the canvas to stylize<br>a raster image, or .svg<br>to extrude a 3D model.<br><br>Rotate and zoom 3D model with mouse, move around with keyboard arrows.</span>
  `);
  label1.class('label-container');
  label1.parent(uiContainer);
  
  
  // Symbol Size Label
  let label2 = createP(`
    <span class="label-left">GRID SIZE</span>
    <span class="label-right">${gridSize}</span>
  `);
  label2.class('label-container');
  label2.parent(uiContainer);

  // Symbol Size Slider
  sliders.gridSize = createSlider(10, 40, gridSize);
  sliders.gridSize.class('slider');
  sliders.gridSize.input(() => {
    gridSize = sliders.gridSize.value();
    label2.html(`
      <span class="label-left">GRID SIZE</span>
      <span class="label-right">${gridSize}</span>
    `);
  });
  sliders.gridSize.parent(uiContainer);

  // Symbol Scale Label
  let label3 = createP(`
    <span class="label-left">SYMBOL SIZE</span>
    <span class="label-right">${symbolScale}</span>
  `);
  label3.class('label-container');
  label3.parent(uiContainer);

  // Symbol Scale Slider
  sliders.symbolScale = createSlider(-10, 10, symbolScale);
  sliders.symbolScale.class('slider');
  sliders.symbolScale.input(() => {
    symbolScale = sliders.symbolScale.value();
    label3.html(`
      <span class="label-left">SYMBOL SIZE</span>
      <span class="label-right">${symbolScale}</span>
    `);
  });
  sliders.symbolScale.parent(uiContainer);
    
  // Symbol Shift Label
  let label4 = createP(`
    <span class="label-left">SHIFT</span>
    <span class="label-right">${indexValue}</span>
  `);
  label4.class('label-container');
  label4.parent(uiContainer);

  // Symbol Shift Slider
  sliders.indexValue = createSlider(0, 15, indexValue);
  sliders.indexValue.class('slider');
  sliders.indexValue.input(() => {
    indexValue = sliders.indexValue.value();
    label4.html(`
      <span class="label-left">SHIFT</span>
      <span class="label-right">${indexValue}</span>
    `);
  });
  sliders.indexValue.parent(uiContainer);

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


  
  // Color Label
  let label6 = createP(`
    <span class="label-left">COLOR</span> 
  `);
  label6.class('label-container');
  label6.parent(uiContainer);

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

 
  // EXTRUSION
  let label7 = createP(`
    <span class="label-left">EXTRUSION (FOR SVG)</span>
  `);
  label7.class('label-container');
  label7.parent(uiContainer);

 sliders.extrusion = createSlider(0, 2000, extrusionDepth);
  sliders.extrusion.class('slider');
  sliders.extrusion.input(() => {
    extrusionDepth = sliders.extrusion.value();
    label7.html(`
      <span class="label-left">EXTRUSION (FOR SVG)</span>
      <span class="label-right">${extrusionDepth}</span>
    `);
  });
  sliders.extrusion.parent(uiContainer);

  
   //Format Label
  let label8 = createP(`
    <span class="label-left">FORMAT</span>
  `);
  label8.class('label-container');
  label8.parent(uiContainer);

  //Format Dropdown
  inputs.format = createSelect();
  inputs.format.class('dropdown');
  inputs.format.option('1:1', [1080, 1080]);
  inputs.format.option('9:16', [1080, 1920]);
  inputs.format.option('16:9', [1920, 1080]);
  inputs.format.selected([1080, 1080]);
  inputs.format.parent(uiContainer); 

 inputs.format.changed(() => {
  selectedSize = inputs.format.value().split(',').map(Number);
  resizeCanvas(selectedSize[0], selectedSize[1]);
  
  // Adjust the camera perspective based on the new canvas size
  aspectRatio = selectedSize[0] / selectedSize[1];
  offscreen.ortho(-width / 2, width / 2, -height / 2, height / 2, -5000, 5000);
  background("#070708");
  canvas.style('width', width / 2 + 'px');
  canvas.style('height', height / 2 + 'px');
  
  //text("drag .png or .jpg here", width / 2, height / 2);
});
  

}

function setup() {
  loadStrings(defaultSVG, (data) => {
  // Join the strings and simulate a file drop
  let svgData = data.join('\n');
  handleFileDrop({ type: 'image', subtype: 'svg+xml', data: svgData });
  });
  noSmooth();
  uiContainer = select('#ui-container');
  createUI();

  canvasContainer = select('#canvas-container');
  canvas = createCanvas(1080, 1080, WEBGL);
  canvas.style('width', width / 2 + 'px');
  canvas.style('height', height / 2 + 'px');
  canvas.parent(canvasContainer);
  canvas.drop(handleFileDrop);
  textFont(myFont);
  textAlign(CENTER, CENTER);
  
  // Create an offscreen buffer for rendering the 3D model
  offscreen = createGraphics(1080, 1080, WEBGL);
  offscreen.ortho(-width / 2, width / 2, -height / 2, height / 2, -5000, 5000);
}


function draw() {
  background("#070708");
  offscreen.background(0);
  
  handleKeyboardInput();

  // Check if we have an SVG or a raster image
  if (shapes.length > 0) {
    // SVG case: Draw the extruded 3D model
    offscreen.push();
    offscreen.rotateX(rotationX);
    offscreen.rotateY(rotationY);
    offscreen.scale(zoom);
    offscreen.translate(posX, posY, posZ);
    //offscreen.fill(255);
    offscreen.noStroke();
    

    // Front and back faces
    for (let points of shapes) {
      offscreen.fill(255, 255, 255, 255);
      offscreen.beginShape();
      points.forEach(p => offscreen.vertex(p.x, p.y, -extrusionDepth));
      offscreen.endShape(CLOSE);
      offscreen.beginShape();
      points.forEach(p => offscreen.vertex(p.x, p.y, 0));
      offscreen.endShape(CLOSE);

    let lightDirection = createVector(0, -1, 0);
    // Loop through each point and draw connecting faces with shading
    for (let i = 0; i < points.length; i++) {
      let next = (i + 1) % points.length;

      // Define the four vertices of the connecting face
      let v1 = createVector(points[i].x, points[i].y, -extrusionDepth);
      let v2 = createVector(points[next].x, points[next].y, -extrusionDepth);
      let v3 = createVector(points[next].x, points[next].y, 0);
      let v4 = createVector(points[i].x, points[i].y, 0);

      // Calculate normal for the face
      let edge1 = p5.Vector.sub(v2, v1);
      let edge2 = p5.Vector.sub(v3, v1);
      normal = edge1.cross(edge2).normalize();

      // Calculate dot product with light direction
      dot = normal.dot(lightDirection);
      let shade = map(dot, -1, 1, 50, 150); // Map the dot product to a shade value

      // Set fill color based on the calculated shade
      offscreen.fill(shade, shade, shade, 255);

      // Draw the connecting face
      offscreen.beginShape();
      offscreen.vertex(v1.x, v1.y, v1.z);
      offscreen.vertex(v2.x, v2.y, v2.z);
      offscreen.vertex(v3.x, v3.y, v3.z);
      offscreen.vertex(v4.x, v4.y, v4.z);
      offscreen.endShape(CLOSE);
    }
    }
    offscreen.pop();
    
    
  } else if (img) {
    // Raster image case: Draw the image onto the offscreen buffer
    offscreen.image(img, -width / 2, -height / 2, width, height);
  }

  // Load the pixels from the offscreen buffer for symbol generation
  offscreen.loadPixels();

  // Calculate the number of grid columns and rows to cover the canvas
  let columns = ceil(width / gridSize);
  let rows = ceil(height / gridSize);

  // Setup text rendering
  textAlign(CENTER, CENTER);
  textFont(myFont);

  push();
  translate(-width / 2, -height / 2);

  // Use the pixel data from the offscreen buffer to render symbols
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Map x and y to image coordinates
      let imgX = floor(map(x, 0, columns, 0, offscreen.width));
      let imgY = floor(map(y, 0, rows, 0, offscreen.height));

      let i = (imgY * offscreen.width + imgX) * 4;
      let r = offscreen.pixels[i];
      let g = offscreen.pixels[i + 1];
      let b = offscreen.pixels[i + 2];
      let a = offscreen.pixels[i + 3];

      // Calculate luminance using the RGB values
      let luma = 0.299 * r + 0.587 * g + 0.114 * b;

      // Map luminance to symbol index, adjusted with indexValue
      let symbolIndex = int(map(luma, 0, 255, 0, symbolString.length)) + indexValue;
      symbolIndex = constrain(symbolIndex, 0, symbolString.length - 1);

      // Get the symbol from the string
      let symbol = symbolString.charAt(symbolIndex);

      // Draw symbol with the specified color and size
      fill(symbolColor);
      noStroke();
      textSize(gridSize + symbolScale);

      // Position symbols centered within each grid cell
      let posX = x * gridSize + gridSize / 2;
      let posY = y * gridSize + gridSize / 2;

      text(symbol, posX, posY);
    }
  }
  pop();
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
  zoom = constrain(zoom, 0.5, 3);
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


function handleFileDrop(file) {
  if (file.type === 'image' && file.subtype === 'svg+xml') {
      let svgData = file.data;

      // Check if the data is base64 encoded
      if (svgData.startsWith('data:image/svg+xml;base64,')) {
          const base64Data = svgData.split(',')[1];
          svgData = atob(base64Data); // Decode base64
      }

      // Now svgData should be a valid SVG string
      svgData = decodeHTMLEntities(svgData).trim(); // Decode any HTML entities

      let parser = new DOMParser();
      let svgDoc = parser.parseFromString(svgData, 'image/svg+xml');

      // Check for parsing errors
      if (svgDoc.getElementsByTagName('parsererror').length > 0) {
          const parserError = svgDoc.getElementsByTagName('parsererror')[0];
          console.error('Error parsing SVG:', parserError.textContent);
          console.error('SVG Document:', svgData);
          return;
      }

      let pathElements = svgDoc.querySelectorAll('path'); // Get all <path> elements
      console.log('Parsed SVG Document:', svgDoc);

      shapes = []; // Reset shapes for new SVG

      for (let pathElement of pathElements) {
          let pathData = pathElement.getAttribute('d');
          console.log('Path data:', pathData);
          let svgPoints = parseSVGPath(pathData);
          console.log('Extracted points:', svgPoints);

          if (svgPoints.length > 0) {
              const svgWidth = parseFloat(svgDoc.documentElement.getAttribute('width')) || 100; // Fallback width
              const svgHeight = parseFloat(svgDoc.documentElement.getAttribute('height')) || 100; // Fallback height

              // Calculate scaling factor
              const scale = Math.min(width / svgWidth, height / svgHeight);

              // Calculate offsets to center the SVG
              const xOffset = (width - (svgWidth * scale)) / 2 - width / 2;
              const yOffset = (height - (svgHeight * scale)) / 2 - height / 2;

              // Transform points to be centered and scaled
              let transformedPoints = svgPoints.map(point => ({
                  x: xOffset + point.x * scale,
                  y: yOffset + point.y * scale
              }));

              shapes.push(transformedPoints); // Add the transformed points to shapes array
          }
      }
  } else if (file.type === 'image'){

    img = loadImage(file.data, () => {
      // Resize the image to fit the canvas
      img.resize(width, height);
    });
    shapes.length = 0;

  }
}

// Function to decode HTML-encoded strings
function decodeHTMLEntities(str) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str; // Using innerHTML will decode the entities
  return textarea.value;
}

function parseSVGPath(pathData) {
    let points = [];
    let commands = pathData.match(/[a-df-z][^a-df-z]*/ig);
    let currentPoint = { x: 0, y: 0 };
    let startPoint = { x: 0, y: 0 };
    let controlPoint = { x: 0, y: 0 };
    let firstPoint = null;
    let lastCommand = '';

    function addVertex(x, y) {
        points.push({ type: 'vertex', x, y });
        currentPoint = { x, y };
    }

    function addBezierVertex(x1, y1, x2, y2, x, y) {
        if (points.length === 0 || (lastCommand !== 'C' && lastCommand !== 'c' && 
            lastCommand !== 'S' && lastCommand !== 's')) {
            points.push({ type: 'vertex', x: currentPoint.x, y: currentPoint.y });
        }
        points.push({ type: 'bezierVertex', x1, y1, x2, y2, x, y });
        currentPoint = { x, y };
        controlPoint = { x: x2, y: y2 };
    }

    function addQuadraticVertex(x1, y1, x, y) {
        if (points.length === 0 || (lastCommand !== 'Q' && lastCommand !== 'q' && 
            lastCommand !== 'T' && lastCommand !== 't')) {
            points.push({ type: 'vertex', x: currentPoint.x, y: currentPoint.y });
        }
        // Convert quadratic to cubic Bezier
        const cx1 = currentPoint.x + (2/3) * (x1 - currentPoint.x);
        const cy1 = currentPoint.y + (2/3) * (y1 - currentPoint.y);
        const cx2 = x + (2/3) * (x1 - x);
        const cy2 = y + (2/3) * (y1 - y);
        points.push({ type: 'bezierVertex', x1: cx1, y1: cy1, x2: cx2, y2: cy2, x, y });
        currentPoint = { x, y };
        controlPoint = { x: x1, y: y1 };
    }

    for (let command of commands) {
        let type = command[0];
        let values = command.slice(1).trim().split(/[\s,]+/).map(Number);
        lastCommand = type;

        switch (type) {
            case 'M':  // Move to absolute
                currentPoint = { x: values[0], y: values[1] };
                startPoint = { ...currentPoint };
                firstPoint = { ...currentPoint };
                addVertex(currentPoint.x, currentPoint.y);
                break;

            case 'm':  // Move to relative
                currentPoint = { x: currentPoint.x + values[0], y: currentPoint.y + values[1] };
                startPoint = { ...currentPoint };
                if (!firstPoint) firstPoint = { ...currentPoint };
                addVertex(currentPoint.x, currentPoint.y);
                break;

            case 'L':  // Line to absolute
                addVertex(values[0], values[1]);
                break;

            case 'l':  // Line to relative
                addVertex(currentPoint.x + values[0], currentPoint.y + values[1]);
                break;

            case 'H':  // Horizontal line absolute
                addVertex(values[0], currentPoint.y);
                break;

            case 'h':  // Horizontal line relative
                addVertex(currentPoint.x + values[0], currentPoint.y);
                break;

            case 'V':  // Vertical line absolute
                addVertex(currentPoint.x, values[0]);
                break;

            case 'v':  // Vertical line relative
                addVertex(currentPoint.x, currentPoint.y + values[0]);
                break;

            case 'C':  // Cubic Bezier absolute
                addBezierVertex(
                    values[0], values[1],
                    values[2], values[3],
                    values[4], values[5]
                );
                break;

            case 'c':  // Cubic Bezier relative
                addBezierVertex(
                    currentPoint.x + values[0], currentPoint.y + values[1],
                    currentPoint.x + values[2], currentPoint.y + values[3],
                    currentPoint.x + values[4], currentPoint.y + values[5]
                );
                break;

            case 'S':  // Smooth cubic Bezier absolute
                let sx1 = currentPoint.x + (currentPoint.x - controlPoint.x);
                let sy1 = currentPoint.y + (currentPoint.y - controlPoint.y);
                addBezierVertex(
                    sx1, sy1,
                    values[0], values[1],
                    values[2], values[3]
                );
                break;

            case 's':  // Smooth cubic Bezier relative
                let rsx1 = currentPoint.x + (currentPoint.x - controlPoint.x);
                let rsy1 = currentPoint.y + (currentPoint.y - controlPoint.y);
                addBezierVertex(
                    rsx1, rsy1,
                    currentPoint.x + values[0], currentPoint.y + values[1],
                    currentPoint.x + values[2], currentPoint.y + values[3]
                );
                break;

            case 'Q':  // Quadratic Bezier absolute
                addQuadraticVertex(
                    values[0], values[1],
                    values[2], values[3]
                );
                break;

            case 'q':  // Quadratic Bezier relative
                addQuadraticVertex(
                    currentPoint.x + values[0], currentPoint.y + values[1],
                    currentPoint.x + values[2], currentPoint.y + values[3]
                );
                break;

            case 'T':  // Smooth quadratic Bezier absolute
                let tx1 = currentPoint.x + (currentPoint.x - controlPoint.x);
                let ty1 = currentPoint.y + (currentPoint.y - controlPoint.y);
                addQuadraticVertex(
                    tx1, ty1,
                    values[0], values[1]
                );
                break;

            case 't':  // Smooth quadratic Bezier relative
                let rtx1 = currentPoint.x + (currentPoint.x - controlPoint.x);
                let rty1 = currentPoint.y + (currentPoint.y - controlPoint.y);
                addQuadraticVertex(
                    rtx1, rty1,
                    currentPoint.x + values[0], currentPoint.y + values[1]
                );
                break;

            case 'Z':  // Close path
            case 'z':
                if (firstPoint) {
                    addVertex(firstPoint.x, firstPoint.y);
                }
                break;

            default:
                console.warn(`Unknown command: ${type}`);
        }
    }

    return points;
}