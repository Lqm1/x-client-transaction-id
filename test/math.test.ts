import { expect, test } from "bun:test";
import {
  floatToHex,
  InterpolationInputError,
  interpolate,
  interpolateNum,
  isOdd,
} from "../src/index.ts";

test("interpolate interpolates each pair of values", () => {
  expect(interpolate([0, 10], [10, 20], 0.25)).toEqual([2.5, 12.5]);
});

test("interpolate throws a typed error for mismatched input lengths", () => {
  const run = () => interpolate([1], [1, 2], 0.5);
  expect(run).toThrow(InterpolationInputError);
  expect(run).toThrow("Interpolation requires arrays of the same length");
});

test("interpolateNum switches booleans halfway", () => {
  expect(interpolateNum(false, true, 0.49)).toBe(0);
  expect(interpolateNum(false, true, 0.5)).toBe(1);
});

test("floatToHex leaves a zero integer part empty and expands the fraction", () => {
  // Reference values from the implementation that predates the move to Bun
  expect(floatToHex(0)).toBe("");
  expect(floatToHex(0.5)).toBe(".8");
  expect(floatToHex(16)).toBe("10");
  expect(floatToHex(255.5)).toBe("FF.8");
  expect(floatToHex(0.1)).toBe(".1999999999999A");
  expect(floatToHex(0.72)).toBe(".B851EB851EB85");
});

test("isOdd returns -1 for odd numbers and 0 for even ones", () => {
  expect(isOdd(3)).toBe(-1);
  expect(isOdd(4)).toBe(0);
});
