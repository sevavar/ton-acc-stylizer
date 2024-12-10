//Layout
let uiContainer;
let canvasContainer;
let selectedSize;
let displayWidth;
let displayHeight;
let canvas;
let pd = 1;


// UI
let sliders = {};
let inputs = {};
let buttons = {};
let checkboxes = {};


//2D
let img;
let gridSize = 6 ;
let symbolString = " ┼:╱╱╱░▒▓ ╱—:╱█";
let symbolColor = [255, 255, 255];
let symbolScale = 0;
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
  sliders.gridSize = createSlider(6, 40, gridSize);
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

 
  // Extrusion
  let label7 = createP(`
    <span class="label-left">EXTRUDE</span>
  `);
  label7.class('label-container');
  label7.parent(uiContainer);

 sliders.extrusion = createSlider(0, 2000, extrusionDepth);
  sliders.extrusion.class('slider');
  sliders.extrusion.input(() => {
    extrusionDepth = sliders.extrusion.value();
    label7.html(`
      <span class="label-left">EXTRUDE</span>
      <span class="label-right">${extrusionDepth}</span>
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
  let label8 = createP(`
    <span class="label-left">FORMAT</span>
  `);
  label8.class('label-container');
  label8.parent(uiContainer);

 // Format Dropdown
inputs.format = createSelect();
inputs.format.class('dropdown');
inputs.format.option('1080*1080', [540, 540]);
inputs.format.option('1080*1920', [540, 960]);
inputs.format.option('1920*1080', [960, 540]);
inputs.format.option('2048*2048', [1024, 1024]);
inputs.format.option('2560*1440 (4K)', [1280, 720]); 
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

// Mutation Button
    buttons.save = createButton(`
      
      <span class="center-align">Save PNG</span>
      
    `);
    buttons.save.class('button');
    buttons.save.mousePressed(savePNG);
    buttons.save.parent(uiContainer);

  

}
function setup() {
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
  if (animate) {
    rotationY += 0.1;
  }
  
  posZ = extrusionDepth/2;

  // Check if we have an SVG or a raster image
  if (shapes.length > 0) {
    // SVG case: Draw the extruded 3D model
    offscreen.push();
    offscreen.rotateX(rotationX);
    offscreen.rotateY(rotationY);
    offscreen.scale(zoom * pd);
    offscreen.translate(posX, posY, posZ);
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
    offscreen.image(img, -width / 2 * pd, -height / 2 * pd, width * pd, height * pd);
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
      let imgX = floor(map(x, 0, columns, 0, offscreen.width*pd));
      let imgY = floor(map(y, 0, rows, 0, offscreen.height*pd));

      let i = (imgY * offscreen.width*pd + imgX) * 4;
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

// File Handling
function handleFileDrop(file) {
    if (file.type === 'image' && file.subtype === 'svg+xml') {
        let svgData = file.data;
        
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
    } else if (file.type === 'image'){

    img = loadImage(file.data, () => {
      // Resize the image to fit the canvas
      img.resize(width, height);
    });
    shapes.length = 0;
    }

}

//
function savePNG() {
  save(createFileName('tonacc-stylizer', 'png'));
}

function createFileName(prefix, extension){
  let now = new Date();
  let datePart = `${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}`;
  let timePart = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
  return `${prefix}_${datePart}${timePart}.${extension}`;
}

}
