// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }); // This prevents from lagging at 5000 dots.
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  // Enable depth test
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix')
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
}


// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables related to mouse
let g_globalAngleX = 0; // X-axis rotation
let g_globalAngleY = 0; // Y-axis rotation
let isDragging = false; // Dragging is off first
let shift_key = false; // Shift-key is off firtst
// Wing Animation
let g_leftWingAngle = 0;
let g_rightWingAngle = 0;
// Leg Animation
let g_leftLegAngle = 0;
let g_rightLegAngle = 0;
let g_animationEnabled = false; // Animation enabled flag
// Shift Animation
let g_jumpTime = 0; // Speed of jump
let g_jumpHeight = 0; // Height of jump
let swayAngle = 0; // Degree of sway
let swaySpeed = 0.5; // Speed of sway
let beakScale = 1.0; // Length of beak

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // X-axis Angle Slider Event
  document.getElementById('angleX').addEventListener('input', function () {
    g_globalAngleX = -this.value; // Update the global X-axis rotation angle based on the slider input
    renderAllShapes(); // Render the scene with the updated angle
  });

  // Y-axis Angle Slider Event
  document.getElementById('angleY').addEventListener('input', function () {
    g_globalAngleY = -this.value; // Update the global Y-axis rotation angle based on the slider input
    renderAllShapes(); // Render the scene with the updated angle
  });

  // Animation toggle button events
  // Animation on
  document.getElementById('animate-on').addEventListener('click', function () {
    g_animationEnabled = true;
  });

  // Animation off
  document.getElementById('animate-off').addEventListener('click', function () {
    g_animationEnabled = false;
    g_leftLegAngle = 0;
    g_rightLegAngle = 0;
    g_wingAngle = 0;
  });

  // Left Wing Slider Event
  document.getElementById('leftWingSlider').addEventListener('input', function () {
    g_leftWingAngle = this.value;
    renderAllShapes();
  });

  // Right Wing Slider Event
  document.getElementById('rightWingSlider').addEventListener('input', function () {
    g_rightWingAngle = this.value;
    renderAllShapes();
  });

  // Left Leg Slider Event
  document.getElementById('leftLegSlider').addEventListener('input', function () {
    g_leftLegAngle = this.value;
    renderAllShapes();
  });

  // Right Leg Slider Event
  document.getElementById('rightLegSlider').addEventListener('input', function () {
    g_rightLegAngle = this.value;
    renderAllShapes();
  });

  // Variables to store the mouse position at the start of the drag
  let lastMouseX = 0;
  let lastMouseY = 0;

  // When the mouse button is clicked, start dragging or perform special animation
  canvas.addEventListener('mousedown', function (event) {
    if (event.button === 0) { // Check if the left mouse button is pressed
      if (event.shiftKey) {
        // Perform special animation
        shift_key = true;
      } else {
        // Normal dragging logic
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        lastMouseX = event.clientX - rect.left; // Record the mouse position at the start of the drag
        lastMouseY = event.clientY - rect.top;
      }
    }
  });

  // When user moves the mouse, update rotation based on mouse movement
  canvas.addEventListener('mousemove', function (event) {
    if (isDragging) {
      const rect = canvas.getBoundingClientRect();
      const currentMouseX = event.clientX - rect.left;
      const currentMouseY = event.clientY - rect.top;

      // Calculate the angle of rotation based on the mouse movement
      const deltaX = currentMouseX - lastMouseX;
      const deltaY = currentMouseY - lastMouseY;

      // Adjust the rotation angles based on mouse movement
      g_globalAngleX -= deltaX * 1; // Reverse the direction of rotation along the X-axis
      g_globalAngleY += deltaY * 1;

      // Update the rotation matrix and re-render
      const newRotationMatrix = new Matrix4().rotate(g_globalAngleY, 1, 0, 0).rotate(g_globalAngleX, 0, 1, 0);
      gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, newRotationMatrix.elements);

      // Update the sliders with the new values
      document.getElementById('angleX').value = g_globalAngleX;
      document.getElementById('angleY').value = g_globalAngleY;

      lastMouseX = currentMouseX; // Update the last mouse X position
      lastMouseY = currentMouseY; // Update the last mouse Y position

      renderAllShapes(); // Re-render the scene
    }
  });

  // When user stops moving the mouse
  canvas.addEventListener('mouseup', function (event) {
    if (event.button === 0) { // When the left mouse button is released
      isDragging = false;
      shift_key = false;
    }
  });

  // When the mouse leaves the canvas, end dragging
  canvas.addEventListener('mouseleave', function (event) {
    isDragging = false;
  });
}


