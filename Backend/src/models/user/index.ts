import { Roles } from "../../authorization";

import { Schema, model, Document } from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Roles;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: [
      {
        type: String,
        enum: Object.values(Roles),
      },
    ],
    default: [Roles.user],
  },
});

userSchema.plugin(uniqueValidator);

export default model<IUser>("User", userSchema);
