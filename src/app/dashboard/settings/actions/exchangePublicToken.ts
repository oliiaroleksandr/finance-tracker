"use server";

import { plaidClient } from "@/lib/plaid";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { populateBankData } from "./populateBankData";
import { syncData } from "./syncData";
import { addAccounts } from "./addAccounts";

export const exchangePublicToken = async (publicToken: string) => {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();

    if (!(await isAuthenticated())) {
      throw new Error("User is not authenticated");
    }

    const user = await getUser();

    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const tokenData = tokenResponse.data;

    const itemId = await populateBankData({
      itemId: tokenData.item_id,
      accessToken: tokenData.access_token,
      userId: user.id,
    });

    if (itemId) {
      await addAccounts(tokenData.access_token, itemId);
    }

    await syncData(tokenData.item_id);
  } catch (error) {
    console.log("Error exchanging public token", error);
    throw error;
  }
};
