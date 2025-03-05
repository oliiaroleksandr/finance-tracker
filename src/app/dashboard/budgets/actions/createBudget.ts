"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import {
  createBudgetSchema,
  CreateBudgetSchema,
} from "../validations/createBudgetSchema";

import { budgets } from "@/db/schema";
import { db } from "@/db";

export const createBudget = async (data: CreateBudgetSchema) => {
  const result = createBudgetSchema.safeParse(data);

  if (!result.success) {
    throw new Error(result.error.toString());
  }

  try {
    const { isAuthenticated, getUser } = getKindeServerSession();

    if (!(await isAuthenticated())) {
      throw new Error("Unauthorized");
    }

    const user = await getUser();

    const budget = await db
      .insert(budgets)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        title: result.data.title,
        description: result.data.description,
        targetAmount: result.data.targetAmount.toString(),
        currentAmount: (result.data.currentAmount || 0).toString(),
        endDate: result.data.endDate?.toString(),
        startDate: result.data.startDate?.toString(),
        categoryId: result.data.categoryId,
      })
      .returning();

    return budget;
  } catch (error) {
    console.log("Error creating budget", error);
    throw error;
  }
};
