# Whiteboard Backend

A real-time collaborative whiteboard application backend built with Node.js, Express, Socket.IO, and MongoDB. This backend provides APIs for room management and real-time drawing synchronization.

## Features

- **Real-time Collaboration**: Multiple users can draw simultaneously on the same whiteboard
- **Room Management**: Create, join, and delete whiteboard rooms
- **State Persistence**: Save and restore whiteboard states
- **Active User Tracking**: Track number of active users in each room
- **Drawing Synchronization**: Real-time drawing data transmission between clients
- **Undo/Redo Support**: Synchronized undo/redo operations across all clients
- **Clear Board**: Synchronized board clearing functionality

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory and configure your environment variables:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
# Database Configuration
MONGODB_URL=mongodb://127.0.0.1:27017/whiteboard
DB_NAME=whiteboard

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 5000).

## API Endpoints

### Room Management

#### Create Room
- **POST** `/api/createRoom`
- **Body**: `{ "name": "Room Name" }`
- **Response**: Room object with generated ID

#### Get Room
- **GET** `/api/rooms/:id`
- **Response**: Room object with whiteboard state

#### Delete Room
- **DELETE** `/api/rooms/:id`
- **Response**: Success message

#### Save Room State
- **PUT** `/api/rooms/:id/save`
- **Body**: `{ "whiteboardState": [...] }`
- **Response**: Updated room object

## Socket.IO Events

### Client to Server Events

#### `join-room`
- **Data**: `{ roomId: string }`
- **Description**: Join a specific room for real-time collaboration

#### `drawing-data`
- **Data**: `{ roomId: string, line: object }`
- **Description**: Send drawing data to other users in the room

#### `save-state`
- **Data**: `{ roomId: string, whiteboardState: array }`
- **Description**: Save the current whiteboard state to the database

#### `undo-redo`
- **Data**: `{ roomId: string, state: object }`
- **Description**: Synchronize undo/redo operations across clients

#### `clear-board`
- **Data**: `{ roomId: string }`
- **Description**: Clear the whiteboard for all users in the room

### Server to Client Events

#### `active-users`
- **Data**: `number`
- **Description**: Current number of active users in the room

#### `receive-drawing`
- **Data**: `line object`
- **Description**: Receive drawing data from other users

#### `undo-redo-receive`
- **Data**: `state object`
- **Description**: Receive undo/redo state from other users

#### `clear-board-receive`
- **Description**: Notification to clear the board

## Database Schema

### Room Model
```javascript
{
  name: String (required),
  whiteboardState: [{
    points: [{
      x: Number,
      y: Number
    }]
  }]
}
```

## Project Structure

```
backend/
├── controllers/
│   └── roomController.js      # Room management logic
├── models/
│   └── Room_model.js         # MongoDB schema definitions
├── routes/
│   └── roomRoutes.js         # API route definitions
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── env.example              # Environment variables template
└── README.md                # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://127.0.0.1:27017/whiteboard` |
| `DB_NAME` | Database name | `whiteboard` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## Development

### Adding New Features

1. **New API Endpoints**: Add routes in `routes/roomRoutes.js` and corresponding controller functions in `controllers/roomController.js`

2. **New Socket Events**: Add event handlers in `server.js` within the `io.on('connection')` block

3. **Database Changes**: Update the Mongoose schema in `models/Room_model.js`

### Error Handling

The application includes comprehensive error handling for:
- Database connection failures
- Invalid room IDs
- Missing required fields
- Socket connection errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the repository.

