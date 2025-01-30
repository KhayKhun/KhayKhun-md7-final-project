# server.py
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit, join_room
from pymongo import MongoClient, ASCENDING
from flask_cors import CORS
from datetime import datetime
from bson.objectid import ObjectId

app = Flask(__name__)
app.config["SECRET_KEY"] = "some_random_secret_key"

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
socketio = SocketIO(app, cors_allowed_origins="*")

MONGO_URI = "mongodb://127.0.0.1:27017/test"
client = MongoClient(MONGO_URI)
db = client.white_board_app

# Define Collections
users_collection = db.users
whiteboards_collection = db.whiteboards
shapes_collection = db.shapes

# Create Indexes for Efficient Queries
users_collection.create_index([("username", ASCENDING)], unique=True)
whiteboards_collection.create_index([("board_code", ASCENDING)], unique=True)
shapes_collection.create_index([("whiteboard_id", ASCENDING)])
shapes_collection.create_index([("user_id", ASCENDING)])
shapes_collection.create_index([("z", ASCENDING)])

# Testing purpose
@app.route("/ping", methods=["GET"])
def ping():
    print("Client pinged")
    return jsonify({"message": "pong"}), 200

@socketio.on("pingEvent")
def handle_ping_event(data):
    print("Received pingEvent with data:", data)
    emit("pongEvent", {"message": "pong from server"}, broadcast=True)

# Auth Register
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password are required."}), 400

    if users_collection.find_one({"username": username}):
        return jsonify({"message": "Username already exists."}), 409

    password_hash = password

    user_id = users_collection.insert_one({
        "username": username,
        "password_hash": password_hash,
        "created_at": datetime.utcnow()
    }).inserted_id

    return jsonify({"message": "User registered successfully.", "user_id": str(user_id)}), 201


@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()
    print("data:", data)
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password are required."}), 400
    user = users_collection.find_one({"username": username})
    if not user or user["password_hash"] != password:
        return jsonify({"message": "Invalid username or password."}), 401

    return jsonify({"message": "Login successful.", "user_id": str(user["_id"])}), 200


# Many whiteboards / Create new whiteboard
@app.route("/whiteboards", methods=["POST", "GET"])
def create_whiteboard():
    if request.method == "POST":
        data = request.get_json()
        owner_id = data.get("owner_id")

        if not owner_id:
            return jsonify({"message": "Owner ID is required."}), 400

        import string
        import random

        def generate_board_code(length=6):
            return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

        board_code = generate_board_code()
        while whiteboards_collection.find_one({"board_code": board_code}):
            board_code = generate_board_code()

        whiteboard_id = whiteboards_collection.insert_one({
            "board_code": board_code,
            "owner_id": owner_id,
            "created_at": datetime.utcnow()
        }).inserted_id

        return jsonify({"message": "Whiteboard created.", "board_code": board_code, "whiteboard_id": str(whiteboard_id)}), 201

    elif request.method == "GET":
        try:
            whiteboards_cursor = whiteboards_collection.find()
            whiteboards = []
            for wb in whiteboards_cursor:
                wb['_id'] = str(wb['_id'])
                wb['owner_id'] = str(wb['owner_id'])
                wb['created_at'] = wb['created_at']
                whiteboards.append(wb)

            return jsonify(whiteboards), 200
        except Exception as e:
            print("Exception in GET /whiteboards:", e)
            return jsonify({"message": "Failed to retrieve whiteboards."}), 500

@app.route("/get_username/<shape_id>", methods=["GET"])
def get_username(shape_id):
    try:
        shape = shapes_collection.find_one(
            {"_id": ObjectId(shape_id)})
        user_id = shape["user_id"]

        user = users_collection.find_one(
            {"_id": ObjectId(user_id)})        
        return jsonify({"username" : user["username"]}), 200
    except:
        return jsonify({"username" : ""}), 400


# Single Whiteboard
@app.route("/whiteboards/<board_code>", methods=["GET"])
def join_whiteboard(board_code):

    whiteboard = whiteboards_collection.find_one({"board_code": board_code})
    if not whiteboard:
        return jsonify({"message": "Whiteboard not found."}), 404

    whiteboard["_id"] = str(whiteboard["_id"])
    whiteboard["owner_id"] = str(whiteboard["owner_id"])
    whiteboard["created_at"] = whiteboard["created_at"]

    return jsonify({"whiteboard": whiteboard}), 200

# Many Shapes form a Whiteboard
@app.route("/whiteboards/<board_code>/shapes", methods=["GET"])
def get_shapes(board_code):
    whiteboard = whiteboards_collection.find_one({"board_code": board_code})
    if not whiteboard:
        return jsonify({"message": "Whiteboard not found."}), 404

    shapes = list(shapes_collection.find(
        {"board_code": board_code}).sort("z", 1))
    for shape in shapes:
        shape["_id"] = str(shape["_id"])
    return jsonify({"shapes": shapes}), 200

# Create/Insert new shape
@app.route("/add_shape", methods=["POST"])
def add_shape():
    data = request.json
    # print(data)
    # {'board_code': '0OHTOQ', 'shape_type': 'rectangle', 'color': '#FF0000',
    #     'data': {'x1': 200, 'y1': 200, 'x2': 300, 'y2': 250}}
    board_code = data.get("board_code")
    shape_type = data.get("shape_type")
    color = data.get("color")
    user_id = data.get("user_id")
    shape_data = data.get("data")

    if not all([board_code, shape_type, color, shape_data]):
        return jsonify({"message": "Missing shape data"}), 400

    shape = {
        "board_code": board_code,
        "shape_type": shape_type,
        "color": color,
        "user_id": user_id,
        "data": shape_data,
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        res = shapes_collection.insert_one(shape)
        shape["_id"] = str(res.inserted_id)  # Convert ObjectId to string

        socketio.emit("shape_created", shape, to=board_code)

        return jsonify({"message": "Shape added", "shape": shape}), 201
    except Exception as e:
        print("Error on inserting shape:", e)
        return jsonify({"message": "bruh"}), 500


# Update Shape Position
@app.route("/update_shape", methods=["PATCH"])
def update_shape_api():
    data = request.json
    shape_id = data.get("_id")
    new_data = data.get("data")

    if not shape_id or not new_data:
        return jsonify({"message": "Missing shape ID or data"}), 400
    res = shapes_collection.update_one(
        {"_id": ObjectId(shape_id)}, {"$set": {"data": new_data}})

    return jsonify({"message": "Shape updates are stored in mongodb"}), 200


# Socket.io essentials
@socketio.on("join_room")
def handle_join_room(data):
    print("client joined room")
    whiteboard_id = data.get("whiteboard_id")
    if whiteboard_id:
        join_room(whiteboard_id)
        emit("join_room_response", {
             "message": f"Joined room {whiteboard_id}."})
    else:
        emit("join_room_response", {
             "message": "Whiteboard ID is required to join a room."})

@socketio.on("update_shape")
def update_shape_socket(data):
    try:
        socketio.emit("update_shape_response", data, to=data["board_code"])
    except:
        print("Error on updating shape")

@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5002, debug=True)
