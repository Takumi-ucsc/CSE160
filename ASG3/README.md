# CSE160 Assignment 3

## Overview
This project presents an interactive 3D maze game where a parent penguin must find and reunite with its baby penguin. The game is created using WebGL and allows users to navigate through a maze and interact with the penguins using keyboard controls.

## Features
- **3D Maze Environment:** The maze is generated using cubes and can be navigated using keyboard controls.
- **Penguin Models:**
  - **Parent Penguin:** Located at a fixed position, waiting to reunite with its baby.
  - **Baby Penguin:** Initially placed at a different location in the maze.
- **Interactive Controls:**
  - **Movement:** Use W, A, S, D keys to move forward, left, backward, and right, respectively.
  - **Camera Control:** The camera can be panned using Q and E keys.
  - **Space Key Interaction:** Pressing the space key near the baby penguin triggers an alert indicating the baby is found. Pressing the space key near the parent penguin after finding the baby penguin triggers a reunion alert.
- **Textures:** Various textures applied to the maze walls and floor for a visually appealing environment.

## Instructions (Notes to the grader)
1. **Start the Game:**
   - Open `World.html` in a web browser to start the game.
2. **Navigate the Maze:**
   - Use W, A, S, D keys to navigate through the maze.
   - Use Q and E keys to pan the camera left and right.
   - Click and move mouse to the rotate the camera.
   - Use the "Add block" button to place a dirt block at the current camera position.
   - Use the "Remove block" button to remove a block at the current camera position.
3. **Find the Baby Penguin:**
   - Move close to the baby penguin and press the space key. An alert will notify you that the baby penguin is found and the baby should be disappeared. You can see the distance from you to the baby on console.
4. **Reunite with the Parent Penguin:**
   - After finding the baby penguin, navigate to the parent penguin and press the space key to trigger the reunion alert.
