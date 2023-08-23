import test from "node:test";
import assert from "node:assert";
import { parseObjGeometry } from "./obj-loader.mjs";

test("should parse empty obj file", () => {
  const result = parseObjGeometry("");

  assert.deepEqual(result, {
    normals: [],
    vertices: [],
  });
});

test("should parse vertices from obj file", () => {
  const content = `
v 0.0 0.0 0.0
v 0.0 0.0 1.0
v 0.0 1.0 1.0
f 1 2 3
`;

  const result = parseObjGeometry(content);

  assert.deepEqual(result.vertices, [0, 0, 0, 0, 0, 1, 0, 1, 1]);
});

test("should parse normals from obj file", () => {
  const content = `
v 0.0 0.0 0.0
v 0.0 0.0 1.0
v 0.0 1.0 1.0
vn 0.1 1.0 1.0
vn 0.2 1.0 1.0
vn 0.3 1.0 1.0
f 1//3 2//2 3//1
`;

  const result = parseObjGeometry(content);

  assert.deepEqual(result.normals, [0.3, 1, 1, 0.2, 1, 1, 0.1, 1, 1]);
});

test("should parse faces as triangles from obj file", () => {
  const content = `
v 0.0 0.0 0.0
v 0.0 0.0 1.0
v 0.0 1.0 0.0
v 0.0 1.0 1.0
f 1 2 3 4
`;

  const result = parseObjGeometry(content);

  assert.deepEqual(
    result.vertices,
    [
      [0, 0, 0],
      [0, 0, 1],
      [0, 1, 0],
      [0, 0, 0],
      [0, 1, 0],
      [0, 1, 1],
    ].flat()
  );
});

test("should not crash on single line comments", () => {
  const content = `
# Hallo1
v 0.0 0.0 0.0
v 0.0 0.0 1.0
v 0.0 1.0 0.0
v 0.0 1.0 1.0
# Hallo2
f 1 2 3 4
`;

  parseObjGeometry(content);
});

test("should parse vertex normals from obj file", () => {
  const cube = `
v 0.0 0.0 0.0
v 0.0 0.0 1.0
v 0.0 1.0 0.0
v 0.0 1.0 1.0
v 1.0 0.0 0.0
v 1.0 0.0 1.0
v 1.0 1.0 0.0
v 1.0 1.0 1.0
vn 0.0 0.0 1.0
vn 0.0 0.0 -1.0
vn 0.0 1.0 0.0
vn 0.0 -1.0 0.0
vn 1.0 0.0 0.0
vn -1.0 0.0 0.0
f 1//2 7//2 5//2
f 1//2 3//2 7//2
f 1//6 4//6 3//6
f 1//6 2//6 4//6
f 3//3 8//3 7//3
f 3//3 4//3 8//3
f 5//5 7//5 8//5
f 5//5 8//5 6//5
f 1//4 5//4 6//4
f 1//4 6//4 2//4
f 2//1 6//1 8//1
f 2//1 8//1 4//1
`;

  const result = parseObjGeometry(cube);

  assert.deepEqual(
    // Only verifying the first bunch
    result.normals.slice(0, 21),
    [
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
      [0, 0, -1],
      [-1, 0, 0],
    ].flat()
  );
});
