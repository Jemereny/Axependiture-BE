export class BotError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class BadCommandError extends BotError {
  constructor(message: string) {
    super(message);
  }
}

export class ArgumentError extends BotError {
  constructor(message: string) {
    super(message);
  }
}
