# 3D WebGL Scene with Time Counter, FPS Counter, and Error Box

A WebGL-based project that creates an interactive 3D scene with elements like FPS and time counters. Users can rotate the view and observe dynamic changes within the scene.

## Features

- **3D Scene Rendering**: Built using WebGL2 for high-performance 3D graphics.
- **FPS Counter**: Displays frames per second to monitor performance.
- **Time Display**: Shows a rotating 24-hour cycle based on light angle.
- **Error Handling**: Captures and displays error messages in an error box.
- **Rotation Controls**: Buttons for rotating the scene view left and right.

## Project Structure

- **index.html**: The HTML structure with a canvas for WebGL rendering, FPS and time counters, and error box.
- **script.js**: JavaScript logic for WebGL scene setup, shader management, time and FPS calculations, rotation controls, and error handling.
- **styles.css**: CSS for styling the layout, buttons, counters, error box, and canvas.

## Getting Started

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/username/3d-webgl-scene.git
    cd 3d-webgl-scene
    ```

2. **Open `index.html` in a Browser**: Ensure WebGL2 is supported.

## Usage

- **Rotate Scene**: Use the "Rotate Left" and "Rotate Right" buttons to change the camera angle.
- **FPS Monitoring**: Check the FPS counter on the top-left to gauge rendering performance.
- **Time Simulation**: The time counter displays a simulated 24-hour cycle based on light rotation.

## Project Details

### WebGL Components

- **Shaders**:
  - Vertex and Fragment Shaders handle 3D transformations, lighting, and scene composition.
- **Scene Objects**:
  - Scene includes 3D boxes and pyramids simulating buildings, with ambient lighting and shadow effects.
- **Dynamic Lighting**:
  - Light source rotates, simulating a day/night cycle, creating an evolving light and shadow environment.

### Error Handling

Error messages appear in an error box at the bottom if WebGL is unsupported or other issues arise during rendering.

## Styling

- Layout is optimized for display on both desktop and mobile, with an error box for user notifications.
- Custom color scheme:
  - FPS Counter: Cyan
  - Time Display: Yellow
  - Error Box: Red

## License

This project is licensed under the MIT License.
