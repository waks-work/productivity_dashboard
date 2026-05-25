
export enum Error {
    None = 0,
    NotFound,
    PermissionDenied,
    UnknownRuntimePanic,
}

export function pcall<T, Args extends any[]>(
    fn: (...args: Args) => T, ...args: Args
): [true, T] | [false, any] {
    try {
        return [true, fn(...args)];
    } catch (error) {
        return [false, error];
    }
}

export async function a_pcall<T, Args extends any[]>(
    func: (...args: Args) => T | Promise<T>,
    ...args: Args
): Promise<[true, Awaited<T>] | [false, unknown]> {
    try {
        const result = await Promise.resolve(func(...args));
        return [true, result as Awaited<T>];
    } catch (error) {
        return [false, error];
    }
}

function pcall_test_function() {
    const parseData = (jsonString: string) => JSON.parse(jsonString);
    const [ok, data] = pcall<{ status: string }, [string]>(parseData, '{"status", "ok"}');
    if (!ok) {
        console.log("failed to parse data")
        return;
    }

    const readFile = (path: string): [string, Error] => {
        if (path === "") {
            return ["", Error.NotFound];
        }
        return ["file content here", Error.None];
    };

    const [data_v, err] = readFile("config.json");
    if (err !== Error.None) {
        console.error("Failed to read file with code:", err);
        return;
    }
}
