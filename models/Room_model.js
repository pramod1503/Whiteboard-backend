import mongoose,{Schema} from "mongoose";

const PointSchema = new Schema ({
    x: Number,
    y: Number
});

const LineSchema = new Schema({
    points: [PointSchema]
});

const RoomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    whiteboardState: [LineSchema],
    creatorId: {
        type: String,
        required: true
    }
});

export const Room = mongoose.model("Room", RoomSchema);