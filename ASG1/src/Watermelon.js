function renderWatermelon() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the background color to light blue
    gl.clearColor(0.8, 0.9, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Define vertices for the watermelon
    const vertices = [
        // Watermelon body (red part)
        -0.8, -0.2,
        0.8, -0.2,
        0.0, 0.6,
        // Watermelon skin (green part)
        -0.8, -0.2,
        -0.6, -0.4,
        0.6, -0.4,
        0.8, -0.2,
        // Watermelon seeds (black triangles)
        -0.4, 0.1,
        -0.35, 0.2,
        -0.3, 0.1,
        -0.1, -0.05,
        -0.05, 0.05,
        0.0, -0.05,
        0.2, 0.05,
        0.25, 0.15,
        0.3, 0.05,
        0.5, -0.1,
        0.55, 0.0,
        0.6, -0.1
    ];

    // Create a buffer for the vertices
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.error('Failed to create the buffer object');
        return;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Get the attribute location
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.error('Failed to get the storage location of a_Position');
        return;
    }

    // Assign the buffer object to the attribute variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Set colors
    let watermelonColor = [0.9, 0.2, 0.2, 1.0]; // Red
    let skinColor = [0.2, 0.7, 0.2, 1.0]; // Green
    let seedColor = [0.1, 0.1, 0.1, 1.0]; // Black

    // Draw the watermelon body (red part)
    gl.uniform4fv(u_FragColor, watermelonColor);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Draw the watermelon skin (green part)
    gl.uniform4fv(u_FragColor, skinColor);
    gl.drawArrays(gl.TRIANGLE_FAN, 3, 4);

    // Draw the watermelon seeds (black triangles)
    gl.uniform4fv(u_FragColor, seedColor);
    gl.drawArrays(gl.TRIANGLES, 7, 3);
    gl.drawArrays(gl.TRIANGLES, 10, 3);
    gl.drawArrays(gl.TRIANGLES, 13, 3);
    gl.drawArrays(gl.TRIANGLES, 16, 3);
}