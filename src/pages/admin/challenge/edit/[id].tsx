import { ZCombobox } from "@/components/common/form/components/z-combobox";
import { ZInput } from "@/components/common/form/components/z-input";
import { ZTextarea } from "@/components/common/form/components/z-textarea";
import { useZodForm } from "@/components/common/form/use-zod-form";
import Form from "@/components/common/form/zod-form";
import { idSchema } from "@/components/common/schema/query";
import { getSSGProxy } from "@/lib/ssg-helper";
import type { UpdateChallenge } from "@/server/api/routers/challenge/update-challenge";
import { updateChallengeSchema } from "@/server/api/routers/challenge/update-challenge";
import { api } from "@/utils/api";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { Controller, useFieldArray } from "react-hook-form";

type EditChallengeProps = Required<
  InferGetServerSidePropsType<typeof getServerSideProps>
>;
const EditChallenge = ({ id }: EditChallengeProps) => {
  const { data: challenge } = api.challenge.get.useQuery({ id });
  const form = useZodForm({
    schema: updateChallengeSchema,
    defaultValues: {
      id,
      name: challenge?.name,
      problem: challenge?.problem,
      solution: challenge?.solution,
      subjectId: challenge?.subjectId as string,
    },
  });
  const updateChallenge = api.challenge.update.useMutation();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "restrictions",
  });
  const onSubmit = (values: UpdateChallenge) => {
    updateChallenge.mutate(values);
  };
  if (!challenge) return null;
  return (
    <div className="flex flex-grow flex-col bg-slate-200">
      <div className="flex justify-center">
        <Form<UpdateChallenge>
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
                  values={[
                    {
                      id: challenge.subjectId as string,
                      name: challenge.Subject?.name as string,
                    },
                  ]}
                  defaultFirst
                  errors={form.formState.errors}
                  register={form.register("subjectId")}
                  label="Subject:"
                  onChange={(value) => form.setValue("subjectId", value.id)}
                />
              )}
            />

            <div className="flex flex-col gap-4">
              <ZInput
                type="text"
                label="Name:"
                errors={form.formState.errors}
                register={form.register("name")}
              />
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
              <ZInput type="checkbox" className="h-5 w-5" />
            </div>

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

export default EditChallenge;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const query = ctx.query;
  const ssg = await getSSGProxy(ctx);
  const data = idSchema.safeParse(query);
  if (!data.success) return { props: {} };
  const { id } = data.data;
  await ssg.challenge.get.fetch({ id });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};
