import { IUser } from "../user";

import { Schema, model, Document, Types } from "mongoose";
const uniqueValidator = require("mongoose-unique-validator");

export interface IAppointment extends Document {
  customer: string | Types.ObjectId | IUser;
  dateStart: Date;
  dateEnd: Date;
  note: string;
}

const appointmentSchema = new Schema<IAppointment>({
  customer: { type: Types.ObjectId, required: true, ref: "User" },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  note: { type: String, required: false },
});

appointmentSchema.plugin(uniqueValidator);

export default model<IAppointment>("Appointment", appointmentSchema);
