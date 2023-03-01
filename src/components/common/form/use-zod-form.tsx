import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormProps } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type UseZodFormProps<TSchema extends z.ZodType> = Exclude<
  UseFormProps<z.infer<TSchema>>,
  "resolver"
> & {
  schema: TSchema;
};

export const useZodForm = <TSchema extends z.ZodType>({
  schema,
  ...formProps
}: UseZodFormProps<TSchema>) =>
  useForm({ ...formProps, resolver: zodResolver(schema) });