// Main Function
function main() {

  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.5, 0.9, 0.9, 1.0);

  requestAnimationFrame(tick);
}
var lastFrameTime = performance.now();
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  var now = performance.now();
  var duration = now - lastFrameTime;
  lastFrameTime = now;

  if (duration > 0) {
    var fps = 1000 / duration;
    sendTextToHTML(" fps: " + fps.toFixed(2), "numdot");
  }

  g_seconds = performance.now() / 1000.0 - g_startTime;
  console.log(performance.now());

  // Update jump animation
  if (shift_key) {
    g_jumpTime += 0.08; // Jump speed
    g_jumpHeight = Math.sin(g_jumpTime) * 0.15; // Jump height
    swayAngle = Math.sin(performance.now() * 0.001 * swaySpeed) * 60;
  } else {
    g_jumpTime = 0;
    g_jumpHeight = 0;
    swayAngle = 0;
  }

  // Update animation angles
  if (g_animationEnabled || shift_key) {
    updateAnimationAngles();
  }

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

// Update animation angles
function updateAnimationAngles() {
  if (shift_key) {
    // Update wing angles
    g_leftWingAngle = Math.max(0, Math.sin(2 * g_seconds) * 45);
    g_rightWingAngle = Math.max(0, Math.sin(2 * g_seconds) * 45);

    // Update leg angles
    g_leftLegAngle = (30 * Math.sin(2 * g_seconds));
    g_rightLegAngle = (-30 * Math.sin(2 * g_seconds));

    // Update the beak
    beakScale = 0.3 + 0.15 * Math.sin(performance.now() * 0.005);
  }
  else {
    g_jumpTime = 0;
    g_jumpHeight = 0;
    swayAngle = 0;
    beakScale = 1.0;
  }

  if (g_animationEnabled) {
    // Update leg angles
    g_leftLegAngle = (30 * Math.sin(2 * g_seconds));
    g_rightLegAngle = (-30 * Math.sin(2 * g_seconds));

    // Update wing angles
    if (Math.sin(g_seconds * 10) > 0) {
      g_leftWingAngle = Math.sin(g_seconds * 10) * 30;
      g_rightWingAngle = g_leftWingAngle;
    } else {
      g_leftWingAngle = 0;
      g_rightWingAngle = 0;
    }
  }
}


// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
  // Pass the matrix to u_GlobalRotateMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).rotate(g_globalAngleY, 1, 0, 0);
  var jumpMatrix = new Matrix4().translate(0, g_jumpHeight, 0);
  var swayMatrix = new Matrix4().rotate(swayAngle, 0, 1, 0);
  globalRotMat = globalRotMat.multiply(jumpMatrix).multiply(swayMatrix);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (shift_key) {
    let body = new Cube();
    body.color = [0.9, 0.5, 0.5, 1];
    body.matrix.translate(0.0, -0.2, 0.0);
    body.matrix.scale(0.5, 0.7, 0.5);
    globalRotMat.multiply(body.matrix);
    body.render();

    // Stomach (white part)
    let stomach = new Cube();
    stomach.color = [1.0, 1.0, 1.0, 1.0]; // White
    stomach.matrix.translate(0.0, -0.2, -0.25);
    stomach.matrix.scale(0.45, 0.65, 0.05);
    globalRotMat.multiply(stomach.matrix);
    stomach.render();

    // Adding a triangle pattern on the stomach
    let stomachTriangle = new Pattern();
    stomachTriangle.color = [0.8, 0.8, 0.8, 1.0]; // Light grey
    stomachTriangle.matrix.translate(-0.2, -0.2, -0.3); // Slightly in front of the stomach
    // stomachTriangle.matrix.rotate(45, 0, 0, 1);
    stomachTriangle.matrix.scale(0.05, 0.05, 0.05); // Scale it down to fit on the stomach
    globalRotMat.multiply(stomachTriangle.matrix);
    stomachTriangle.render();

    let stomachTriangle2 = new Pattern();
    stomachTriangle2.color = [0.8, 0.8, 0.8, 1.0]; // Light grey
    stomachTriangle2.matrix.translate(0.1, -0.1, -0.3); // Slightly in front of the stomach
    stomachTriangle2.matrix.scale(0.05, 0.05, 0.05); // Scale it down to fit on the stomach
    globalRotMat.multiply(stomachTriangle2.matrix);
    stomachTriangle2.render();

    let stomachTriangle3 = new Pattern();
    stomachTriangle3.color = [0.8, 0.8, 0.8, 1.0]; // Light grey
    stomachTriangle3.matrix.translate(0.1, -0.4, -0.3); // Slightly in front of the stomach
    stomachTriangle3.matrix.scale(0.05, 0.05, 0.05); // Scale it down to fit on the stomach
    globalRotMat.multiply(stomachTriangle3.matrix);
    stomachTriangle3.render();

    let stomachTriangle4 = new Pattern();
    stomachTriangle4.color = [0.8, 0.8, 0.8, 1.0]; // Light grey
    stomachTriangle4.matrix.translate(-0.1, 0, -0.3); // Slightly in front of the stomach
    stomachTriangle4.matrix.scale(0.05, 0.05, 0.05); // Scale it down to fit on the stomach
    globalRotMat.multiply(stomachTriangle4.matrix);
    stomachTriangle4.render();

    let stomachTriangle5 = new Pattern();
    stomachTriangle5.color = [0.8, 0.8, 0.8, 1.0]; // Light grey
    stomachTriangle5.matrix.translate(-0.15, -0.5, -0.3); // Slightly in front of the stomach
    stomachTriangle5.matrix.scale(0.05, 0.05, 0.05); // Scale it down to fit on the stomach
    globalRotMat.multiply(stomachTriangle5.matrix);
    stomachTriangle5.render();

    // Head
    let head = new Cube();
    head.color = [0.9, 0.5, 0.5, 1];
    head.matrix.translate(0.0, 0.3, 0.0);
    head.matrix.scale(0.4, 0.4, 0.4);
    globalRotMat.multiply(head.matrix);
    head.render();

    // Beak
    let beak = new Cube();
    beak.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    beak.matrix.translate(0.0, 0.25, -0.3);
    beak.matrix.scale(0.1, 0.1, beakScale);
    globalRotMat.multiply(beak.matrix);
    beak.render();

    // Legs
    let leg1 = new Cube();
    leg1.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    leg1.matrix.translate(-0.15, -0.8, -0.15);
    leg1.matrix.rotate(-g_rightLegAngle, 1, 0, 0); // Rotate leg for animation
    leg1.matrix.scale(0.1, 0.1, 0.5);
    globalRotMat.multiply(leg1.matrix);
    leg1.render();

    let leg2 = new Cube();
    leg2.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    leg2.matrix.translate(0.15, -0.8, -0.15);
    leg2.matrix.rotate(-g_leftLegAngle, 1, 0, 0); // Rotate leg in opposite direction for animation
    leg2.matrix.scale(0.1, 0.1, 0.5);
    globalRotMat.multiply(leg2.matrix);
    leg2.render();

    let leg3 = new Cube();
    leg3.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    leg3.matrix.translate(-0.15, -0.6, 0);
    leg3.matrix.rotate(-g_rightLegAngle, 1, 0, 0);
    leg3.matrix.scale(0.1, 0.4, 0.15);
    globalRotMat.multiply(leg3.matrix);
    leg3.render();

    let leg4 = new Cube();
    leg4.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    leg4.matrix.translate(0.15, -0.6, 0);
    leg4.matrix.rotate(-g_leftLegAngle, 1, 0, 0);
    leg4.matrix.scale(0.1, 0.4, 0.15);
    globalRotMat.multiply(leg4.matrix);
    leg4.render();

    // Eyes
    let eye1 = new Cube();
    eye1.color = [1.0, 1.0, 1.0, 1.0]; // White
    eye1.matrix.translate(-0.1, 0.4, -0.2);
    eye1.matrix.scale(0.05, 0.05, 0.05);
    globalRotMat.multiply(eye1.matrix);
    eye1.render();

    let eye2 = new Cube();
    eye2.color = [1.0, 1.0, 1.0, 1.0]; // White
    eye2.matrix.translate(0.1, 0.4, -0.2);
    eye2.matrix.scale(0.05, 0.05, 0.05);
    globalRotMat.multiply(eye2.matrix);
    eye2.render();

    // Right Wing
    let wingRight = new Cube();
    wingRight.color = [0.9, 0.5, 0.5, 1];
    wingRight.matrix.translate(0.27, -0.1, 0.0); // Position to the right side
    wingRight.matrix.rotate(0, 0, 1, 0); // Rotate slightly for dynamic pose
    wingRight.matrix.translate(0, 0.25, 0); // Move the pivot point to the top of the cube
    wingRight.matrix.rotate(g_rightWingAngle, 0, 0, 1); // Rotate wing for animation
    wingRight.matrix.translate(0, -0.25, 0); // Move the pivot point back to the original position
    wingRight.matrix.scale(0.1, 0.5, 0.2); // Scale to thin, wing-like shape
    globalRotMat.multiply(wingRight.matrix);
    wingRight.render();

    // Left Wing
    let wingLeft = new Cube();
    wingLeft.color = [0.9, 0.5, 0.5, 1];
    wingLeft.matrix.translate(-0.27, -0.1, 0.0); // Position to the left side
    wingLeft.matrix.rotate(0, 0, 1, 0); // Mirror rotation for the left wing
    wingLeft.matrix.translate(0, 0.25, 0); // Move the pivot point to the top of the cube
    wingLeft.matrix.rotate(-g_leftWingAngle, 0, 0, 1); // Mirror rotation for the left wing
    wingLeft.matrix.translate(0, -0.25, 0); // Move the pivot point back to the original position
    wingLeft.matrix.scale(0.1, 0.5, 0.2); // Same scale as right wing
    globalRotMat.multiply(wingLeft.matrix);
    wingLeft.render();
  } else {
    // Body
    let body = new Cube();
    body.color = [0.05, 0.05, 0.05, 0.8]; // Black body
    body.matrix.translate(0.0, -0.2, 0.0);
    body.matrix.scale(0.5, 0.7, 0.5);
    body.render();

    // Stomach (white part)
    let stomach = new Cube();
    stomach.color = [1.0, 1.0, 1.0, 1.0]; // White
    stomach.matrix.translate(0.0, -0.2, -0.25);
    stomach.matrix.scale(0.45, 0.65, 0.05);
    stomach.render();

    // Adding a triangle pattern on the stomach
    let stomachTriangle = new Pattern();
    stomachTriangle.color = [0.8, 0.8, 0.8, 1.0]; // Light grey
    stomachTriangle.matrix.translate(-0.2, -0.2, -0.3); // Slightly in front of the stomach
    // stomachTriangle.matrix.rotate(45, 0, 0, 1);
    stomachTriangle.matrix.scale(0.05, 0.05, 0.05); // Scale it down to fit on the stomach
    stomachTriangle.render();

    let stomachTriangle2 = new Pattern();
    stomachTriangle2.color = [0.8, 0.8, 0.8, 1.0]; // Light grey
    stomachTriangle2.matrix.translate(0.1, -0.1, -0.3); // Slightly in front of the stomach
    stomachTriangle2.matrix.scale(0.05, 0.05, 0.05); // Scale it down to fit on the stomach
    stomachTriangle2.render();

    let stomachTriangle3 = new Pattern();
    stomachTriangle3.color = [0.8, 0.8, 0.8, 1.0]; // Light grey
    stomachTriangle3.matrix.translate(0.1, -0.4, -0.3); // Slightly in front of the stomach
    stomachTriangle3.matrix.scale(0.05, 0.05, 0.05); // Scale it down to fit on the stomach
    stomachTriangle3.render();

    let stomachTriangle4 = new Pattern();
    stomachTriangle4.color = [0.8, 0.8, 0.8, 1.0]; // Light grey
    stomachTriangle4.matrix.translate(-0.1, 0, -0.3); // Slightly in front of the stomach
    stomachTriangle4.matrix.scale(0.05, 0.05, 0.05); // Scale it down to fit on the stomach
    stomachTriangle4.render();

    let stomachTriangle5 = new Pattern();
    stomachTriangle5.color = [0.8, 0.8, 0.8, 1.0]; // Light grey
    stomachTriangle5.matrix.translate(-0.15, -0.5, -0.3); // Slightly in front of the stomach
    stomachTriangle5.matrix.scale(0.05, 0.05, 0.05); // Scale it down to fit on the stomach
    stomachTriangle5.render();

    // Head
    let head = new Cube();
    head.color = [0.05, 0.05, 0.05, 0.8]; // Black
    head.matrix.translate(0.0, 0.3, 0.0);
    head.matrix.scale(0.4, 0.4, 0.4);
    head.render();

    // Beak
    let beak = new Cube();
    beak.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    beak.matrix.translate(0.0, 0.25, -0.3);
    beak.matrix.scale(0.1, 0.1, 0.2);
    beak.render();

    // Legs
    let leg1 = new Cube();
    leg1.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    leg1.matrix.translate(-0.15, -0.8, -0.15);
    leg1.matrix.rotate(-g_rightLegAngle, 1, 0, 0); // Rotate leg for animation
    leg1.matrix.scale(0.1, 0.1, 0.5);
    leg1.render();

    let leg2 = new Cube();
    leg2.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    leg2.matrix.translate(0.15, -0.8, -0.15);
    leg2.matrix.rotate(-g_leftLegAngle, 1, 0, 0); // Rotate leg in opposite direction for animation
    leg2.matrix.scale(0.1, 0.1, 0.5);
    leg2.render();

    let leg3 = new Cube();
    leg3.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    leg3.matrix.translate(-0.15, -0.6, 0);
    leg3.matrix.rotate(-g_rightLegAngle, 1, 0, 0);
    leg3.matrix.scale(0.1, 0.4, 0.15);
    leg3.render();

    let leg4 = new Cube();
    leg4.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    leg4.matrix.translate(0.15, -0.6, 0);
    leg4.matrix.rotate(-g_leftLegAngle, 1, 0, 0);
    leg4.matrix.scale(0.1, 0.4, 0.15);
    leg4.render();

    // Eyes
    let eye1 = new Cube();
    eye1.color = [1.0, 1.0, 1.0, 1.0]; // White
    eye1.matrix.translate(-0.1, 0.4, -0.2);
    eye1.matrix.scale(0.05, 0.05, 0.05);
    eye1.render();

    let eye2 = new Cube();
    eye2.color = [1.0, 1.0, 1.0, 1.0]; // White
    eye2.matrix.translate(0.1, 0.4, -0.2);
    eye2.matrix.scale(0.05, 0.05, 0.05);
    eye2.render();

    // Right Wing
    let wingRight = new Cube();
    wingRight.color = [0.05, 0.05, 0.05, 0.8]; // Black color for the wing
    wingRight.matrix.translate(0.27, -0.1, 0.0); // Position to the right side
    wingRight.matrix.rotate(0, 0, 1, 0); // Rotate slightly for dynamic pose
    wingRight.matrix.translate(0, 0.25, 0); // Move the pivot point to the top of the cube
    wingRight.matrix.rotate(g_rightWingAngle, 0, 0, 1); // Rotate wing for animation
    wingRight.matrix.translate(0, -0.25, 0); // Move the pivot point back to the original position
    wingRight.matrix.scale(0.1, 0.5, 0.2); // Scale to thin, wing-like shape
    wingRight.render();

    // Left Wing
    let wingLeft = new Cube();
    wingLeft.color = [0.05, 0.05, 0.05, 0.8]; // Black color for the wing
    wingLeft.matrix.translate(-0.27, -0.1, 0.0); // Position to the left side
    wingLeft.matrix.rotate(0, 0, 1, 0); // Mirror rotation for the left wing
    wingLeft.matrix.translate(0, 0.25, 0); // Move the pivot point to the top of the cube
    wingLeft.matrix.rotate(-g_leftWingAngle, 0, 0, 1); // Mirror rotation for the left wing
    wingLeft.matrix.translate(0, -0.25, 0); // Move the pivot point back to the original position
    wingLeft.matrix.scale(0.1, 0.5, 0.2); // Same scale as right wing
    wingLeft.render();
  }
}
// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}