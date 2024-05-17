// Vertex shader program
const VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
}`

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {
    // Use color
    if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
    // Use UV debug color
    } else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    // Use texture0
    } else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    // Use texture1
    } else if (u_whichTexture == -3) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    // Use texture2
    } else if (u_whichTexture == -4) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == -5) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);
    // Error
    } else {
        gl_FragColor = vec4(1, 0, 0, 1.0);
    }
}`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_whichTexture;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return false;
    }

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return false;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return false;
    }



    // Set an initial value for the matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function main() {
    // Set up canvas and gl variables
    setupWebGL();
    connectVariablesToGLSL();

    // Register function to be called on a mouse press
    document.onkeydown = keydown;

    // Register function to handle mouse clicks
    handleClicks();

    // Call initTextures
    initTextures();

    // Set clear color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Render
    requestAnimationFrame(tick);
}

// Performance time variables
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

    // Draw everything
    renderEverything();

    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);

}

// Render floor and sky
function drawSurrounding() {
    // Draw the floor
    var floor = new Cube();
    floor.color = [0.910, 0.874, 0.601, 1];
    floor.matrix.translate(0, -.75, 0);
    floor.matrix.scale(32, 0, 32);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.textureNum = -3;
    floor.render();

    // Draw the sky
    var sky = new Cube();
    sky.color = [0.764, 0.920, 0.917, 1];
    sky.matrix.scale(75, 75, 75);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.textureNum = 0;
    sky.render();
}

// Render my favorite animal
function renderPenguin() {
    // Create a root matrix for the penguin
    let penguinMatrix = new Matrix4();
    penguinMatrix.scale(0.5, 0.5, 0.5); // Scale up the penguin
    penguinMatrix.translate(-31, -0.25, 0.0); // Move the penguin up
    penguinMatrix.rotate(-90, 0.0, 1.0, 0.0); // Rotate the penguin

    // Body
    let body = new Cube();
    body.color = [0.05, 0.05, 0.05, 0.8]; // Black body
    body.matrix = new Matrix4(penguinMatrix); // Base Matrix
    body.matrix.translate(0.0, -0.2, 0.0);
    body.matrix.scale(0.5, 0.7, 0.5);
    var bodyMat = new Matrix4(body.matrix); // Stomach
    var bodyMat2 = new Matrix4(body.matrix); // Head
    var bodyMat3 = new Matrix4(body.matrix); // Feet
    var bodyMat4 = new Matrix4(body.matrix);
    var bodyMat5 = new Matrix4(body.matrix); // Wings
    var bodyMat6 = new Matrix4(body.matrix);
    body.render();

    // Stomach (white part)
    let stomach = new Cube();
    stomach.color = [1.0, 1.0, 1.0, 1.0]; // White
    stomach.matrix = bodyMat;
    stomach.matrix.translate(0.05, 0.05, -0.05);
    stomach.matrix.scale(0.9, 0.9, 0.1);
    stomach.render();

    // Head
    let head = new Cube();
    head.color = [0.05, 0.05, 0.05, 0.8]; // Black
    head.matrix = bodyMat2;
    head.matrix.translate(0.1, 0.65, 0.1);
    head.matrix.scale(0.8, 0.8, 0.8);
    var headMat1 = new Matrix4(head.matrix);
    var headMat2 = new Matrix4(head.matrix);
    var headMat3 = new Matrix4(head.matrix);
    head.render();

    // Beak
    let beak = new Cube();
    beak.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    beak.matrix = headMat1;
    beak.matrix.translate(0.4, 0.5, -0.3);
    beak.matrix.scale(0.25, 0.25, 0.5);
    beak.render();

    // Eyes
    let eye1 = new Cube();
    eye1.color = [1.0, 1.0, 1.0, 1.0]; // White
    eye1.matrix = headMat2;
    eye1.matrix.translate(0.2, 0.7, -0.05);
    eye1.matrix.scale(0.1, 0.1, 0.1);
    eye1.render();

    let eye2 = new Cube();
    eye2.color = [1.0, 1.0, 1.0, 1.0]; // White
    eye2.matrix = headMat3;
    eye2.matrix.translate(0.75, 0.7, -0.05);
    eye2.matrix.scale(0.1, 0.1, 0.1);
    eye2.render();

    // Feet
    let rightFoot = new Cube();
    rightFoot.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    rightFoot.matrix = bodyMat3;
    rightFoot.matrix.translate(0.2, -0.1, -0.15);
    rightFoot.matrix.scale(0.3, 0.1, 1.0);
    rightFoot.render();

    let leftFoot = new Cube();
    leftFoot.color = [1.0, 0.65, 0.0, 1.0]; // Orange 
    leftFoot.matrix = bodyMat4;
    leftFoot.matrix.translate(0.55, -0.1, -0.15);
    leftFoot.matrix.scale(0.3, 0.1, 1.0);
    leftFoot.render();

    // Wings
    let wingRight = new Cube();
    wingRight.color = [0.05, 0.05, 0.05, 0.8]; // Black
    wingRight.matrix = bodyMat5;
    wingRight.matrix.translate(1, 0.35, 0.3);
    wingRight.matrix.scale(0.15, 0.65, 0.4);
    wingRight.render();

    let wingLeft = new Cube();
    wingLeft.color = [0.05, 0.05, 0.05, 0.8]; // Black
    wingLeft.matrix = bodyMat6;
    wingLeft.matrix.translate(-0.1, 0.35, 0.3);
    wingLeft.matrix.scale(0.15, 0.65, 0.4);
    wingLeft.render();
}

