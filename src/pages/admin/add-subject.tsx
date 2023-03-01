import { ZInput } from "@/components/common/form/components/z-input";
import { useZodForm } from "@/components/common/form/use-zod-form";
import Form from "@/components/common/form/zod-form";
import type { CreateSubject } from "@/server/api/routers/subject/create-subject";
import { subjectSchema } from "@/server/api/routers/subject/create-subject";
import { api } from "@/utils/api";

const Add = () => {
  const form = useZodForm({ schema: subjectSchema });
  const createSubject = api.subject.create.useMutation();
  const onSubmit = (values: CreateSubject) => {
    createSubject.mutate(values);
  };

  return (
    <div className="flex flex-grow flex-col bg-slate-200">
      <div className="flex justify-center">
        <Form
          form={form}
          onSubmit={onSubmit}
          className="w-full max-w-screen-2xl "
        >
          <div className="flex flex-col gap-4">
            <ZInput
              type="text"
              label="Slug:"
              errors={form.formState.errors}
              register={form.register("slug")}
            />
            <ZInput
              type="text"
              label="Name:"
              errors={form.formState.errors}
              register={form.register("name")}
            />
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
export default Add;
