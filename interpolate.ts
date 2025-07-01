/**
 * Interpolation utility functions
 *
 * This module provides functions for interpolating between values,
 * used in the animation key generation process.
 */

/**
 * Interpolates between two arrays of numbers
 * @param fromList Starting values
 * @param toList Ending values
 * @param f Interpolation factor (0.0 to 1.0)
 * @returns Array of interpolated values
 */
function interpolate(
  fromList: number[],
  toList: number[],
  f: number,
): number[] {
  if (fromList.length !== toList.length) {
    throw new Error(
      `Mismatched interpolation arguments ${fromList}: ${toList}`,
    );
  }
  const out: number[] = [];
  for (let i = 0; i < fromList.length; i++) {
    out.push(interpolateNum(fromList[i], toList[i], f));
  }
  return out;
}

/**
 * Interpolates between two values (numeric or boolean)
 * @param fromVal Starting value
 * @param toVal Ending value
 * @param f Interpolation factor (0.0 to 1.0)
 * @returns Interpolated value
 */
function interpolateNum(
  fromVal: number | boolean,
  toVal: number | boolean,
  f: number,
): number {
  if (typeof fromVal === "number" && typeof toVal === "number") {
    return fromVal * (1 - f) + toVal * f;
  }

  if (typeof fromVal === "boolean" && typeof toVal === "boolean") {
    return f < 0.5 ? (fromVal ? 1 : 0) : toVal ? 1 : 0;
  }

  return 0;
}

export { interpolate, interpolateNum };
