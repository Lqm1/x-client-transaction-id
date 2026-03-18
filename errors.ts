/**
 * Custom error types for x-client-transaction-id.
 */

type ErrorOptionsWithCode = {
  cause?: unknown;
  code?: string;
};

class ClientTransactionError extends Error {
  readonly code: string;

  constructor(message: string, options: ErrorOptionsWithCode = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.code = options.code ?? "CLIENT_TRANSACTION_ERROR";
  }
}

class ClientTransactionInitializationError extends ClientTransactionError {
  constructor(message: string, options: ErrorOptionsWithCode = {}) {
    super(message, {
      code: options.code ?? "CLIENT_TRANSACTION_INITIALIZATION_ERROR",
      cause: options.cause,
    });
  }
}

class OnDemandFileUrlResolutionError
  extends ClientTransactionInitializationError {
  constructor() {
    super(
      "Unable to resolve the X ondemand chunk URL from the homepage runtime.",
      { code: "ONDEMAND_FILE_URL_RESOLUTION_ERROR" },
    );
  }
}

class OnDemandFileFetchError extends ClientTransactionInitializationError {
  readonly url: string;
  readonly status: number;
  readonly statusText: string;

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

class KeyByteIndicesExtractionError
  extends ClientTransactionInitializationError {
  constructor() {
    super(
      "Unable to extract key byte indices from the X ondemand chunk.",
      { code: "KEY_BYTE_INDICES_EXTRACTION_ERROR" },
    );
  }
}

class SiteVerificationKeyNotFoundError
  extends ClientTransactionInitializationError {
  constructor() {
    super(
      "Unable to find the twitter-site-verification meta tag in the homepage document.",
      { code: "SITE_VERIFICATION_KEY_NOT_FOUND_ERROR" },
    );
  }
}

class IndicesNotInitializedError extends ClientTransactionError {
  constructor() {
    super(
      "ClientTransaction indices are not initialized. Call initialize() before generating animation data.",
      { code: "INDICES_NOT_INITIALIZED_ERROR" },
    );
  }
}

class AnimationFrameDataError extends ClientTransactionInitializationError {
  readonly rowIndex: number;

  constructor(rowIndex: number) {
    super(
      `Unable to build animation data for row ${rowIndex}. The homepage animation markup may have changed.`,
      { code: "ANIMATION_FRAME_DATA_ERROR" },
    );
    this.rowIndex = rowIndex;
  }
}

class ClientTransactionNotInitializedError extends ClientTransactionError {
  constructor() {
    super(
      "ClientTransaction has not been initialized. Call initialize() or use ClientTransaction.create() first.",
      { code: "CLIENT_TRANSACTION_NOT_INITIALIZED_ERROR" },
    );
  }
}

class HandleXMigrationError extends ClientTransactionError {
  constructor(message: string, options: ErrorOptionsWithCode = {}) {
    super(message, {
      code: options.code ?? "HANDLE_X_MIGRATION_ERROR",
      cause: options.cause,
    });
  }
}

class XHomePageFetchError extends HandleXMigrationError {
  readonly status: number;
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(
      `Unable to fetch the X homepage: ${status} ${statusText}.`,
      { code: "X_HOMEPAGE_FETCH_ERROR" },
    );
    this.status = status;
    this.statusText = statusText;
  }
}

class XMigrationRedirectionError extends HandleXMigrationError {
  readonly status: number;
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(
      `Unable to follow the X migration redirect: ${status} ${statusText}.`,
      { code: "X_MIGRATION_REDIRECTION_ERROR" },
    );
    this.status = status;
    this.statusText = statusText;
  }
}

class XMigrationFormError extends HandleXMigrationError {
  readonly status: number;
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(
      `Unable to submit the X migration form: ${status} ${statusText}.`,
      { code: "X_MIGRATION_FORM_ERROR" },
    );
    this.status = status;
    this.statusText = statusText;
  }
}

class InterpolationInputError extends ClientTransactionError {
  readonly fromLength: number;
  readonly toLength: number;

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
