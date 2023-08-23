// @ts-check

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
  return line
    .split(" ")
    .slice(1)
    .map((part) => {
      const [v, texture = NaN, normal = NaN] = part.split("/").map((i) => {
        // -1 for conversion to zero-based index
        return parseInt(i) - 1;
      });

      return [v, texture, normal];
    });
}

/**
 * @param {string} model
 * @typedef {{vertices: number[], normals: number[]}} Geometry
 * @returns {Geometry}
 */
export function parseObjGeometry(model) {
  /**
   * @type Array<Array<number>>
   */
  const vertices = [];
  const textures = [];
  const normals = [];

  /**
   * @type Array<Array<Array<number>>>
   */
  const faces = [];

  for (let line of model.split("\n")) {
    line = line.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("v ")) {
      vertices.push(parseVertexLine(line));
    } else if (line.startsWith("vt ")) {
      textures.push(parseVertexLine(line));
    } else if (line.startsWith("vn ")) {
      normals.push(parseVertexLine(line));
    } else if (line.startsWith("f ")) {
      const points = parseFacePoints(line);

      faces.push([points[0], points[1], points[2]]);

      if (points.length === 4) {
        faces.push([points[0], points[2], points[3]]);
      } else if (points.length > 4) {
        // TODO: Generalize to more points
        throw new Error("Cannot handle faces with more points than 4");
      }
    }
  }

  /** @type {Geometry} */
  const result = { vertices: [], normals: [] };

  for (const face of faces) {
    result.vertices.push(...vertices[face[0][0]]);
    result.vertices.push(...vertices[face[1][0]]);
    result.vertices.push(...vertices[face[2][0]]);

    if (!isNaN(face[0][2])) {
      result.normals.push(...normals[face[0][2]]);
      result.normals.push(...normals[face[1][2]]);
      result.normals.push(...normals[face[2][2]]);
    }
  }

  return result;
}
