import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

export class UpdateUserDTO {
  name;
  phoneNumber;
  email;
  password;
  description;

  constructor(user){
    this.name = user.name;
    this.phoneNumber = user.phoneNumber;
    this.email = user.email;
    this.password = user.password;
    this.description = user.description;
  }

  async updatePassword() {
    this.password = await bcrypt.hash(password, process.env.PASSWORD_SALT);
  }
}