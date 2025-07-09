import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkSignin = async () => {
  const user = await currentUser();

  if (!user) {
    return false;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return true;
    }
    else
    {
        return false;
    }
  } catch (error) {
    console.log(error.message);
  }
};