import { Roles } from "../../authorization";

import { Schema, model } from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");

interface User {
  name: string;
  email: string;
  password: string;
  role: Roles;
}

const userSchema = new Schema<User>({
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

export default model<User>("User", userSchema);
