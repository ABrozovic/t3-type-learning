import { z } from "zod";

export const slugSchema = z.object({ slug: z.string() });
export const idSchema = z.object({ id: z.string() });
