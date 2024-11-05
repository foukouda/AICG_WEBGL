const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl2");
const errorBox = document.getElementById("error-box");
const timeDisplay = document.getElementById("time-display");
const fpsCounter = document.getElementById("fps-counter");

if (!gl) {
    showError("WebGL 2 is not available in your browser.");
} else {
    console.log("WebGL context initialized successfully.");
}

gl.enable(gl.DEPTH_TEST);
if (gl.getParameter(gl.DEPTH_TEST)) {
    console.log("Depth testing enabled successfully.");
} else {
    console.error("Failed to enable depth testing.");
}

let angle = 0.0;
const ANGLE_INCREMENT = 0.1;
const LIGHT_ROTATION_SPEED = 0.0005;

console.log("Rotation variables initialized.");

const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSource = `
precision highp float;
uniform float u_time;
uniform float u_angle;
const float lightDistance = 50.0; // Distance of the light from the city center

vec3 getLightDirection() {
    float lightAngle = u_time; // Use u_time for rotating the light
    return normalize(vec3(lightDistance * cos(lightAngle), 30.0, lightDistance * sin(lightAngle)));
}

vec3 getColor(int x, int z) {
    float r = 0.4 + 0.6 * fract(sin(float(x) * 12.9898 + float(z) * 78.233) * 43758.5453);
    float g = 0.4 + 0.6 * fract(sin(float(x) * 24.1987 + float(z) * 56.789) * 12345.6789);
    float b = 0.4 + 0.6 * fract(sin(float(x) * 34.789 + float(z) * 23.456) * 98765.4321);
    return vec3(r, g, b);
}

float boxSDF(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float pyramidSDF(vec3 p, float h) {
    vec3 q = abs(p);
    return max(q.z, q.x + q.y * 0.5 - h);
}

float unionSDF(float d1, float d2) {
    return min(d1, d2);
}

float softShadow(vec3 ro, vec3 rd) {
    float res = 1.0;
    float t = 0.1;
    for (int i = 0; i < 50; i++) {
        float h = boxSDF(ro + rd * t, vec3(0.5)); // Sample shadow SDF
        res = min(res, 10.0 * h / t);
        if (res < 0.001) break;
        t += h;
    }
    return clamp(res, 0.0, 1.0);
}

float ambientOcclusion(vec3 p, vec3 n) {
    float ao = 0.0;
    float sca = 1.0;
    for (int i = 0; i < 5; i++) {
        float h = 0.02 + 0.1 * float(i);
        float d = boxSDF(p + n * h, vec3(0.5));
        ao += (h - d) * sca;
        sca *= 0.75;
    }
    return clamp(1.0 - ao, 0.0, 1.0);
}

float sceneSDF(vec3 p, out vec3 color) {
    float distance = 100.0;
    color = vec3(0.0);

    for (int x = -5; x <= 5; x++) {
        for (int z = -5; z <= 5; z++) {
            float height = 1.0 + mod(float(x * z), 3.0); 
            vec3 buildingPos = vec3(float(x) * 3.0, height / 2.0, float(z) * 3.0);
            vec3 buildingSize = vec3(1.0, height, 1.0);
            float buildingDist = boxSDF(p - buildingPos, buildingSize);

            if (mod(float(x + z), 2.0) < 1.0) { 
                vec3 pyramidPos = buildingPos + vec3(0.0, height, 0.0); 
                float pyramidDist = pyramidSDF(p - pyramidPos, height / 2.0);
                buildingDist = unionSDF(buildingDist, pyramidDist); 
            }

            if (buildingDist < distance) {
                distance = buildingDist;
                color = getColor(x, z) * (0.8 + 0.2 * sin(u_time + float(x + z) * 0.3));
            }
        }
    }

    distance = min(distance, p.y + 0.5 + 0.02 * sin(p.x * 2.0) * sin(p.z * 2.0));
    return distance;
}

vec3 getNormal(vec3 p) {
    vec3 dummyColor;
    float d = sceneSDF(p, dummyColor);
    vec2 e = vec2(0.001, 0.0);
    return normalize(d - vec3(
        sceneSDF(p - e.xyy, dummyColor),
        sceneSDF(p - e.yxy, dummyColor),
        sceneSDF(p - e.yyx, dummyColor)
    ));
}

float rayMarch(vec3 ro, vec3 rd, out vec3 color) {
    float totalDistance = 0.0;
    const int maxSteps = 128;
    const float minHitDistance = 0.001;

    for (int i = 0; i < maxSteps; i++) {
        vec3 pos = ro + rd * totalDistance;
        float dS = sceneSDF(pos, color);
        if (dS < minHitDistance) return totalDistance;
        totalDistance += dS;
        if (totalDistance > 100.0) break;
    }
    color = vec3(0.0);
    return -1.0;
}
c
void main() {
    vec2 uv = (gl_FragCoord.xy / vec2(800.0, 600.0)) * 2.0 - 1.0;

    vec3 ro = vec3(50.0 * sin(u_angle), 30.0, 50.0 * cos(u_angle));
    vec3 rd = normalize(vec3(uv, -1.0));

    vec3 color;
    float dist = rayMarch(ro, rd, color);
    if (dist > 0.0) {
        vec3 p = ro + rd * dist;
        vec3 normal = getNormal(p);

        vec3 lightDir = getLightDirection();

        float ao = ambientOcclusion(p, normal);
        float shadow = softShadow(p + normal * 0.001, lightDir);
        float diff = max(dot(normal, lightDir), 0.2) * shadow;
        gl_FragColor = vec4(color * diff * ao, 1.0);
    } else {
        gl_FragColor = vec4(0.1, 0.1, 0.15, 1.0);
    }
}
`;

