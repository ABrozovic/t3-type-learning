import { getErrorMessage } from "@/utils/react-hook-form-errors";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import type {
  FieldError,
  FieldErrors,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  UseFormRegisterReturn,
} from "react-hook-form";

type ZInput = {
  label?: string;
  register?: UseFormRegisterReturn;
  errors?: FieldErrors<FieldValues> | Merge<FieldError, FieldErrorsImpl>;
} & InputHTMLAttributes<HTMLInputElement>;

export const ZInput = forwardRef<HTMLInputElement, ZInput>(
  ({ label, register, errors, ...props }, ref) => {
    const error = register ? getErrorMessage(errors, register.name) : undefined;

    return (
      <div>
        <label
          htmlFor={register?.name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="relative rounded-md shadow-sm">
          <input
            ref={ref}
            className={`block w-full rounded-md pr-1 disabled:bg-slate-100  ${
              error
                ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500"
                : "border-gray-300 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            }  sm:text-sm`}
            {...props}
            {...register}
          />
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

export default ZInput;
ZInput.displayName = "forwardRef(Zinput)";
