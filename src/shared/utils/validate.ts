import { getServerSession } from "next-auth";
import { authOptions } from "../config/auth";
import { NextRequest, NextResponse } from "next/server";

export const validateUserRequest = async (request: NextRequest) => {

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return {
    ...session.user
  };
};