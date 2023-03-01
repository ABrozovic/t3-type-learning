import { handleVoidPromise } from "@/utils/handle-void-promises";
import type { ComponentProps } from "react";
import type {
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import { FormProvider } from "react-hook-form";

type FormProps<
  T extends FieldValues,
  U extends FieldValues | undefined = undefined
> = Omit<ComponentProps<"form">, "onSubmit"> & {
  logger?: boolean;
  form: UseFormReturn<T>;
  onSubmit: U extends FieldValues ? SubmitHandler<U> : SubmitHandler<T>;
};

const Form = <T extends FieldValues>({
  form,
  onSubmit,
  logger,
  children,
  ...props
}: FormProps<T>) => {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={
          logger
            ? handleVoidPromise(form.handleSubmit(onSubmit, console.log))
            : handleVoidPromise(form.handleSubmit(onSubmit))
        }
        {...props}
      >
        <fieldset disabled={form.formState.isSubmitting}>{children}</fieldset>
      </form>
    </FormProvider>
  );
};

export default Form;
