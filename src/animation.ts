/**
 * Derivation of the animation key: the colour and transform of X's
 * loading animation at a point in time chosen by the verification key, as
 * X's script reads them back from the browser.
 */
import { Cubic } from "./cubic.ts";
import { AnimationFrameDataError } from "./errors.ts";
import {
  convertRotationToMatrix,
  floatToHex,
  interpolate,
  interpolateNum,
  isOdd,
} from "./math.ts";

// Length of the timeline the frame time is a point on
const TOTAL_TIME = 4096;

/** Positions of the verification key bytes that parameterise the animation. */
export interface KeyByteIndices {
  /** Index of the key byte that selects the frame row */
  rowIndex: number;
  /** Indices of the key bytes whose product sets the frame time */
  keyBytesIndices: number[];
}

/**
 * Computes the animation key for a verification key.
 * @param keyBytes Decoded verification key
 * @param indices Key byte indices from the ondemand.s chunk
 * @param frameRows Frame rows of the animation the key selects
 * @throws {AnimationFrameDataError} If the selected frame row is missing.
 */
export function getAnimationKey(
  keyBytes: number[],
  indices: KeyByteIndices,
  frameRows: number[][],
): string {
  const rowIndex = keyBytes[indices.rowIndex] % 16;
  const frameRow = frameRows[rowIndex];
  if (!frameRow) {
    throw new AnimationFrameDataError(rowIndex);
  }

  const frameTime = indices.keyBytesIndices.reduce(
    (time, index) => time * (keyBytes[index] % 16),
    1,
  );
  return animate(frameRow, (Math.round(frameTime / 10) * 10) / TOTAL_TIME);
}

/**
 * Evaluates a frame row's animation at `targetTime` and serialises the
 * colour and rotation matrix the way X's script does.
 * @param frameRow Start colour (3), end colour (3), rotation, then the
 *                 easing curve's control points
 * @param targetTime Normalised time to evaluate the animation at
 */
function animate(frameRow: number[], targetTime: number): string {
  const fromColor = frameRow.slice(0, 3);
  const toColor = frameRow.slice(3, 6);
  const toRotation = solve(frameRow[6], 60, 360, true);
  const curves = frameRow
    .slice(7)
    .map((value, index) => solve(value, isOdd(index), 1, false));
  const progress = new Cubic(curves).getValue(targetTime);

  // The eased value can overshoot [0, 1]; the browser clamps colour
  // channels to 0..255, otherwise e.g. 293 prints as "125" not "ff"
  const color = interpolate(fromColor, toColor, progress).map((channel) =>
    Math.round(Math.max(0, Math.min(255, channel))).toString(16),
  );

  // X's script reads the matrix from its printed form (six significant
  // digits) and applies Number(x.toFixed(2)) to each extracted number
  const rotation = interpolateNum(0, toRotation, progress);
  const matrix = convertRotationToMatrix(rotation)
    .flatMap((value) => matrixNumbers(value))
    .map((number) => {
      const hex = floatToHex(Math.abs(Number(number.toFixed(2)))).toLowerCase();
      return hex.startsWith(".") ? `0${hex}` : hex || "0";
    });

  return [...color, ...matrix, "0", "0"].join("").replace(/[.-]/g, "");
}

/**
 * Scales a byte (0-255) linearly into [minVal, maxVal].
 * @param rounding Floor the result when true, round it to two decimals
 *                 otherwise
 */
function solve(
  value: number,
  minVal: number,
  maxVal: number,
  rounding: boolean,
): number {
  const result = (value * (maxVal - minVal)) / 255 + minVal;
  return rounding ? Math.floor(result) : Math.round(result * 100) / 100;
}

/**
 * Formats a number the way Chromium prints a computed CSS transform
 * matrix entry: like C's printf("%.6g"), six significant digits, fixed
 * notation for decimal exponents in [-4, 6) and scientific notation
 * outside that range, with trailing zeros removed.
 *
 * @param value Number to format
 * @returns The formatted string
 */
function formatMatrixValue(value: number): string {
  if (value === 0) {
    return "0";
  }
  const sign = value < 0 ? "-" : "";
  // toExponential(5) always yields 6 significant digits ("d.ddddde±X"),
  // which is the digit sequence %.6g rounds to.
  const [mantissa, exponentText] = Math.abs(value).toExponential(5).split("e");
  const exponent = parseInt(exponentText, 10);
  const digits = mantissa.replace(".", "").replace(/0+$/, "") || "0";

  if (exponent < -4 || exponent >= 6) {
    const head = digits.length > 1 ? `${digits[0]}.${digits.slice(1)}` : digits;
    const expSign = exponent < 0 ? "-" : "+";
    const expDigits = String(Math.abs(exponent)).padStart(2, "0");
    return `${sign}${head}e${expSign}${expDigits}`;
  }
  if (exponent >= 0) {
    const intPart = digits.slice(0, exponent + 1).padEnd(exponent + 1, "0");
    const fracPart = digits.slice(exponent + 1);
    return fracPart ? `${sign}${intPart}.${fracPart}` : `${sign}${intPart}`;
  }
  return `${sign}0.${"0".repeat(-exponent - 1)}${digits}`;
}

/**
 * Extracts the numbers X's script reads back from a computed transform
 * matrix entry. The entry is printed with six significant digits and
 * split on /[\d.-]+/g, so a small value printed in scientific notation
 * (for example "5.68575e-05") yields two numbers: the mantissa and the
 * exponent.
 *
 * @param value Matrix entry value
 * @returns The numbers the script would extract from its printed form
 */
export function matrixNumbers(value: number): number[] {
  return (formatMatrixValue(value).match(/[\d.-]+/g) ?? []).map(Number);
}
