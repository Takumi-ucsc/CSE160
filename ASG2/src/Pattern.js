class Pattern{ 
    // Constructor
    constructor(){
        this.type = 'pattern';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        }
        
    render(){
        var rgba = this.color;
        
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front
        drawTriangle3D( [0,0,0, .5,1,0, 1,0,0]);

        //Back
        drawTriangle3D( [0,0,1, .5,1,1, 1,0,1]);

        // Make next sides different color
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        //Bottom
        drawTriangle3D( [0,0,0, 0,0,1, 1,0,0]);
        drawTriangle3D( [1,0,0, 1,0,1, 0,0,1]);
    

        // Make next sides different color
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        // Left
        drawTriangle3D( [0,0,1, .5,1,0, 0,0,0]);
        drawTriangle3D( [0,0,1, .5,1,1, .5,1,0]);

        // Right
        drawTriangle3D( [1,0,0, .5,1,1, 1,0,1]);
        drawTriangle3D( [1,0,0, .5,1,0, .5,1,1]);

    }
}