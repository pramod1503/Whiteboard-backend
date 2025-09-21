import { Room } from "../models/Room_model.js";

const createRoom = async (req, res) => {
    try {
        const creatorId = req.body.creatorId || 'anonymous';
        console.log(`Creating room with name: ${req.body.name}, creatorId: ${creatorId}`);
        const room = new Room({ 
            name: req.body.name, 
            whiteboardState: [],
            creatorId: creatorId
        });
        await room.save();
        console.log(`Room created successfully with ID: ${room._id}`);
        console.log(`Full room object:`, JSON.stringify(room, null, 2));
        
        // Verify the room was actually saved by querying it back
        const savedRoom = await Room.findById(room._id);
        console.log(`Verification - Room exists in DB:`, savedRoom ? 'YES' : 'NO');
        if (savedRoom) {
            console.log(`Verification - Room data:`, JSON.stringify(savedRoom, null, 2));
        }
        
        res.status(201).json(room);
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({error: error.message});
    }
}

const getRoom = async (req, res) => {
    try {
        console.log(`Attempting to find room with ID: ${req.params.id}`);
        const room = await Room.findById(req.params.id);
        console.log(`Room found:`, room ? 'Yes' : 'No');
        if(!room) {
            console.log(`Room with ID ${req.params.id} not found in database`);
            return res.status(404).json({error: 'Room Not Found'});
        }
        res.status(200).json(room);
    } catch (error) {
        console.error(`Error finding room ${req.params.id}:`, error);
        res.status(500).json({error: error.message});
    }
}


const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ error: 'Room not found' });
        
        const creatorId = req.body.creatorId || req.query.creatorId;
        
        // Check if the user is the creator
        if (room.creatorId !== creatorId) {
            return res.status(403).json({ error: 'Only the room creator can delete this room' });
        }
        
        // Delete the room
        await Room.findByIdAndDelete(req.params.id);
        
        // Emit room-deleted event to all users in the room
        req.io.to(req.params.id).emit('room-deleted', { 
            message: 'Room has been deleted by the creator',
            roomId: req.params.id 
        });
        
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
