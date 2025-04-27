/**
 * Rotation utility functions
 *
 * This module provides functions for converting rotation values to matrices,
 * used in the animation key generation process.
 */

/**
 * Converts a rotation angle in degrees to a 2D transformation matrix
 * @param rotation Angle in degrees
 * @returns Array of 4 values representing the transformation matrix [a, b, c, d]
 */
function convertRotationToMatrix(rotation: number): number[] {
  const rad = (rotation * Math.PI) / 180;
  return [Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)];
}

/**
 * Alternative implementation for converting rotation to matrix
 * Note: This implementation returns a 6-value matrix in the format [a, b, c, d, tx, ty]
 * @param degrees Angle in degrees
 * @returns Array of 6 values representing the transformation matrix
 * @private
 */
function convertRotationToMatrix2(degrees: number): number[] {
  // Convert degrees to radians
  const radians = (degrees * Math.PI) / 180;

  // Create matrix:
  // [cos(r), -sin(r), 0]
  // [sin(r), cos(r), 0]
  //
  // Order:
  // [cos(r), sin(r), -sin(r), cos(r), 0, 0]

  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [cos, sin, -sin, cos, 0, 0];
}

export { convertRotationToMatrix };
