import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type FieldErrorType = Merge<FieldError, FieldErrorsImpl>;

export const getErrorMessage = (
  errors: FieldErrorType | undefined,
  registerName: string
) => {
  const name = getNameFromRegister(registerName);
  return isFieldError(errors?.[name])
    ? getString(errors?.[name]?.message)
    : undefined;
};
export const isFieldError = (
  val: FieldError | FieldErrorType | undefined
): val is FieldError => {
  if (!val) return false;
  if ("message" in val) {
    return typeof val["message"] === "string";
  }
  return false;
};

export const getNameFromRegister = (registerName: string): string => {
  const lastDotIndex = registerName.lastIndexOf(".");
  return lastDotIndex !== -1
    ? registerName.substring(lastDotIndex + 1)
    : registerName;
};

const getString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};
