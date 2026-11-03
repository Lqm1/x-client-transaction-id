/**
 * Cubic Bezier interpolation implementation
 *
 * This module implements the cubic bezier easing used in the animation
 * key generation process.
 *
 * X runs the easing as a CSS animation in the browser, so the value to
 * match is the one Chromium computes. This is a port of Chromium's
 * gfx::CubicBezier solver (ui/gfx/geometry/cubic_bezier.cc): a
 * piecewise-linear first guess from 11 samples of x(t), up to 4 Newton
 * steps, then bisection inside the sample bracket, with a tolerance of
 * 1e-7. Plain bisection to 1e-5 returns a different t for a small
 * fraction of curves and moves a printed digit of the animation key.
 */
export class Cubic {
  private static readonly EPSILON = 1e-7;
  private static readonly NEWTON_ITERATIONS = 4;
  private static readonly SPLINE_SAMPLES = 11;

  private ax: number;
  private bx: number;
  private cx: number;
  private ay: number;
  private by: number;
  private cy: number;
  private startGradient: number;
  private endGradient: number;
  private splineSamples: number[];

  /**
   * Creates a new Cubic instance
   * @param curves Array of curve control points [x1, y1, x2, y2]
   */
  constructor(curves: number[]) {
    const [x1, y1, x2, y2] = curves;

    this.cx = 3.0 * x1;
    this.bx = 3.0 * (x2 - x1) - this.cx;
    this.ax = 1.0 - this.cx - this.bx;
    this.cy = 3.0 * y1;
    this.by = 3.0 * (y2 - y1) - this.cy;
    this.ay = 1.0 - this.cy - this.by;

    // Gradients at the ends, used to extend the curve outside [0, 1]
    if (x1 > 0) {
      this.startGradient = y1 / x1;
    } else if (y1 === 0 && x2 > 0) {
      this.startGradient = y2 / x2;
    } else if (y1 === 0 && y2 === 0) {
      this.startGradient = 1;
    } else {
      this.startGradient = 0;
    }

    if (x2 < 1) {
      this.endGradient = (y2 - 1) / (x2 - 1);
    } else if (y2 === 1 && x1 < 1) {
      this.endGradient = (y1 - 1) / (x1 - 1);
    } else if (y2 === 1 && y1 === 1) {
      this.endGradient = 1;
    } else {
      this.endGradient = 0;
    }

    const deltaT = 1.0 / (Cubic.SPLINE_SAMPLES - 1);
    this.splineSamples = [];
    for (let i = 0; i < Cubic.SPLINE_SAMPLES; i++) {
      this.splineSamples.push(this.sampleX(i * deltaT));
    }
  }

  /**
   * Calculates the interpolated value at a specific time point
   * @param time Normalized time value
   * @returns Interpolated value
   */
  getValue(time: number): number {
    if (time < 0) {
      return this.startGradient * time;
    }
    if (time > 1) {
      return 1.0 + this.endGradient * (time - 1.0);
    }
    return this.sampleY(this.solveCurveX(time));
  }

  private sampleX(t: number): number {
    return ((this.ax * t + this.bx) * t + this.cx) * t;
  }

  private sampleY(t: number): number {
    return ((this.ay * t + this.by) * t + this.cy) * t;
  }

  private sampleDerivativeX(t: number): number {
    return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
  }

  /**
   * Finds t with sampleX(t) ~= x, following gfx::CubicBezier::SolveCurveX:
   * a spline-interpolated first guess, Newton's method, then bisection.
   * @param x Target x value
   * @returns The t closest to the solution
   * @private
   */
  private solveCurveX(x: number): number {
    let t0 = 0.0;
    let t1 = 1.0;
    let t2 = x;

    // First guess: interpolate within the spline sample bracket containing x
    const deltaT = 1.0 / (Cubic.SPLINE_SAMPLES - 1);
    for (let i = 1; i < Cubic.SPLINE_SAMPLES; i++) {
      if (x <= this.splineSamples[i]) {
        t1 = deltaT * i;
        t0 = t1 - deltaT;
        t2 =
          t0 +
          ((t1 - t0) * (x - this.splineSamples[i - 1])) /
            (this.splineSamples[i] - this.splineSamples[i - 1]);
        break;
      }
    }

    // Newton's method. x2 keeps the residual of the last point evaluated,
    // which is the one before the final step; Chromium tests that value too.
    let x2 = 0;
    for (let i = 0; i < Cubic.NEWTON_ITERATIONS; i++) {
      x2 = this.sampleX(t2) - x;
      if (Math.abs(x2) < Cubic.EPSILON) {
        return t2;
      }
      const d2 = this.sampleDerivativeX(t2);
      if (Math.abs(d2) < Cubic.EPSILON) {
        break;
      }
      t2 -= x2 / d2;
    }
    if (Math.abs(x2) < Cubic.EPSILON) {
      return t2;
    }

    // Bisection, for reliability
    while (t0 < t1) {
      x2 = this.sampleX(t2);
      if (Math.abs(x2 - x) < Cubic.EPSILON) {
        return t2;
      }
      if (x > x2) {
        t0 = t2;
      } else {
        t1 = t2;
      }
      t2 = (t1 + t0) * 0.5;
    }
    return t2;
  }
}
