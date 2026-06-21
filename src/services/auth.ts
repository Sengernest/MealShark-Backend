import { usersRepository } from "../dataaccess/users";
import { ChangePasswordInput, User, UserInput } from "../types";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

function createToken(userId: number) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "3d" });
}

async function signup(
  userInput: UserInput,
): Promise<{ user: User; token: string }> {
  const hashedPassword = await bcrypt.hash(userInput.password, 10);
  const user = await usersRepository.createUser({
    ...userInput,
    password: hashedPassword,
  });
  const token = createToken(user.id);
  return { user, token };
}

async function login(
  userInput: UserInput,
): Promise<{ user: User; token: string }> {
  const user = await usersRepository.getUserByEmail(userInput.email);
  if (user && (await bcrypt.compare(userInput.password, user.password))) {
    const token = createToken(user.id);
    return { user, token };
  } else {
    throw new Error("Invalid credentials");
  }
}

async function getUserById(userId: number): Promise<User> {
  return usersRepository.getUser(userId);
}

async function changePassword(userId: number, changePasswordInput: ChangePasswordInput): Promise<User> {
  const user = await usersRepository.getUser(userId);
  if (await bcrypt.compare(changePasswordInput.currentPassword, user.password)) {
    const hashedPassword = await bcrypt.hash(changePasswordInput.newPassword, 10);
    return usersRepository.changePassword(userId, hashedPassword);
  } else {
    throw new Error("Wrong current password");
  }
}

export const authService = {
  signup,
  login,
  getUserById,
  changePassword
};