console.log("Shader source code defined.");

function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        showError(`Shader compilation error (${type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'}): ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }
    console.log(`${type === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} shader compiled successfully.`);
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        showError("Program linking error: " + gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    console.log("Shader program linked successfully.");
    return program;
}

const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
const program = createProgram(gl, vertexShader, fragmentShader);

if (!program) {
    showError("Failed to initialize the shader program.");
} else {
    console.log("Shader program initialized and ready.");
}

gl.useProgram(program);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
console.log("Position buffer set up for a full-screen quad.");

const aPosition = gl.getAttribLocation(program, "a_position");
if (aPosition === -1) {
    console.error("Failed to get the attribute location for a_position.");
} else {
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    console.log("Position buffer linked to a_position attribute.");
}

const uTime = gl.getUniformLocation(program, "u_time");
const uAngle = gl.getUniformLocation(program, "u_angle");
console.log("Uniform locations obtained for u_time and u_angle.");

let lastFrameTime = 0;

function render(time) {
    const delta = time - lastFrameTime;
    const fps = 1000 / delta;
    lastFrameTime = time;
    fpsCounter.textContent = `FPS: ${fps.toFixed(1)}`;

    const lightAngle = (time * LIGHT_ROTATION_SPEED) % (2 * Math.PI); 
    const hourIn24 = (lightAngle / (2 * Math.PI)) * 24;
    const displayHours = Math.floor(hourIn24);
    const displayMinutes = Math.floor((hourIn24 - displayHours) * 60);
    timeDisplay.textContent = `Time: ${displayHours}:${displayMinutes.toString().padStart(2, '0')}`;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(uTime, time * LIGHT_ROTATION_SPEED);
    gl.uniform1f(uAngle, angle);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    console.log("New frame rendered.");

    requestAnimationFrame(render);
}

function showError(message) {
    console.error(message);
    const errorParagraph = document.createElement('p');
    errorParagraph.innerText = message;
    errorBox.appendChild(errorParagraph);
}

document.getElementById("rotate-left").addEventListener("click", () => {
    angle -= ANGLE_INCREMENT;
    console.log("Rotated left, angle:", angle);
});

document.getElementById("rotate-right").addEventListener("click", () => {
    angle += ANGLE_INCREMENT;
    console.log("Rotated right, angle:", angle);
});

console.log("Starting render loop.");
requestAnimationFrame(render);
