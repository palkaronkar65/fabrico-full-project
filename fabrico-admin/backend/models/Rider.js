import mongoose from "mongoose";

const riderSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // plain for now
  name: { type: String, required: true }
});

const Rider = mongoose.model("Rider", riderSchema);

export default Rider;
