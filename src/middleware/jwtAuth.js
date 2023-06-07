import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import database from "../database";
dotenv.config();

export const jwtAuth = async (req, res, next) => {
  try {
    const headers = req.headers;
    const authorization = headers["authorization"] || headers["Authorization"];
     // Authorization: "Bearer ${token}" or "bearer ${token}" or "undefined"

    if (
      authorization?.includes("Bearer") ||
      authorization?.includes("bearer")
    ) {
      if (typeof authorization === "string") {
        //bearers : ["Bearer", "token ~~~"]
        const bearers = authorization.split(" ");
        if (bearers.length === 2 && typeof bearers[1] === "string") {
          const accessToken = bearers[1];

          //디코딩
          const decoded = jwt.verify(accessToken, process.env.JWT_KEY);
          const user = await database.user.findUnique({
            where: {
              id: decoded.id,
            },
          });

          //request에 찾은 user 넣기
          if (user) {
            req.user = user;
          } else {
            req.user = undefined;
          }

          next();
        } else {
          next({ status: 400, message: "Authorization Fail" });
        }
      } else {
        next({ status: 400, message: "Authorization Fail" });
      }
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};