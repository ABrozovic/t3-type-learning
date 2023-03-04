import { getErrorMessage } from "@/utils/react-hook-form-errors";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";
import type {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormRegisterReturn,
} from "react-hook-form";

type ZSelect = {
  label?: string;
  values?: { value: string; label: string }[];
  register?: UseFormRegisterReturn;
  errors?: Merge<FieldError, FieldErrorsImpl>;
} & SelectHTMLAttributes<HTMLSelectElement>;

export const ZSelect = forwardRef<HTMLSelectElement, ZSelect>(
  ({ label, register, values, errors, ...props }, ref) => {
    const error = register ? getErrorMessage(errors, register.name) : undefined;
    return (
      <div>
        <label
          htmlFor={register?.name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <select
            ref={ref}
            className={`block w-full rounded-md pr-1 ${
              error
                ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500"
                : "border-gray-300 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            }  sm:text-sm`}
            {...props}
            {...register}
          >
            {values?.map((opt, index) => (
              <option key={index} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
  },
);

export default ZSelect;
ZSelect.displayName = "forwardRef(Zinput)";
