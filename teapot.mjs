"use strict";

/**
 * @param {string} line
 */
function parseVertexLine(line) {
  return line
    .split(" ")
    .slice(1, 4)
    .map((i) => parseFloat(i));
}

/**
 * @param {string} line
 * @returns {number[][]}
 */
function parseFacePoints(line) {
  const points = line
    .split(" ")
    .slice(1)
    .map((part) =>
      part.split("/").map((i) => {
        // -1 for conversion to zero-based index
        return parseInt(i) - 1;
      })
    );

  return points;
}

/**
 * @typedef {{indexes: Uint16Array, vertices: Float32Array}} Geometry
 * @returns {Promise<Geometry>}
 */
async function loadTeapotGeometry() {
  const model = new URL(window.location.href).searchParams.get("model") || "teapot";

  const teapotResponse = await fetch(`/${model}.obj`);
  const teapotText = await teapotResponse.text();

  const vertices = [];
  const textures = [];
  const normals = [];
  const indexes = [];

  for (let line of teapotText.split("\n")) {
    line = line.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("v ")) {
      vertices.push(...parseVertexLine(line));
    } else if (line.startsWith("vt ")) {
      textures.push(...parseVertexLine(line));
    } else if (line.startsWith("vn ")) {
      normals.push(...parseVertexLine(line));
    } else if (line.startsWith("f ")) {
      const points = parseFacePoints(line);

      indexes.push(points[0][0], points[1][0], points[2][0]);

      if (points.length === 4) {
        indexes.push(points[0][0], points[2][0], points[3][0]);
      } else if (points.length > 4) {
        // TODO: Generalize to more points
        throw new Error("Cannot handle faces with more points than 4");
      }
    }
  }

  return {
    indexes: new Uint16Array(indexes),
    vertices: new Float32Array(vertices),
  };
}

const vertexShaderSource = `
attribute vec3 position;
uniform mat4 modelViewMatrix;

void main() {
  gl_Position = modelViewMatrix * vec4(position, 1);
}
`;

const fragmentShaderSource = `
precision mediump float;

void main() {
  gl_FragColor = vec4(1, 0, 0, 1);
}
`;

/**
 * Sets up a shader program that renders a red object.
 * @param {WebGLRenderingContext} context
 * @returns {WebGLProgram}
 */
function setupShaderProgram(context) {
  const vertexShader = context.createShader(context.VERTEX_SHADER);
  const fragmentShader = context.createShader(context.FRAGMENT_SHADER);

  context.shaderSource(vertexShader, vertexShaderSource);
  context.shaderSource(fragmentShader, fragmentShaderSource);

  context.compileShader(vertexShader);
  context.compileShader(fragmentShader);

  const program = context.createProgram();
  context.attachShader(program, vertexShader);
  context.attachShader(program, fragmentShader);
  context.linkProgram(program);

  return program;
}

async function renderTeapot() {
  const canvas = document.getElementById("canvas");
  /** @type {WebGLRenderingContext} */
  const context = canvas.getContext("webgl");

  const teapotGeometry = await loadTeapotGeometry();

  const index = context.createBuffer();
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, index);
  context.bufferData(context.ELEMENT_ARRAY_BUFFER, teapotGeometry.indexes, context.STATIC_DRAW);

  const position = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, position);
  context.bufferData(context.ARRAY_BUFFER, teapotGeometry.vertices, context.STATIC_DRAW);
  console.log(teapotGeometry);

  // Use the red shader program
  const program = setupShaderProgram(context);
  context.useProgram(program);

  // Bind position to it shader attribute
  const positionLocation = context.getAttribLocation(program, "position");
  context.enableVertexAttribArray(positionLocation);
  context.vertexAttribPointer(positionLocation, 3, context.FLOAT, false, 0, 0);

  const firstFrame = performance.now();

  const renderLoop = () => {
    const delta = performance.now() - firstFrame;

    const modelViewMatrixLocation = context.getUniformLocation(program, "modelViewMatrix");
    const rotation = ((delta % 10000) / 10000) * Math.PI * 2;
    context.uniformMatrix4fv(
      modelViewMatrixLocation,
      false,
      new Float32Array([
        Math.cos(rotation),
        0,
        Math.sin(rotation),
        0,
        0,
        1,
        0,
        0,
        -Math.sin(rotation),
        0,
        Math.cos(rotation),
        0,
        0,
        0,
        0,
        4,
      ])
    );

    context.drawElements(context.TRIANGLES, teapotGeometry.indexes.length, context.UNSIGNED_SHORT, 0);
    context.flush();

    requestAnimationFrame(renderLoop);
  };

  requestAnimationFrame(renderLoop);
}

renderTeapot();
