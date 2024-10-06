/**affiche l'erreure dans notre petit boite text area */
function showError(errorText){
    const errorBoxDiv = document.getElementById('error-box');
    const errorTextElement = document.createElement('p');
    errorTextElement.innerText = errorText;
    errorBoxDiv.appendChild(errorTextElement);
    console.log(errorText);
}


function hello_triangle(){
    /** juste pour dire a l'editeur que c'est la que ca ce passe */
    /** @type {HTMLCanvasElement|null} */ 
    const canvas = document.getElementById('canvas');
    if (!canvas){
        showError('Cannot get demo-canvas reference - check typo or loading script is too early in html')
        return;
    }
    const gl = canvas.getContext('webgl2');
    if(!gl){
        const isWebGl1Supported = !!canvas.getContext('webgl');
        if(isWebGl1Supported){
            showError('this browser support webgl 1 but not webgl 2 -make sure webgl2 isnt disableb in your browser');
        } else {
            showError('this browser does not support webgl - this demo will not work !');
        }
        return; 
    }

    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const Triangle_Vertices = [
        //top middle
        0.0, 0.5,
        // Bottom left
        -0.5, -0.5,
        // Bottom right
        0.5, -0.5
    ];
    /** JS a tendance a mettre les array en 64bit nous il nous faut du 32 pour que le GPU soit content est pas perdre des données */
    const triangleVerticesCpuBuffer = new Float32Array(Triangle_Vertices);

    const triangleGeoBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVerticesCpuBuffer, gl.STATIC_DRAW);

    /**magie noir du gpu  */
    const vertexShaderSourceCode = `#version 300 es
    precision mediump float;

    in vec2 vertexPosition;

    void main() {
        gl_Position = vec4(vertexPosition, 0.0, 1.0);
    }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSourceCode);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        const compileError = gl.getShaderInfoLog(vertexShader);
        showError(`Failed to COMPILE vertex shader - ${compileError}`);
        return;
    }

    const fragmentShaderSourceCode = `#version 300 es
    precision mediump float;

    out vec4 outputColor;

    void main(){
        outputColor = vec4(0.294, 0.0, 0.51, 1.0);
    }`;

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        const compileError = gl.getShaderInfoLog(fragmentShader);
        showError(`Failed to COMPILE fragment shader - ${compileError}`);
        return;
    }

    const triangleShaderProgram = gl.createProgram();
    gl.attachShader(triangleShaderProgram, vertexShader);
    gl.attachShader(triangleShaderProgram,fragmentShader);
    gl.linkProgram(triangleShaderProgram);
    if (!gl.getProgramParameter(triangleShaderProgram, gl.LINK_STATUS)){
        const compileError = gl.getProgramInfoLog(triangleShaderProgram);
        showError(`Failed to COMPILE link program - ${linkError}`);
        return;
    }

    const vertexPositionAttriblocation = gl.getAttribLocation(triangleShaderProgram, 'vertexPosition');
    if (vertexPositionAttriblocation < 0) {
        showError('failed to get attrib location for vertexPosition');
        return;
    }

    // output merger
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rasterizer - which pixels are part of a triangle 
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set GPU program
    gl.useProgram(triangleShaderProgram);
    gl.enableVertexAttribArray(vertexPositionAttriblocation);

    // Input assembler 
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
    gl.vertexAttribPointer(
        /* index: which attribute to use */ 
        vertexPositionAttriblocation,
        /* size: how many components in that attribute */
        2,
        /* type: what is the data type stored in the gpu buffer for this attribute ?*/
        gl.FLOAT,
        /* normalized: determines how to convert ints to floats, if that's what you're doing */
        false,
        /* stride: how many bytes to move forward in the buffer to find the same attribute for the next vertex */
        0,
        /* offset: how many bytes should the input assembler skip into the buffer when reading attributes */
        0
    );

    // draw call
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

try {
    hello_triangle();
} catch (e) {
    showError(`uncaught JavaScripte excetpion: ${e}`);
}