function renderPenguinMom() {
    // Create a root matrix for the penguin
    let penguinMatrix = new Matrix4();
    penguinMatrix.scale(1, 1, 1); // Scale up the penguin
    penguinMatrix.translate(0, -0.5, 0.0); // Move the penguin up
    penguinMatrix.rotate(180, 0.0, 1.0, 0.0); // Rotate the penguin

    // Body
    let body = new Cube();
    body.color = [0.05, 0.05, 0.05, 0.8]; // Black body
    body.matrix = new Matrix4(penguinMatrix); // Base Matrix
    body.matrix.translate(0.0, -0.2, 0.0);
    body.matrix.scale(0.5, 0.7, 0.5);
    var bodyMat = new Matrix4(body.matrix); // Stomach
    var bodyMat2 = new Matrix4(body.matrix); // Head
    var bodyMat3 = new Matrix4(body.matrix); // Feet
    var bodyMat4 = new Matrix4(body.matrix);
    var bodyMat5 = new Matrix4(body.matrix); // Wings
    var bodyMat6 = new Matrix4(body.matrix);
    body.render();

    // Stomach (white part)
    let stomach = new Cube();
    stomach.color = [1.0, 1.0, 1.0, 1.0]; // White
    stomach.matrix = bodyMat;
    stomach.matrix.translate(0.05, 0.05, -0.05);
    stomach.matrix.scale(0.9, 0.9, 0.1);
    stomach.render();

    // Head
    let head = new Cube();
    head.color = [0.05, 0.05, 0.05, 0.8]; // Black
    head.matrix = bodyMat2;
    head.matrix.translate(0.1, 0.65, 0.1);
    head.matrix.scale(0.8, 0.8, 0.8);
    var headMat1 = new Matrix4(head.matrix);
    var headMat2 = new Matrix4(head.matrix);
    var headMat3 = new Matrix4(head.matrix);
    head.render();

    // Beak
    let beak = new Cube();
    beak.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    beak.matrix = headMat1;
    beak.matrix.translate(0.4, 0.5, -0.3);
    beak.matrix.scale(0.25, 0.25, 0.5);
    beak.render();

    // Eyes
    let eye1 = new Cube();
    eye1.color = [1.0, 1.0, 1.0, 1.0]; // White
    eye1.matrix = headMat2;
    eye1.matrix.translate(0.2, 0.7, -0.05);
    eye1.matrix.scale(0.1, 0.1, 0.1);
    eye1.render();

    let eye2 = new Cube();
    eye2.color = [1.0, 1.0, 1.0, 1.0]; // White
    eye2.matrix = headMat3;
    eye2.matrix.translate(0.75, 0.7, -0.05);
    eye2.matrix.scale(0.1, 0.1, 0.1);
    eye2.render();

    // Feet
    let rightFoot = new Cube();
    rightFoot.color = [1.0, 0.65, 0.0, 1.0]; // Orange
    rightFoot.matrix = bodyMat3;
    rightFoot.matrix.translate(0.2, -0.1, -0.15);
    rightFoot.matrix.scale(0.3, 0.1, 1.0);
    rightFoot.render();

    let leftFoot = new Cube();
    leftFoot.color = [1.0, 0.65, 0.0, 1.0]; // Orange 
    leftFoot.matrix = bodyMat4;
    leftFoot.matrix.translate(0.55, -0.1, -0.15);
    leftFoot.matrix.scale(0.3, 0.1, 1.0);
    leftFoot.render();

    // Wings
    let wingRight = new Cube();
    wingRight.color = [0.05, 0.05, 0.05, 0.8]; // Black
    wingRight.matrix = bodyMat5;
    wingRight.matrix.translate(1, 0.35, 0.3);
    wingRight.matrix.scale(0.15, 0.65, 0.4);
    wingRight.render();

    let wingLeft = new Cube();
    wingLeft.color = [0.05, 0.05, 0.05, 0.8]; // Black
    wingLeft.matrix = bodyMat6;
    wingLeft.matrix.translate(-0.1, 0.35, 0.3);
    wingLeft.matrix.scale(0.15, 0.65, 0.4);
    wingLeft.render();
}

