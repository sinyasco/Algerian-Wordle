import { z } from "zod";
export const username = z.string().trim().min(3).max(24).regex(/^[\p{L}\p{N}_-]+$/u);
export const password = z.string().min(8).max(72).regex(/[A-Za-z\p{L}]/u).regex(/\d/);
export const signupSchema = z.object({ username, password, uiLanguage:z.enum(["en","fr","ar"]).default("en") });
export const loginSchema = z.object({ username, password });
export const gameStartSchema = z.object({ language:z.enum(["arabic","arabizi"]) });
export const gameGuessSchema = z.object({ sessionId:z.string().cuid(), guess:z.string().trim().min(1).max(16) });
