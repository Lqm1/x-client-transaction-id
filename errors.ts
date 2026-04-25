/**
 * Custom error types for x-client-transaction-id.
 */

/** Options for constructing error instances with an optional cause and code. */
type ErrorOptionsWithCode = {
  cause?: unknown;
  code?: string;
};

/** Base error class for all client transaction related errors. */
class ClientTransactionError extends Error {
  readonly code: string;

  /**
   * Creates a new ClientTransactionError.
   * @param message Error message
   * @param options Optional cause and error code
   */
  constructor(message: string, options: ErrorOptionsWithCode = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.code = options.code ?? "CLIENT_TRANSACTION_ERROR";
  }
}

/** Error thrown when ClientTransaction initialization fails. */
class ClientTransactionInitializationError extends ClientTransactionError {
  /**
   * Creates a new ClientTransactionInitializationError.
   * @param message Error message
   * @param options Optional cause and error code
   */
  constructor(message: string, options: ErrorOptionsWithCode = {}) {
    super(message, {
      code: options.code ?? "CLIENT_TRANSACTION_INITIALIZATION_ERROR",
      cause: options.cause,
    });
  }
}

/** Error thrown when the ondemand file URL cannot be resolved from the homepage runtime. */
class OnDemandFileUrlResolutionError
  extends ClientTransactionInitializationError {
  constructor() {
    super(
      "Unable to resolve the X ondemand chunk URL from the homepage runtime.",
      { code: "ONDEMAND_FILE_URL_RESOLUTION_ERROR" },
    );
  }
}

/** Error thrown when fetching the ondemand file fails. */
class OnDemandFileFetchError extends ClientTransactionInitializationError {
  readonly url: string;
  readonly status: number;
  readonly statusText: string;

  /**
   * Creates a new OnDemandFileFetchError.
   * @param url URL that was fetched
   * @param status HTTP status code
   * @param statusText HTTP status text
   */
  constructor(url: string, status: number, statusText: string) {
    super(
      `Unable to fetch the X ondemand chunk from "${url}": ${status} ${statusText}.`,
      { code: "ONDEMAND_FILE_FETCH_ERROR" },
    );
    this.url = url;
    this.status = status;
    this.statusText = statusText;
  }
}

/** Error thrown when key byte indices cannot be extracted from the ondemand chunk. */
class KeyByteIndicesExtractionError
  extends ClientTransactionInitializationError {
  constructor() {
    super(
      "Unable to extract key byte indices from the X ondemand chunk.",
      { code: "KEY_BYTE_INDICES_EXTRACTION_ERROR" },
    );
  }
}

/** Error thrown when the twitter-site-verification meta tag is not found. */
class SiteVerificationKeyNotFoundError
  extends ClientTransactionInitializationError {
  constructor() {
    super(
      "Unable to find the twitter-site-verification meta tag in the homepage document.",
      { code: "SITE_VERIFICATION_KEY_NOT_FOUND_ERROR" },
    );
  }
}

/** Error thrown when indices are accessed before initialization. */
class IndicesNotInitializedError extends ClientTransactionError {
  constructor() {
    super(
      "ClientTransaction indices are not initialized. Call initialize() before generating animation data.",
      { code: "INDICES_NOT_INITIALIZED_ERROR" },
    );
  }
}

/** Error thrown when animation frame data cannot be built for a given row. */
class AnimationFrameDataError extends ClientTransactionInitializationError {
  readonly rowIndex: number;

  /**
   * Creates a new AnimationFrameDataError.
   * @param rowIndex Row index that failed
   */
  constructor(rowIndex: number) {
    super(
      `Unable to build animation data for row ${rowIndex}. The homepage animation markup may have changed.`,
      { code: "ANIMATION_FRAME_DATA_ERROR" },
    );
    this.rowIndex = rowIndex;
  }
}

/** Error thrown when ClientTransaction is used before initialization. */
class ClientTransactionNotInitializedError extends ClientTransactionError {
  constructor() {
    super(
      "ClientTransaction has not been initialized. Call initialize() or use ClientTransaction.create() first.",
      { code: "CLIENT_TRANSACTION_NOT_INITIALIZED_ERROR" },
    );
  }
}

/** Base error class for X domain migration related errors. */
class HandleXMigrationError extends ClientTransactionError {
  /**
   * Creates a new HandleXMigrationError.
   * @param message Error message
   * @param options Optional cause and error code
   */
  constructor(message: string, options: ErrorOptionsWithCode = {}) {
    super(message, {
      code: options.code ?? "HANDLE_X_MIGRATION_ERROR",
      cause: options.cause,
    });
  }
}

/** Error thrown when fetching the X homepage fails. */
class XHomePageFetchError extends HandleXMigrationError {
  readonly status: number;
  readonly statusText: string;

  /**
   * Creates a new XHomePageFetchError.
   * @param status HTTP status code
   * @param statusText HTTP status text
   */
  constructor(status: number, statusText: string) {
    super(
      `Unable to fetch the X homepage: ${status} ${statusText}.`,
      { code: "X_HOMEPAGE_FETCH_ERROR" },
    );
    this.status = status;
    this.statusText = statusText;
  }
}

/** Error thrown when following the X migration redirect fails. */
class XMigrationRedirectionError extends HandleXMigrationError {
  readonly status: number;
  readonly statusText: string;

  /**
   * Creates a new XMigrationRedirectionError.
   * @param status HTTP status code
   * @param statusText HTTP status text
   */
  constructor(status: number, statusText: string) {
    super(
      `Unable to follow the X migration redirect: ${status} ${statusText}.`,
      { code: "X_MIGRATION_REDIRECTION_ERROR" },
    );
    this.status = status;
    this.statusText = statusText;
  }
}

/** Error thrown when submitting the X migration form fails. */
class XMigrationFormError extends HandleXMigrationError {
  readonly status: number;
  readonly statusText: string;

  /**
   * Creates a new XMigrationFormError.
   * @param status HTTP status code
   * @param statusText HTTP status text
   */
  constructor(status: number, statusText: string) {
    super(
      `Unable to submit the X migration form: ${status} ${statusText}.`,
      { code: "X_MIGRATION_FORM_ERROR" },
    );
    this.status = status;
    this.statusText = statusText;
  }
}

/** Error thrown when interpolation inputs have mismatched lengths. */
class InterpolationInputError extends ClientTransactionError {
  readonly fromLength: number;
  readonly toLength: number;

  /**
   * Creates a new InterpolationInputError.
   * @param fromLength Length of the from array
   * @param toLength Length of the to array
   */
  constructor(fromLength: number, toLength: number) {
    super(
      `Interpolation requires arrays of the same length, but received ${fromLength} and ${toLength}.`,
      { code: "INTERPOLATION_INPUT_ERROR" },
    );
    this.fromLength = fromLength;
    this.toLength = toLength;
  }
}

export {
  AnimationFrameDataError,
  ClientTransactionError,
  ClientTransactionInitializationError,
  ClientTransactionNotInitializedError,
  HandleXMigrationError,
  IndicesNotInitializedError,
  InterpolationInputError,
  KeyByteIndicesExtractionError,
  OnDemandFileFetchError,
  OnDemandFileUrlResolutionError,
  SiteVerificationKeyNotFoundError,
  XHomePageFetchError,
  XMigrationFormError,
  XMigrationRedirectionError,
};
