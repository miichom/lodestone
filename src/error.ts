class LodestoneError extends Error {
  constructor(message: string, name = "LodestoneError") {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = name;
  }
}

export default LodestoneError;
