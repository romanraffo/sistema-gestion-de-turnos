import prisma from "../lib/prisma";

export const getAllUsers = async () => {
  return await prisma.user.findMany();
};