/** Stand-in for Node builtins that webpack pulls into the admin client bundle. */
export class MessageChannel {
  port1: Record<string, unknown> = {};
  port2: Record<string, unknown> = {};
}

export class AsyncLocalStorage<T> {
  private current: T | undefined;

  run<R>(value: T, fn: (...args: unknown[]) => R, ...args: unknown[]): R {
    const previous = this.current;
    this.current = value;
    try {
      return fn(...args);
    } finally {
      this.current = previous;
    }
  }

  getStore(): T | undefined {
    return this.current;
  }
}

export function randomUUID(): string {
  return globalThis.crypto.randomUUID();
}

export function resolve4(): Promise<string[]> {
  return Promise.resolve([]);
}

export function resolve6(): Promise<string[]> {
  return Promise.resolve([]);
}

const empty = () => undefined;
export default empty;
