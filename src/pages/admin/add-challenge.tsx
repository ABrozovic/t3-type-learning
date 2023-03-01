import { RestrictionRow } from "@/components/challenge/restriction-row";
import { ZCombobox } from "@/components/common/form/components/z-combobox";
import { ZInput } from "@/components/common/form/components/z-input";
import { ZTextarea } from "@/components/common/form/components/z-textarea";
import { useZodForm } from "@/components/common/form/use-zod-form";
import Form from "@/components/common/form/zod-form";
import type { CreateChallenge } from "@/server/api/routers/challenge/create-challenge";
import { createChallengeSchema } from "@/server/api/routers/challenge/create-challenge";
import { api } from "@/utils/api";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";

const Challenge = () => {
  const form = useZodForm({ schema: createChallengeSchema });
  const [hasRestrictions, setHasRestrictions] = useState(false);
  const createChallenge = api.challenge.create.useMutation();
  const { data: subjects } = api.subject.getAll.useQuery();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "restrictions",
  });
  const onSubmit = (values: CreateChallenge) => {
    createChallenge.mutate(values);
    console.log("🚀 ~ file: add-challenge.tsx:26 ~ onSubmit ~ values:", values);
  };
  const handleHasRestrictionsToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    if (value === hasRestrictions) return;
    if (value) {
      setHasRestrictions(value);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      append({});
    } else {
      setHasRestrictions(value);
      for (let i = 0; i < fields.length; i++) {
        remove(i);
      }
    }
  };
  if (!subjects) return null;
  return (
    <div className="flex flex-grow flex-col bg-slate-200">
      <div className="flex justify-center">
        <Form<CreateChallenge>
          logger
          form={form}
          onSubmit={onSubmit}
          className="w-full max-w-screen-2xl "
        >
          <div className="flex flex-col gap-4 ">
            <Controller
              name={"subjectId"}
              control={form.control}
              render={({ field }) => (
                <ZCombobox
                  {...field}
                  values={subjects.map((subject) => ({
                    id: subject.id,
                    name: subject.name,
                  }))}
                  errors={form.formState.errors}
                  register={form.register("subjectId")}
                  label="Subject:"
                  onChange={(value) => form.setValue("subjectId", value.id)}
                />
              )}
            />

            <div className="flex flex-col gap-4">
              <ZTextarea
                label="Problem:"
                errors={form.formState.errors}
                register={form.register("problem")}
              />
              <ZTextarea
                label="Solution:"
                errors={form.formState.errors}
                register={form.register("solution")}
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="mt-1 text-gray-700">Has Restrictions?</span>
              <ZInput
                type="checkbox"
                className="h-5 w-5"
                onChange={handleHasRestrictionsToggle}
              />
            </div>
            {hasRestrictions && (
              <div className="w-full">
                <div className="space-y-4 ">
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="w-[7%]">Label</th>
                        <th className="w-[30%]">Initial Row</th>
                        <th className="w-[25%]">Initial Col</th>
                        <th className="w-[8%]">Final Row</th>
                        <th className="w-[8%]">Final Col</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => {
                        return (
                          <RestrictionRow
                            key={field.id}
                            index={index}
                            form={form}
                            remove={remove}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="flex  justify-between gap-7 ">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm 
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Submit
              </button>
              <button
                type="button"
                className="inline-flex  w-full justify-center rounded-md border border-transparent bg-rose-600 py-2 px-4 text-sm font-medium text-white shadow-sm 
            hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};
export default Challenge;
