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
 * @param {string} model
 * @typedef {{indexes: number[], vertices: number[]}} Geometry
 * @returns {Geometry}
 */
export function parseObjGeometry(model) {
  const vertices = [];
  const textures = [];
  const normals = [];
  const indexes = [];

  for (let line of model.split("\n")) {
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
    indexes,
    vertices,
  };
}
