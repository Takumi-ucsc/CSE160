// Vertex shader program
const VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
}`

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  void main() {
    // Use Normal
    if (u_whichTexture == -3) {
        gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
    // Use color
    } else if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
    // Use UV debug color
    } else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    // Use texture0
    } else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    // Use texture1
    } else if (u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    // Use texture2
    } else if (u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);
    // Error
    } else {
        gl_FragColor = vec4(1.0, .2, .2, 1.0);
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    /* Green and Red light */
    // if (r < 1.0) {
    //   gl_FragColor = vec4(1,0,0,1);
    // } else if (r < 2.0) {
    //   gl_FragColor = vec4(0,1,0,1);
    // }

    /* Light fall off visualization */
    // gl_FragColor = vec4(vec3(gl_FragColor) / (r*r), 1);

    /* N dot L */
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);
    // gl_FragColor = gl_FragColor * nDotL;
    // gl_FragColor.a = 1.0;

    /* Reflection */
    vec3 R = reflect(-L, N);

    /* Eye */
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    /* Specular */
    float specular = pow(max(dot(E,R), 0.0), 64.0) * 0.8;
    
    vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;
    if (u_lightOn) {
        // Only sphere gets specular
        if (u_whichTexture == 2) {
            gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
        } else {
            gl_FragColor = vec4(diffuse + ambient, 1.0);
        }
    }
}`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let g_globalAngle = 0;

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

    // Get the storage location of a_Normal
    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
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

    // Get the storage location of u_lightPos
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get the storage location of u_lightPos');
        return;
    }

    // Get the storage location of u_cameraPos
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get the storage location of u_cameraPos');
        return;
    }

    // Get the storage location of u_lightOn
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get the storage location of u_lightOn');
        return;
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

    // Set an initial value for the matrix to identity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// UI variables
let g_normalOn = false;

/* UI */
function addActionsForHtmlUI() {
    // Button events
    document.getElementById('normalOn').onclick = function () { g_normalOn = true; };
    document.getElementById('normalOff').onclick = function () { g_normalOn = false; };

    // Light On
    document.getElementById('lightOn').onclick = function() { g_lightOn = true; };
    document.getElementById('lightOff').onclick = function() { g_lightOn = false; };

    // Light XYZ
    document.getElementById('lightSlideX').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightPos[0] = this.value / 100; renderLight(); } });
    document.getElementById('lightSlideY').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightPos[1] = this.value / 100; renderLight(); } });
    document.getElementById('lightSlideZ').addEventListener('mousemove', function (ev) { if (ev.buttons == 1) { g_lightPos[2] = this.value / 100; renderLight(); } });

    // X-axis Angle Slider Event
    document.getElementById('angle').addEventListener('input', function () {
        g_globalAngle = -this.value; // Update the global X-axis rotation angle based on the slider input
    renderEverything(); // Render the scene with the updated angle
    });
}

/* main */
function main() {
    // Set up canvas and gl variables
    setupWebGL();
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

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
    // Draw the sky
    var sky = new Cube();
    sky.color = [0.8, 0.8, 0.8, 1];
    sky.textureNum = -2;
    if (g_normalOn) sky.textureNum = -3;
    sky.matrix.scale(-5, -5, -5); // Because normals in negative
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    // Draw the floor
    var floor = new Cube();
    floor.color = [1.0, 0.0, 0.0, 1.0];
    floor.matrix.translate(0, -2.49, 0);
    floor.matrix.scale(10, 0, 10);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.textureNum = 1;
    floor.render();
}

// Light variables
let g_lightPos = [0, 1, -2];
let g_lightOn = true;

function renderLight() {
    var light = new Cube();
    light.color = [2, 2, 0, 1];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-.1, -.1, -.1);
    light.matrix.translate(-0.5, -0.5, -0.5);
    // Animate the light
    g_lightPos[0] = 2.3 * Math.cos(g_seconds);
    light.render();
}

// Render my favorite animal
function renderPenguin() {
    // Create a root matrix for the penguin
    let penguinMatrix = new Matrix4();
    penguinMatrix.scale(1, 1, 1); // Scale up the penguin
    penguinMatrix.translate(0.25, -0.5, 0.0); // Move the penguin up
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

function renderSphere() {
    let sphere = new Sphere();

    sphere.color = [0.5, 0.5, 0.5, 1.0];
    sphere.textureNum = 2;
    if (g_normalOn) sphere.textureNum = -3;
    sphere.matrix.translate(-0.75, -1.0, 0.5);
    sphere.matrix.scale(0.25, 0.25, 0.25);
    sphere.render();
}

// Camera variables
var g_Camera = new Camera(canvas);

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

// Camera rotating with mouse
function handleClicks() {
    // Register functions
    canvas.onmousedown = mouseDown;
    canvas.onmousemove = mouseMove;
    canvas.onmouseup = mouseUp;
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

    // Pass the light position
    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

    // Pass the camera position to GLSL
    gl.uniform3f(u_cameraPos, g_Camera.eye.elements[0], g_Camera.eye.elements[1],  g_Camera.eye.elements[2]);

    // Pass the light status
    gl.uniform1i(u_lightOn, g_lightOn);

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render
    drawSurrounding();

    renderLight();

    renderPenguin();

    renderSphere();

    // renderMap();
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
    image2.src = './dirt.jpeg';

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

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}