/**
 * Reproduction of how the browser presents X's loading animation.
 */

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
