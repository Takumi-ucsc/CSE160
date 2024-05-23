class Cube {
    // Constructor
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color: white
        this.matrix = new Matrix4(); // Default: identity matrix
        this.textureNum = -2; // No texture
    }

    render() {
        var rgba = this.color;

        // Pass the texture number 
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw each face of the cube
        // Front
        drawTriangle3DUVNormal( [0,0,0,  1,1,0,  1,0,0], [0,0,  1,1,  1,0], [0,0,-1,  0,0,-1,  0,0,-1] );
        drawTriangle3DUVNormal( [0,0,0,  0,1,0,  1,1,0], [0,0,  0,1,  1,1], [0,0,-1,  0,0,-1,  0,0,-1] );

        // Lighting
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

        // Top
        drawTriangle3DUVNormal( [0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], [0,1,0,  0,1,0,  0,1,0] );
        drawTriangle3DUVNormal( [0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0], [0,1,0,  0,1,0,  0,1,0] );

        // Lighting
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);

        // Right
        drawTriangle3DUVNormal( [1,1,0, 1,1,1, 1,0,0], [0,0, 0,1, 1,1], [1,0,0,  1,0,0,  1,0,0] );
        drawTriangle3DUVNormal( [1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], [1,0,0,  1,0,0,  1,0,0] );

        // Lighting
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);

        // Back
        drawTriangle3DUVNormal( [0,0,1, 1,1,1, 1,0,1], [0,0, 0,1, 1,1], [0,0,1,  0,0,1,  0,0,1] );
        drawTriangle3DUVNormal( [0,0,1, 0,1,1, 1,1,1], [0,0, 1,1, 1,0], [0,0,1,  0,0,1,  0,0,1] );

        // Lighting
        gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);

        // Left
        drawTriangle3DUVNormal( [0,1,0, 0,1,1, 0,0,0], [0,0, 0,1, 1,1], [-1,0,0,  -1,0,0,  -1,0,0] );
        drawTriangle3DUVNormal( [0,0,0, 0,1,1, 0,0,1], [0,0, 1,1, 1,0], [-1,0,0,  -1,0,0,  -1,0,0] );

        // Lighting
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

        // Bottom
        drawTriangle3DUVNormal( [0,0,0, 0,0,1, 1,0,1], [0,0, 0,1, 1,1], [0,-1,0,  0,-1,0,  0,-1,0] );
        drawTriangle3DUVNormal( [0,0,0, 1,0,1, 1,0,0], [0,0, 1,1, 1,0], [0,-1,0,  0,-1,0,  0,-1,0] );
    }
}