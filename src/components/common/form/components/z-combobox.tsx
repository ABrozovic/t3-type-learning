import { getErrorMessage } from "@/utils/react-hook-form-errors";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment, forwardRef, useState } from "react";
import type {
  ControllerRenderProps,
  FieldError,
  FieldErrors,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  UseFormRegisterReturn,
} from "react-hook-form";

type ComboboxValue = {
  id: string;
  name: string;
};

type ZCombobox = {
  label?: string;
  values: ComboboxValue[];
  register?: UseFormRegisterReturn;
  defaultFirst?: boolean;
  onChange?: (value: ComboboxValue) => void;
  errors?: FieldErrors<FieldValues> | Merge<FieldError, FieldErrorsImpl>;
} & Omit<Partial<ControllerRenderProps>, "onChange">;

export const ZCombobox = forwardRef<HTMLInputElement, ZCombobox>(
  ({ label, register, values, defaultFirst, errors, ...props }, ref) => {
    const error = register ? getErrorMessage(errors, register.name) : undefined;
    const [query, setQuery] = useState("");
    const filteredValues =
      query === ""
        ? values
        : values?.filter((value) =>
            value.name
              .toLowerCase()
              .replace(/\s+/g, "")
              .includes(query.toLowerCase().replace(/\s+/g, ""))
          );
    return (
      <div className="relative">
        <label
          htmlFor={register?.name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <Combobox
          defaultValue={defaultFirst ? values[0] : { id: "", name: "" }}
          onChange={(value) => props.onChange && props.onChange(value)}
          refName={props.name}
        >
          <div className="relative mt-1 rounded-md shadow-sm">
            <Combobox.Input
              ref={ref}
              className={`block w-full rounded-md pr-1 ${
                error
                  ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500"
                  : "border-gray-300 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              }  sm:text-sm`}
              displayValue={(value: ComboboxValue) => value.name}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <div className="absolute w-full">
              <Combobox.Options
                className="relative z-50 mt-1 max-h-[50%] w-full overflow-auto rounded-md bg-white px-3   py-1 text-base 
            shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              >
                {filteredValues?.length === 0 && query !== "" ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Zero results.
                  </div>
                ) : (
                  filteredValues?.map((value) => (
                    <Combobox.Option
                      key={value.id}
                      className={({ active, selected }) =>
                        `relative w-full cursor-default select-none py-2 pl-4 pr-6 ${
                          active ? "bg-indigo-600 text-white " : "text-gray-900"
                        } ${selected ? "pl-6" : ""}`
                      }
                      value={value}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-extrabold" : "font-normal"
                            }`}
                          >
                            {value.name}
                          </span>
                          {selected ? (
                            <span
                              className={`w-fullright-0 absolute inset-y-0 left-0 top-0 flex items-center  ${
                                active ? "text-white" : "text-indigo-600"
                              }`}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          </Transition>
        </Combobox>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

export default ZCombobox;
ZCombobox.displayName = "forwardRef(ZCombobox)";
