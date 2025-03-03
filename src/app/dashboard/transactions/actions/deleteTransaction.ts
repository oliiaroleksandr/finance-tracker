"use server";

import { db } from "@/db";
import { transactions } from "@/db/schema";
import { qstashClient } from "@/lib/qstash";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { inArray } from "drizzle-orm";

export const deleteTransaction = async (ids: string[]) => {
  try {
    const { isAuthenticated, getUser } = getKindeServerSession();

    if (!(await isAuthenticated())) {
      throw new Error("Unauthorized");
    }

    const user = await getUser();

    await db.delete(transactions).where(inArray(transactions.id, ids));

    // await qstashClient.publishJSON({
    //   url: `https://localhost:3000/api/tracker`,
    //   body: { userId: user.id },
    // });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
