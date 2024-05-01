var ctx;
var canvas;

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('asg0');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG
    ctx = canvas.getContext('2d');

    // Draw a black rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color
}

function drawVector(v, color) {
    ctx.strokeStyle = color; // Set color
    ctx.beginPath(); // Start a new path
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20, v.elements[2] * 20);
    ctx.stroke(); // Render the path
}

function handleDrawEvent() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw a black rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color

    // Get values from inputs respectively
    var x = document.getElementById('xcoord').value;
    var y = document.getElementById('ycoord').value;
    var x2 = document.getElementById('xcoord2').value;
    var y2 = document.getElementById('ycoord2').value;

    // Draw new lines
    var v1 = new Vector3([x, y, 0.0]);
    drawVector(v1, "red");
    var v2 = new Vector3([x2, y2, 0.0]);
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw a black rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color

    // Get values from inputs respectively
    var x = document.getElementById('xcoord').value;
    var y = document.getElementById('ycoord').value;
    var x2 = document.getElementById('xcoord2').value;
    var y2 = document.getElementById('ycoord2').value;

    // Draw new lines
    var v1 = new Vector3([x, y, 0.0]);
    drawVector(v1, "red");
    var v2 = new Vector3([x2, y2, 0.0]);
    drawVector(v2, "blue");
    var v3 = new Vector3();

    // Define operation and scalar
    var operator = document.getElementById('op').value;
    var scal = document.getElementById('scalar').value;

    // Operations
    switch (operator) {
        // Add
        case "add":
            v3 = v1.add(v2);
            // Draw the resulting vector in green
            drawVector(v3, "green");
            break;
        // Substract
        case "sub":
            v3 = v1.sub(v2);
            drawVector(v3, "green");
            break;
        // Multiply
        case "mult":
            v3 = v1.mul(scal);
            drawVector(v3, "green");
            v3 = v2.mul(scal);
            drawVector(v3, "green");
            break;
        // Divide
        case "div":
            v3 = v1.div(scal);
            drawVector(v3, "green");
            v3 = v2.div(scal);
            drawVector(v3, "green");
            break;
        // Angle Between
        case "angle":
            console.log("Angle: " + (angleBetween(v1, v2)).toFixed(2));
            break;
        // Area
        case "area":
            console.log("Area of this triangle: " + (areaTriangle(v1, v2)).toFixed(2));
            break;
        // Magnitude
        case "mag":
            console.log("Magnitude v1: " + v1.magnitude());
            console.log("Magnitude v2: " + v2.magnitude());
            break;
        // Normalize
        case "normal":
            var v3 = v1.normalize();
            drawVector(v3, "green");
            var v3 = v2.normalize();
            drawVector(v3, "green");
            break;
        default:
            break;
    }
}

function angleBetween(v1, v2) {
    // Compute the magnitudes of vectors v1 and v2.
    var m1 = v1.magnitude();
    var m2 = v2.magnitude();
    // Calculate the dot product of vectors v1 and v2.
    var d = Vector3.dot(v1, v2);

    // Compute the angle in radians between the two vectors.
    var alpha = Math.acos(d / (m1 * m2));

    // Convert the angle from radians to degrees.
    alpha *= 180 / Math.PI;

    return alpha;
}

function areaTriangle(v1, v2) {
    // Calculate the cross product of vectors v1 and v2.
    var a = Vector3.cross(v1, v2);
    // Construct a new vector from the elements of the cross product.
    var v3 = new Vector3([a.elements[0], a.elements[1], a.elements[2]]);

    // Get the area of the triangle.
    var area = v3.magnitude() / 2;
    return area;
}