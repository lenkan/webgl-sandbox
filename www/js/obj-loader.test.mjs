import test from "node:test";
import assert from "node:assert";
import { parseObjGeometry } from "./obj-loader.mjs";

test("should parse empty obj file", () => {
  const result = parseObjGeometry("");

  assert.deepEqual(result, {
    indexes: [],
    vertices: [],
  });
});

test("should parse vertices from obj file", () => {
  const content = `
v 0.0 0.0 0.0
v 0.0 0.0 1.0
`;

  const result = parseObjGeometry(content);

  assert.deepEqual(result.vertices, [0, 0, 0, 0, 0, 1]);
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

  assert.deepEqual(result.indexes, [0, 1, 2, 0, 2, 3]);
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
