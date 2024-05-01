# CSE160 Assignment 1

### Description
This project provides a simple web application for drawing various shapes on a canvas using WebGL. It includes functionality for drawing points, triangles, and circles with customizable colors and sizes. The application also allows users to adjust the number of segments in a circle and clear the canvas.

Additionally, the project includes a feature to draw a watermelon using triangles and a button to show/hide a watermelon image.

### Setup
To run this project locally:

Ensure that the following files are in the correct directories:
- *lib* folder: **cuon-utils.js**, **webgl-debug.js**, **webgl-utils.js**
- *src* folder: **asg1.html**, **asg1.js**, **Circle.js**, **Point.js**, **Triangle.js**, **Watermelon.js**, **watermelon.png**

Open **asg1.html** from the *src* folder in a web browser to start the application.

### Usage
1. Select the shape you want to draw (point, triangle, or circle) using the provided buttons.
2. Choose the color of the shape using the color picker or the predefined color buttons.
3. Adjust the size of the shape using the size slider.
4. For circles, you can also adjust the number of segments using the segments slider.
5. Click on the canvas to draw the selected shape at the clicked position.
6. Use the **Clear** button to clear the canvas.
7. Click the **Draw Watermelon** button to draw a watermelon using triangles.
8. Use the **Show Watermelon Image** and **Hide Watermelon Image** buttons to display or hide an image of a watermelon.

### Files
- **asg1.html**: The main HTML file that structures the web application and includes the necessary JavaScript files.
- **asg1.js**: The main JavaScript file that sets up the WebGL context, handles user interactions, and manages the rendering of shapes.
- **Point.js**: Defines the `Point` class for rendering points on the canvas.
- **Triangle.js**: Defines the `Triangle` class for rendering triangles on the canvas.
- **Circle.js**: Defines the `Circle` class for rendering circles on the canvas.
- **Watermelon.js**: Defines the `renderWatermelon` function for drawing a watermelon using triangles.

### Notes to Grader
The awesome points I am trying to do are I add Show Watermelon Image button and Hide Watermelon Image button.