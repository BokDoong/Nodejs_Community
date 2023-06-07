import { validationResult } from "express-validator";

export const validatorErrorChecker = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {  //에러가 있으면 400 Error
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}