import { atom } from "jotai";
import type { User } from "../users/user.entity";

export const currentUserAtom = atom<User>();