Here’s a comprehensive `README.md` for your Realtime Whiteboard application. It includes an overview, setup instructions, features, and a detailed explanation of how the app works.

---

# **Realtime Whiteboard Application**

Welcome to the **Realtime Whiteboard Application**! This is a collaborative drawing tool that allows multiple users to draw and interact on a shared whiteboard in real-time. Built with **React** for the frontend, **Flask** for the backend, and **MongoDB** for the database, this application leverages **Socket.IO** for real-time communication.

---

## **Features**

- **Real-Time Collaboration**: Multiple users can draw on the same whiteboard simultaneously.
- **Shapes**: Add rectangles and circles to the whiteboard.
- **Color Picker**: Choose colors for your shapes.
- **Drag and Drop**: Move shapes around the canvas.
- **Download**: Save the whiteboard as an image.
- **Tooltips**: Hover over shapes to see the creator's username.
- **User Authentication**: Register and login to access the whiteboard.

---

## **Technologies Used**

- **Frontend**: React, Tailwind CSS, React-Konva, React-Icons
- **Backend**: Flask, Flask-SocketIO
- **Database**: MongoDB
- **Real-Time Communication**: Socket.IO

---

## **How It Works**

### **1. User Authentication**
- **Register**: Users can create an account by providing a username and password.
- **Login**: Registered users can log in to access the whiteboard.

### **2. Whiteboard Management**
- **Create Whiteboard**: Users can create a new whiteboard with a unique `board_code`.
- **Join Whiteboard**: Users can join an existing whiteboard using the `board_code`.

### **3. Shape Management**
- **Add Shapes**: Users can add rectangles and circles to the whiteboard.
- **Update Shapes**: Users can drag and drop shapes to update their positions.
- **Real-Time Updates**: All changes are broadcasted to all users in the same whiteboard room.

### **4. Download Whiteboard**
- Users can download the current state of the whiteboard as an image.

### **5. Tooltips**
- Hover over a shape to see the username of the user who created it.

---

## **Application Workflow**

### **1. User Authentication**
#### **Register**
1. **Client** → Sends a POST request to `/register` with `username` and `password`.
2. **Server** → Validates the input and checks if the username already exists in the database.
3. **Database** → Inserts a new user into the `users` collection.
4. **Server** → Returns a success message and the `user_id` to the client.

#### **Login**
1. **Client** → Sends a POST request to `/login` with `username` and `password`.
2. **Server** → Validates the credentials against the `users` collection.
3. **Database** → Returns the user data if credentials match.
4. **Server** → Returns a success message and the `user_id` to the client.

### **2. Whiteboard Management**
#### **Create Whiteboard**
1. **Client** → Sends a POST request to `/whiteboards` with the `owner_id`.
2. **Server** → Generates a unique `board_code` and inserts a new whiteboard into the `whiteboards` collection.
3. **Database** → Stores the whiteboard data.
4. **Server** → Returns the `board_code` and `whiteboard_id` to the client.

#### **Join Whiteboard**
1. **Client** → Sends a GET request to `/whiteboards/<board_code>`.
2. **Server** → Fetches the whiteboard data from the `whiteboards` collection.
3. **Database** → Returns the whiteboard data.
4. **Server** → Sends the whiteboard data to the client.

### **3. Shape Management**
#### **Add Shape**
1. **Client** → Sends a POST request to `/add_shape` with:
   - `board_code`
   - `shape_type` (rectangle/circle)
   - `color`
   - `user_id`
   - `data` (coordinates)
2. **Server** → Validates the input and inserts the shape into the `shapes` collection.
3. **Database** → Stores the shape data.
4. **Server** → Emits a `shape_created` event via Socket.IO to all clients in the room.
5. **Client** → Receives the `shape_created` event and updates the UI.

#### **Update Shape Position**
1. **Client** → Sends a PATCH request to `/update_shape` with:
   - `_id` (shape ID)
   - `data` (new coordinates)
2. **Server** → Updates the shape data in the `shapes` collection.
3. **Database** → Stores the updated shape data.
4. **Server** → Emits an `update_shape_response` event via Socket.IO to all clients in the room.
5. **Client** → Receives the `update_shape_response` event and updates the UI.

### **4. Real-Time Collaboration**
#### **Join Room**
1. **Client** → Emits a `join_room` event via Socket.IO with the `whiteboard_id`.
2. **Server** → Adds the client to the Socket.IO room for the whiteboard.
3. **Server** → Emits a `join_room_response` event to confirm the client has joined the room.

#### **Shape Updates**
1. **Client** → Emits an `update_shape` event via Socket.IO with:
   - `board_code`
   - `shapeId`
   - `data` (new coordinates)
2. **Server** → Emits an `update_shape_response` event to all clients in the room.
3. **Client** → Receives the `update_shape_response` event and updates the UI.

### **5. Download Whiteboard**
1. **Client** → Triggers the `handleDownload` function to capture the canvas as an image.
2. **Client** → Creates a download link for the image and prompts the user to save it.

### **6. Fetching Data**
#### **Fetch Whiteboards**
1. **Client** → Sends a GET request to `/whiteboards`.
2. **Server** → Fetches all whiteboards from the `whiteboards` collection.
3. **Database** → Returns the list of whiteboards.
4. **Server** → Sends the whiteboard list to the client.

#### **Fetch Shapes**
1. **Client** → Sends a GET request to `/whiteboards/<board_code>/shapes`.
2. **Server** → Fetches all shapes for the given `board_code` from the `shapes` collection.
3. **Database** → Returns the list of shapes.
4. **Server** → Sends the shape list to the client.

### **7. Tooltip for Shape Creator**
1. **Client** → Triggers `handleMouseOver` when hovering over a shape.
2. **Client** → Sends a GET request to `/get_username/<shape_id>`.
3. **Server** → Fetches the username from the `users` collection using the `user_id` associated with the shape.
4. **Database** → Returns the username.
5. **Server** → Sends the username to the client.
6. **Client** → Displays the username as a tooltip.

---

## **Setup Instructions**

### **Prerequisites**
- Node.js and npm (for frontend)
- Python 3.x (for backend)
- MongoDB (for database)

### **Frontend Setup**
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### **Backend Setup**
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```bash
   python main.py
   ```

### **Database Setup**
1. Ensure MongoDB is running locally or update the `MONGO_URI` in `main.py` to point to your MongoDB instance.

---

## **Future Enhancements**
- Add more shape types (e.g., lines, polygons).
- Implement undo/redo functionality.
- Add user roles (e.g., admin, viewer).
- Improve UI/UX with animations and transitions.

---

## **Contributing**
Contributions are welcome! Please open an issue or submit a pull request.

---

## **License**
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to customize this `README.md` further to suit your needs! Let me know if you need additional sections or details. 😊