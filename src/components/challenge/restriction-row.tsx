import type { CreateChallenge } from "@/server/api/routers/challenge/create-challenge";
import type { UseFieldArrayRemove, UseFormReturn } from "react-hook-form";
import { ZInput } from "../common/form/components/z-input";

export const RestrictionRow = ({
  form,
  index,
  remove,
}: {
  form: UseFormReturn<CreateChallenge>;
  index: number;
  remove: UseFieldArrayRemove;
}) => {
  return (
    <>
      <tr>
        <td>
          <ZInput
            type="text"
            register={form.register(`restrictions.${index}.label`)}
            errors={
              form.formState.errors.restrictions &&
              form.formState.errors.restrictions[index]
            }
          />
        </td>
        <td>
          <ZInput
            type="text"
            register={form.register(`restrictions.${index}.initialRow`, {
              valueAsNumber: true,
            })}
            errors={
              form.formState.errors.restrictions &&
              form.formState.errors.restrictions[index]
            }
          />
        </td>
        <td>
          <ZInput
            type="text"
            register={form.register(`restrictions.${index}.initialColumn`, {
              valueAsNumber: true,
            })}
            errors={
              form.formState.errors.restrictions &&
              form.formState.errors.restrictions[index]
            }
          />
        </td>
        <td>
          <ZInput
            type="text"
            register={form.register(`restrictions.${index}.finalRow`, {
              valueAsNumber: true,
            })}
            errors={
              form.formState.errors.restrictions &&
              form.formState.errors.restrictions[index]
            }
          />
        </td>
        <td>
          <ZInput
            type="text"
            register={form.register(`restrictions.${index}.finalColumn`, {
              valueAsNumber: true,
            })}
            errors={
              form.formState.errors.restrictions &&
              form.formState.errors.restrictions[index]
            }
          />
        </td>
        <td>
          <button
            type="button"
            onClick={() => remove(index)}
            className="inline-flex items-center justify-center rounded border border-transparent bg-indigo-600 
              px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none 
              focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            X
          </button>
        </td>
      </tr>
    </>
  );
};
