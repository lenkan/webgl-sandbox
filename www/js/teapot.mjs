"use strict";
import { parseObjGeometry } from "./obj-loader.mjs";

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal;

uniform mat4 modelViewMatrix;

varying vec3 v_normal;

void main() {
  gl_Position = modelViewMatrix * vec4(position, 1);
  v_normal = mat3(modelViewMatrix) * normal;
}
`;

const fragmentShaderSource = `
precision mediump float;

varying vec3 v_normal;

void main () {
  float light = dot(vec3(1, -1, 0), normalize(v_normal)) * 0.5 + 0.5;
  gl_FragColor = vec4(vec3(1, 0, 0) * light, 1);
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
  const model = new URL(window.location.href).searchParams.get("model") || "teapot";

  const teapotResponse = await fetch(`/models/${model}.obj`);
  const teapotText = await teapotResponse.text();

  const canvas = document.getElementById("canvas");
  /** @type {WebGLRenderingContext} */
  const context = canvas.getContext("webgl");

  const teapotGeometry = parseObjGeometry(teapotText);

  const program = setupShaderProgram(context);
  context.useProgram(program);

  const position = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, position);
  context.bufferData(context.ARRAY_BUFFER, new Float32Array(teapotGeometry.vertices), context.STATIC_DRAW);

  const positionLocation = context.getAttribLocation(program, "position");
  context.enableVertexAttribArray(positionLocation);
  context.vertexAttribPointer(positionLocation, 3, context.FLOAT, false, 0, 0);

  const normals = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, normals);
  context.bufferData(context.ARRAY_BUFFER, new Float32Array(teapotGeometry.normals), context.STATIC_DRAW);

  const normalLocation = context.getAttribLocation(program, "normal");
  context.enableVertexAttribArray(normalLocation);
  context.vertexAttribPointer(normalLocation, 3, context.FLOAT, false, 0, 0);

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

    context.drawArrays(context.TRIANGLES, 0, teapotGeometry.vertices.length);
    context.flush();

    requestAnimationFrame(renderLoop);
  };

  requestAnimationFrame(renderLoop);
}

renderTeapot();
