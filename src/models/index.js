import {AuthController} from "./auth";
import {UserController, UserSwagger} from "./users";
import { PostController } from "./posts";

export const Controllers = [AuthController, UserController, PostController];
export const Swaggers = {
  UserSwagger,
};