/**
 * Client Transaction ID Generator for X (formerly Twitter) API requests
 *
 * This module provides functionality to generate the x-client-transaction-id
 * header value required for authenticated API requests to X.
 */
import Cubic from "./cubic.ts";
import { interpolate } from "./interpolate.ts";
import { convertRotationToMatrix } from "./rotation.ts";
import { floatToHex, isOdd } from "./utils.ts";
import { decodeBase64, encodeBase64 } from "@std/encoding";

// Regular expression definitions for extracting necessary data from X's homepage
const ON_DEMAND_FILE_REGEX = /(['"])ondemand\.s\1:\s*(['"])([\w]*)\2/;
const INDICES_REGEX = /\(\w\[(\d{1,2})\],\s*16\)/g;

/**
 * Main class responsible for generating client transaction IDs
 * used in authenticated API requests to X
 */
class ClientTransaction {
  private static ADDITIONAL_RANDOM_NUMBER = 3;
  private static DEFAULT_KEYWORD = "obfiowerehiring";
  private DEFAULT_ROW_INDEX: number | null = null;
  private DEFAULT_KEY_BYTES_INDICES: number[] | null = null;

  private homePageDocument: Document;
  private key: string | null = null;
  private keyBytes: number[] | null = null;
  private animationKey: string | null = null;
  private isInitialized: boolean = false;

  /**
   * Creates a new ClientTransaction instance
   * @param homePageDocument DOM Document object from X's homepage
   */
  constructor(homePageDocument: Document) {
    this.homePageDocument = homePageDocument;
  }

  /**
   * Initializes the ClientTransaction instance
   * Must be called after constructor and before using other methods
   * @returns Promise that resolves when initialization is complete
   * @throws Error if initialization fails
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize indices
      [this.DEFAULT_ROW_INDEX, this.DEFAULT_KEY_BYTES_INDICES] =
        await this.getIndices(this.homePageDocument);

      // Get key from document
      this.key = this.getKey(this.homePageDocument);
      if (!this.key) throw new Error("Failed to get key");

      // Convert key to byte array
      this.keyBytes = this.getKeyBytes(this.key);

      // Generate animation key
      this.animationKey = this.getAnimationKey(
        this.keyBytes,
        this.homePageDocument
      );

      // Mark initialization as complete
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize ClientTransaction:", error);
      throw error;
    }
  }

  /**
   * Static factory method that creates and initializes a ClientTransaction instance
   * @param homePageDocument DOM Document object from X's homepage
   * @returns Initialized ClientTransaction instance
   */
  static async create(homePageDocument: Document): Promise<ClientTransaction> {
    const instance = new ClientTransaction(homePageDocument);
    await instance.initialize();
    return instance;
  }

  /**
   * Extracts key byte indices from homepage document
   * @param homePageDocument Optional document to use instead of stored one
   * @returns Tuple of [rowIndex, keyByteIndices]
   * @private
   */
  private async getIndices(
    homePageDocument?: Document
  ): Promise<[number, number[]]> {
    const keyByteIndices: string[] = [];
    const response = homePageDocument || this.homePageDocument;

    // Extract content from response as string
    let responseStr = "";

    if (typeof response === "string") {
      responseStr = response;
    } else if (response.documentElement) {
      // Handle Document object
      responseStr = response.documentElement.outerHTML;
    } else {
      // Handle other object types
      responseStr = response.toString ? response.toString() : "";
    }

    const onDemandFileMatch = ON_DEMAND_FILE_REGEX.exec(responseStr);

    if (onDemandFileMatch) {
      const onDemandFileUrl = `https://abs.twimg.com/responsive-web/client-web/ondemand.s.${onDemandFileMatch[3]}a.js`;

      try {
        // Fetch ondemand file
        const onDemandFileResponse = await fetch(onDemandFileUrl);
        const responseText = await onDemandFileResponse.text();

        // Extract indices using regex
        let match: RegExpExecArray | null;
        INDICES_REGEX.lastIndex = 0; // Reset regex index
        while ((match = INDICES_REGEX.exec(responseText)) !== null) {
          keyByteIndices.push(match[1]);
        }
      } catch (error) {
        console.error("Error fetching ondemand file:", error);
      }
    }

    if (!keyByteIndices.length) {
      throw new Error("Couldn't get KEY_BYTE indices");
    }

    // Convert strings to numbers
    const numericIndices = keyByteIndices.map((index) => parseInt(index, 10));
    return [numericIndices[0], numericIndices.slice(1)];
  }

  /**
   * Extracts verification key from document
   * @param response Optional document to use instead of stored one
   * @returns X site verification key
   * @private
   */
  private getKey(response?: Document): string {
    response = response || this.homePageDocument;

    let content = "";

    // Extract key from meta tag
    const element = response.querySelector(
      "[name='twitter-site-verification']"
    );
    if (element) {
      content = element.getAttribute("content") ?? "";
    }

    if (!content) {
      throw new Error("Couldn't get key from the page source");
    }
    return content;
  }

  /**
   * Converts key string to byte array
   * @param key Base64 encoded key string
   * @returns Array of byte values
   * @private
   */
  private getKeyBytes(key: string): number[] {
    return Array.from(decodeBase64(key));
  }

  /**
   * Gets animation frames from document
   * @param response Optional document to use instead of stored one
   * @returns Array of frame elements
   * @private
   */
  private getFrames(response?: Document): Element[] {
    response = response || this.homePageDocument;
    return Array.from(response.querySelectorAll("[id^='loading-x-anim']"));
  }

  /**
   * Parses SVG paths to extract coordinate arrays
   * @param keyBytes Key bytes from site verification
   * @param response Optional document to use
   * @param frames Optional frame elements if already fetched
   * @returns 2D array of frame coordinates
   * @private
   */
  private get2dArray(
    keyBytes: number[],
    response?: Document,
    frames?: Element[]
  ): number[][] {
    if (!frames) {
      frames = this.getFrames(response);
    }

    if (!frames || !frames.length) {
      return [[]]; // Return empty 2D array
    }

    // 1. Select frame and navigate DOM to get "d" attribute
    const frame = frames[keyBytes[5] % 4];
    const firstChild = frame.children[0] as Element;
    const targetChild = firstChild.children[1] as Element;
    const dAttr = targetChild.getAttribute("d");
    if (dAttr === null) {
      return [];
    }

    // 2. Remove first 9 chars and split by "C"
    const items = dAttr.substring(9).split("C");

    // 3. Extract and convert numbers from each segment
    return items.map((item) => {
      // a) Replace non-digits with spaces
      const cleaned = item.replace(/[^\d]+/g, " ").trim();
      // b) Split by whitespace
      const parts = cleaned === "" ? [] : cleaned.split(/\s+/);
      // c) Convert string to integers
      return parts.map((str) => parseInt(str, 10));
    });
  }

  /**
   * Calculates value within specified range
   * @param value Input value (0-255)
   * @param minVal Minimum output value
   * @param maxVal Maximum output value
   * @param rounding Whether to use floor (true) or round (false)
   * @returns Calculated value
   * @private
   */
  private solve(
    value: number,
    minVal: number,
    maxVal: number,
    rounding: boolean
  ): number {
    const result = (value * (maxVal - minVal)) / 255 + minVal;
    return rounding ? Math.floor(result) : Math.round(result * 100) / 100;
  }

  /**
   * Generates animation key from frame data
   * @param frames Array of frame values
   * @param targetTime Target time for animation
   * @returns Animation key string
   * @private
   */
  private animate(frames: number[], targetTime: number): string {
    const fromColor = frames.slice(0, 3).concat(1).map(Number);
    const toColor = frames.slice(3, 6).concat(1).map(Number);
    const fromRotation = [0.0];
    const toRotation = [this.solve(frames[6], 60.0, 360.0, true)];

    const remainingFrames = frames.slice(7);
    const curves = remainingFrames.map((item, counter) =>
      this.solve(item, isOdd(counter), 1.0, false)
    );

    const cubic = new Cubic(curves);
    const val = cubic.getValue(targetTime);
    const color = interpolate(fromColor, toColor, val).map((value) =>
      value > 0 ? value : 0
    );
    const rotation = interpolate(fromRotation, toRotation, val);
    const matrix = convertRotationToMatrix(rotation[0]);

    // Convert color and matrix values to hex string
    const strArr: string[] = color
      .slice(0, -1)
      .map((value) => Math.round(value).toString(16));

    for (const value of matrix) {
      let rounded = Math.round(value * 100) / 100;
      if (rounded < 0) {
        rounded = -rounded;
      }
      const hexValue = floatToHex(rounded);
      strArr.push(
        hexValue.startsWith(".")
          ? `0${hexValue}`.toLowerCase()
          : hexValue || "0"
      );
    }

    strArr.push("0", "0");
    const animationKey = strArr.join("").replace(/[.-]/g, "");
    return animationKey;
  }

  /**
   * Generates animation key used in transaction ID
   * @param keyBytes Key bytes from site verification
   * @param response Optional document to use
   * @returns Animation key string
   * @private
   */
  private getAnimationKey(keyBytes: number[], response?: Document): string {
    const totalTime = 4096;

    if (!this.DEFAULT_ROW_INDEX || !this.DEFAULT_KEY_BYTES_INDICES) {
      throw new Error("Indices not initialized");
    }

    const rowIndex = keyBytes[this.DEFAULT_ROW_INDEX] % 16;

    // Generate frame time using key byte indices
    const frameTime = this.DEFAULT_KEY_BYTES_INDICES.reduce((num1, num2) => {
      return num1 * (keyBytes[num2] % 16);
    }, 1);

    const arr = this.get2dArray(keyBytes, response);
    if (!arr || !arr[rowIndex]) {
      throw new Error("Invalid frame data");
    }

    const frameRow = arr[rowIndex];
    const targetTime = frameTime / totalTime;
    const animationKey = this.animate(frameRow, targetTime);

    return animationKey;
  }

  /**
   * Generates a transaction ID for X API requests
   * @param method HTTP method (GET, POST, etc.)
   * @param path API endpoint path
   * @param response Optional document to use
   * @param key Optional key to use
   * @param animationKey Optional animation key to use
   * @param timeNow Optional timestamp (defaults to current time)
   * @returns Base64 encoded transaction ID
   */
  async generateTransactionId(
    method: string,
    path: string,
    response?: Document,
    key?: string,
    animationKey?: string,
    timeNow?: number
  ): Promise<string> {
    // Check if instance is initialized
    if (!this.isInitialized) {
      throw new Error(
        "ClientTransaction is not initialized. Call initialize() before using."
      );
    }

    timeNow = timeNow || Math.floor((Date.now() - 1682924400 * 1000) / 1000);
    const timeNowBytes = [
      timeNow & 0xff,
      (timeNow >> 8) & 0xff,
      (timeNow >> 16) & 0xff,
      (timeNow >> 24) & 0xff,
    ];

    key = key || this.key || this.getKey(response);
    const keyBytes = this.keyBytes || this.getKeyBytes(key);
    animationKey =
      animationKey ||
      this.animationKey ||
      this.getAnimationKey(keyBytes, response);

    // Generate hash data
    const data = `${method}!${path}!${timeNow}${ClientTransaction.DEFAULT_KEYWORD}${animationKey}`;

    // Calculate SHA-256 hash
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashBytes = Array.from(new Uint8Array(hashBuffer));

    const randomNum = Math.floor(Math.random() * 256);
    const bytesArr = [
      ...keyBytes,
      ...timeNowBytes,
      ...hashBytes.slice(0, 16),
      ClientTransaction.ADDITIONAL_RANDOM_NUMBER,
    ];

    const out = new Uint8Array([
      randomNum,
      ...bytesArr.map((item) => item ^ randomNum),
    ]);
    return encodeBase64(out).replace(/=/g, "");
  }
}

export default ClientTransaction;
