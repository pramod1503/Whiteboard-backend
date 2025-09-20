import { Room } from "../models/Room_model.js";

const createRoom = async (req, res) => {
    try {
        const room = new Room({ name: req.body.name, whiteboardState: [] });
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

const getRoom = async (req, res) => {
    try {
    const room = await Room.findById(req.params.id);
        if(!room) return res.status(404).json({error: 'Room Not Found'});
        res.status(200).json(room);
    } catch (error) {
       res.status(500).json({error: error.message});
    }
}


const deleteRoom = async (req, res) => {
    try {
     const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
}

const saveRoomState = async (req, res) => {
  try {
    const { whiteboardState } = req.body;
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { whiteboardState },
      { new: true, runValidators: true }
    );
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
    createRoom,
    getRoom,
    deleteRoom,
    saveRoomState
}
