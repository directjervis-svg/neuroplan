import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { validateBirthDate } from "../utils/ageValidation";

export const usersRouter = router({
  updateBirthDate: protectedProcedure
    .input(z.object({
      birthDate: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const validation = validateBirthDate(input.birthDate);
      
      if (!validation.valid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: validation.error
        });
      }
      
      const birthDate = new Date(input.birthDate);
      
      await ctx.db
        .update(users)
        .set({
          birthDate: birthDate,
          ageVerified: true
        })
        .where(eq(users.id, ctx.user.id));
      
      return { success: true };
    }),
});
