import {Router} from "express";
import {
    createRoom,
    getRoom,
    deleteRoom,
    saveRoomState,
    getAllRooms
} from "../controllers/roomController.js";


const router = Router();

router.route("/createRoom").post(createRoom);

router.route("/rooms").get(getAllRooms);

router.route("/rooms/:id").get(getRoom);

router.route("/rooms/:id").delete(deleteRoom);

router.route("/rooms/:id/save").put(saveRoomState);

export default router;