/*
// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
    var body = new Cube();
    body.color = [0.5, 0.5, 0.5, 1];
    body.textureNum = 0;
    body.matrix.setTranslate(0, 0, 0);
    body.matrix.scale(1, 1, 1);
    body.render();
}
*/


// Camera variables
var g_Camera = new Camera(canvas);
let g_globalAngle = 0;

// WASD moving and QE panninga
function keydown(ev) {
    // Default speed is 0.5
    // forward (W)
    if (ev.keyCode == 87) {
        g_Camera.moveForward(0.5);
    }
    // left (A)
    if (ev.keyCode == 65) {
        g_Camera.moveLeft(0.5);
    }
    // backward (S)
    if (ev.keyCode == 83) {
        g_Camera.moveBackward(0.5);
    }
    // right (D)
    if (ev.keyCode == 68) {
        g_Camera.moveRight(0.5);
    }
    // Default degree is 10
    // panleft (Q)
    if (ev.keyCode == 81) {
        g_Camera.panLeft(10);
    }
    // panright (E)
    if (ev.keyCode == 69) {
        g_Camera.panRight(10);
    }
    renderEverything();

    // Debug
    //console.log(ev.keyCode);
}

// Mouse event variables
var g_mouseDownX = 0, g_mouseDownY = 0;
var g_isMouseDown = false;

// Called when mouse is clicked
function mouseDown(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();

    // Start dragging if a mouse is inside <canvas>
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        g_mouseDownX = x;
        g_mouseDownY = y;
        g_isMouseDown = true;
    }
}

// Called when mouse is released
function mouseUp(ev) {
    g_isMouseDown = false;
}

// Called when mouse is moved
function mouseMove(ev) {
    if (g_isMouseDown) {
        var x = ev.clientX;
        var y = ev.clientY;
        var factor = 100 / canvas.height; // The rotation ratio

        var dx = factor * (x - g_mouseDownX);
        var dy = factor * (y - g_mouseDownY);

        g_Camera.panLeft(dx);
        g_Camera.panUp(dy);

        g_mouseDownX = x;
        g_mouseDownY = y;

        renderEverything();
    }
}

