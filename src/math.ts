/**
 * Numeric helpers for reproducing the browser's animation values.
 */
import { InterpolationInputError } from "./errors.ts";

/**
 * Interpolates between two arrays of numbers, element by element.
 * @param fromList Starting values
 * @param toList Ending values
 * @param f Interpolation factor (0.0 to 1.0)
 * @returns Array of interpolated values
 * @throws {InterpolationInputError} If the arrays differ in length.
 */
export function interpolate(
  fromList: number[],
  toList: number[],
  f: number,
): number[] {
  if (fromList.length !== toList.length) {
    throw new InterpolationInputError(fromList.length, toList.length);
  }
  return fromList.map((from, i) => interpolateNum(from, toList[i], f));
}

/**
 * Interpolates between two values. Numbers are interpolated linearly;
 * booleans switch from `fromVal` to `toVal` halfway and yield 0 or 1.
 * @param fromVal Starting value
 * @param toVal Ending value
 * @param f Interpolation factor (0.0 to 1.0)
 * @returns The interpolated value, or 0 when the values differ in type
 */
export function interpolateNum(
  fromVal: number | boolean,
  toVal: number | boolean,
  f: number,
): number {
  if (typeof fromVal === "number" && typeof toVal === "number") {
    return fromVal * (1 - f) + toVal * f;
  }
  if (typeof fromVal === "boolean" && typeof toVal === "boolean") {
    return Number(f < 0.5 ? fromVal : toVal);
  }
  return 0;
}

/**
 * Converts a rotation angle in degrees to a 2D transformation matrix
 * @param rotation Angle in degrees
 * @returns Array of 4 values representing the transformation matrix [a, b, c, d]
 */
export function convertRotationToMatrix(rotation: number): number[] {
  const rad = (rotation * Math.PI) / 180;
  return [Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)];
}

/**
 * Converts a number to hexadecimal with uppercase digits. A zero integer
 * part is left empty (0.5 becomes ".8"), and the fraction is expanded
 * digit by digit until it is exhausted instead of being rounded.
 *
 * @param x Floating point number to convert
 * @returns Hexadecimal string representation of the number
 */
export function floatToHex(x: number): string {
  const integer = Math.floor(x);
  let fraction = x - integer;
  let result = integer > 0 ? integer.toString(16).toUpperCase() : "";

  if (fraction === 0) {
    return result;
  }

  result += ".";
  while (fraction > 0) {
    fraction *= 16;
    const digit = Math.floor(fraction);
    fraction -= digit;
    result += digit.toString(16).toUpperCase();
  }
  return result;
}

/**
 * Determines if a number is odd and returns a specific value
 *
 * @param num Number to check
 * @returns -1.0 if odd, 0.0 if even
 */
export function isOdd(num: number): number {
  return num % 2 ? -1.0 : 0.0;
}
