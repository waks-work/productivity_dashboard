export enum AppErrorType {
    NetworkError,
    ValidationError,
    ParseError,
    Timeout,
    Unknown,
}

/// Result<T, AppError>
export class AppError extends Error {
    readonly type: AppErrorType;
    readonly status?: number;
    readonly data?: unknown;

    constructor(type: AppErrorType, message: string, status?: number, data?: unknown) {
        super(message);

        this.type = type;
        this.status = status;
        this.data = data;
    }
}

export type Option<T> = { some: true, value: T } | { some: false };

export type Result<T, E> =
    | { ok: true; value: T }
    | { ok: false; error: E };


/// return Ok(user);
export function Ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
}

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
    return result.ok;
}

/// return Err( new HttpError("Unauthorized", HttpErrorCode.Unauthorized ));
export function Err<E>(error: E): Result<never, E> {
    return { ok: false, error };
}

/// if (isErr(result)) { console.log("Error message")}
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
    return !result.ok;
}

export function unwrap<T, E>(result: Result<T, E>): T {
    if (!result.ok) {
        throw result.error;
    }
    return result.value;
}

export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
    return result.ok ? result.value : fallback;
}

export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    return result.ok ? Ok(fn(result.value)) : result;
}

export function normalizeError(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }

    return new Error(typeof error === "string" ? error : JSON.stringify(error));
}

export function pcall<T, Args extends unknown[]>(fn: (...args: Args) => T, ...args: Args): Result<T, Error> {
    try {
        return { ok: true, value: fn(...args) };
    } catch (error) {
        return { ok: false, error: normalizeError(error) };
    }
}

export async function a_pcall<T, Args extends unknown[]>(
    fn: (...args: Args) => T | Promise<T>, ...args: Args): Promise<Result<Awaited<T>, Error>> {
    try {
        return { ok: true, value: await Promise.resolve(fn(...args)) };
    } catch (error) {
        return { ok: false, error: normalizeError(error) };
    }
}

