// @ts-check

/**
 * @param {string} line
 */
function parseVertexLine(line) {
  return line
    .split(" ")
    .slice(1)
    .map((i) => parseFloat(i));
}

/**
 * @param {string} line
 * @returns {Face[]}
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

      return { v, vt: texture, vn: normal };
    });
}

/**
 * @typedef {{ x: number, y: number, z: number, w?: number }} Vertex
 * @typedef {{ u: number, v?: number, w?: number}} Texture
 * @typedef {{ i: number, j: number, k: number}} Normal
 * @typedef {{ v: number, vt?: number, vn?: number}} Face
 * @typedef {{vertices: Vertex[], normals: Normal[], textures: Texture[], faces: [Face, Face, Face][]}} ObjModel
 * @param {string} model
 * @returns {ObjModel}
 */
function parseObjModel(model) {
  /**
   * @type ObjModel
   */
  const result = {
    faces: [],
    vertices: [],
    normals: [],
    textures: [],
  };

  for (let line of model.split("\n")) {
    line = line.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("v ")) {
      const [x, y, z] = parseVertexLine(line);
      result.vertices.push({ x, y, z });
    } else if (line.startsWith("vt ")) {
      const [u, v, w] = parseVertexLine(line);
      result.textures.push({ u, v, w });
    } else if (line.startsWith("vn ")) {
      const [i, j, k] = parseVertexLine(line);
      result.normals.push({ i, j, k });
    } else if (line.startsWith("f ")) {
      const points = parseFacePoints(line);

      result.faces.push([points[0], points[1], points[2]]);

      if (points.length === 4) {
        result.faces.push([points[0], points[2], points[3]]);
      } else if (points.length > 4) {
        // TODO: Generalize to more points
        throw new Error("Cannot handle faces with more points than 4");
      }
    }
  }

  return result;
}

/**
 * @param {string} model
 * @typedef {{vertices: number[], normals: number[], textures: number[]}} Geometry
 * @returns {Geometry}
 */
export function parseObjGeometry(model) {
  const obj = parseObjModel(model);

  /** @type {Geometry} */
  const result = { vertices: [], normals: [], textures: [] };

  for (const triangle of obj.faces) {
    for (const point of triangle) {
      result.vertices.push(obj.vertices[point.v].x);
      result.vertices.push(obj.vertices[point.v].y);
      result.vertices.push(obj.vertices[point.v].z);

      if (typeof point.vn !== "undefined" && !isNaN(point.vn)) {
        result.normals.push(obj.normals[point.vn].i);
        result.normals.push(obj.normals[point.vn].j);
        result.normals.push(obj.normals[point.vn].k);
      }

      if (typeof point.vt !== "undefined" && !isNaN(point.vt)) {
        result.textures.push(obj.textures[point.vt].u);
        result.textures.push(obj.textures[point.vt].v || 0);
        result.textures.push(obj.textures[point.vt].w || 0);
      }
    }
  }

  return result;
}