// Map
var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 2, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Render a map
function renderMap() {
    for (let z = 0; z < 32; z++) {
        for (let x = 0; x < 32; x++) {
            if (g_map[z][x] == 1) {
                var map = new Cube();
                map.textureNum = -4;
                map.color = [1, 1, 1, 1];
                map.matrix.translate(x - 16, -.75, z - 16);
                map.matrix.scale(1, 0.5, 1);
                map.render();
            } else if (g_map[z][x] == 2) {
                var map = new Cube();
                map.textureNum = -5;
                map.color = [1, 1, 1, 1];
                map.matrix.translate(x - 16, -.75, z - 16);
                map.matrix.scale(1, 1, 1);
                map.render();
            }
        }
    }
}

// Camera rotating with mouse
// Add and Remove block
function handleClicks() {
    // Register functions
    canvas.onmousedown = mouseDown;
    canvas.onmousemove = mouseMove;
    canvas.onmouseup = mouseUp;

    // Add block
    document.getElementById('add').onclick = () => {
        const x = Math.round(g_Camera.at.elements[0] + 16);
        const z = Math.round(g_Camera.at.elements[2] + 16);
        if (z >= 0 && z < g_map.length) {
            if (x >= 0 && x < g_map[z].length) {
                g_map[z][x] = 2;
                renderEverything();
            }
        }
    };

    // Remove block
    document.getElementById('delete').onclick = () => {
        const x = Math.round(g_Camera.at.elements[0] + 16);
        const z = Math.round(g_Camera.at.elements[2] + 16);
        if (z >= 0 && z < g_map.length) {
            if (x >= 0 && x < g_map[z].length) {
                g_map[z][x] = 0;
                renderEverything();
            }
        }
    };
}

function renderEverything() {

    // Update view matrix based on camera
    g_Camera.setViewMat();

    // Pass the projection matrix
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_Camera.projMat.elements);

    // Pass the view matrix
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_Camera.viewMat.elements);

    // Pass the global rotation matrix
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render
    drawSurrounding();

    renderPenguin();
    renderPenguinMom();
    renderMap();

}

function initTextures() {
    // Create the image object
    var image0 = new Image();
    if (!image0) {
        console.log('Failed to create the image object');
        return false;
    }

    // Register the event handler to be called on loading an image
    image0.onload = function () { sendTextureToGLSL0(image0); };

    // Tell the browser to load an image
    image0.src = './sky.jpg';

    // Create the image object
    var image1 = new Image();
    if (!image1) {
        console.log('Failed to create the image object');
        return false;
    }

    // Register the event handler to be called on loading an image
    image1.onload = function () { sendTextureToGLSL1(image1); };

    // Tell the browser to load an image
    image1.src = './grass.jpeg';

    // Create the image object
    var image2 = new Image();
    if (!image2) {
        console.log('Failed to create the image object');
        return false;
    }

    // Register the event handler to be called on loading an image
    image2.onload = function () { sendTextureToGLSL2(image2); };

    // Tell the browser to load an image
    image2.src = './block.png';

    // Create the image object
    var image3 = new Image();
    if (!image3) {
        console.log('Failed to create the image object');
        return false;
    }

    // Register the event handler to be called on loading an image
    image3.onload = function () { sendTextureToGLSL3(image3); };

    // Tell the browser to load an image
    image3.src = './dirt.jpeg';

    return true;
}

function sendTextureToGLSL0(image) {
    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);
}

function sendTextureToGLSL1(image) {
    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 1 to the sampler
    gl.uniform1i(u_Sampler1, 1);
}

function sendTextureToGLSL2(image) {
    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE2);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 2 to the sampler
    gl.uniform1i(u_Sampler2, 2);
}

function sendTextureToGLSL3(image) {
    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE3);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 2 to the sampler
    gl.uniform1i(u_Sampler3, 3);
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