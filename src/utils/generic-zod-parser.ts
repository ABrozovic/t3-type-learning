import type { Schema } from "zod";
import { ZodError } from "zod";

const asError = (e: unknown) =>
  e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error();

export type ExecResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: Error;
    };

export const safeExec = <T>(cb: () => T): ExecResult<T> => {
  try {
    return { success: true, data: cb() };
  } catch (e) {
    return { success: false, error: asError(e) };
  }
};

export const safeExecAsync = <T>(
  cb: () => Promise<T>
): Promise<ExecResult<T>> => {
  // check for sync errors
  const res = safeExec(cb);
  if (!res.success) return Promise.resolve(res);

  return Promise.resolve(res.data).then(
    (data) => ({ success: true, data }),
    (error) => ({ success: false, error: asError(error) })
  );
};

type ParseError = {
  code: string;
  path: Array<string>;
};
type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Array<ParseError> };
export const parse = async <T>(
  schema: Schema<T>,
  data: unknown
): Promise<ParseResult<T>> => {
  const res = await safeExecAsync(() => schema.parseAsync(data));
  if (res.success) return res;

  if (res.error instanceof ZodError) {
    return {
      success: false,
      errors: res.error.errors.map(({ code, message, path }) => ({
        path: path.map(String),
        code: message + code,
      })),
    };
  }

  throw res.error;
};
