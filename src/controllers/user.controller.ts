import type { Request, Response } from "express";
import { getAllUsers } from "../services/user.service";

export const getUsers = async (req: Request, res: Response) => {
  const users = await getAllUsers();

  return res.status(200).json(users);
};