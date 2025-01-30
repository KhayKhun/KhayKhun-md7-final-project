import random
import string
from bson.objectid import ObjectId
# server.py
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from pymongo import MongoClient, ASCENDING
from flask_cors import CORS 
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

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

@app.route("/generate_test_data", methods=["POST"])
def generate_test_data():
    """
    Generate a random user, whiteboard, and 20 lines drawn by that user.
    """
    try:
        # Generate Random Username and Password
        username = "user_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
        password = "password123"

        # Hash password
        password_hash = generate_password_hash(password)

        # Insert user into the database
        user_id = users_collection.insert_one({
            "username": username,
            "password_hash": password_hash,
            "created_at": datetime.utcnow()
        }).inserted_id

        # Generate a unique 6-character board_code
        def generate_board_code(length=6):
            return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

        board_code = generate_board_code()
        while whiteboards_collection.find_one({"board_code": board_code}):
            board_code = generate_board_code()

        # Insert whiteboard into the database
        whiteboard_id = whiteboards_collection.insert_one({
            "board_code": board_code,
            "owner_id": user_id,
            "created_at": datetime.utcnow()
        }).inserted_id

        # Generate 20 random lines
        shapes = []
        for _ in range(20):
            shape = {
                "whiteboard_id": whiteboard_id,
                "user_id": user_id,
                "shape_type": "line",
                "color": random.choice(["#FF0000", "#00FF00", "#0000FF", "#FFA500"]),
                "data": {
                    "x1": random.randint(50, 400),
                    "y1": random.randint(50, 400),
                    "x2": random.randint(50, 400),
                    "y2": random.randint(50, 400)
                },
                "z": random.randint(1, 100),
                "created_at": datetime.utcnow()
            }
            shapes.append(shape)

        # Insert shapes into the database
        shapes_collection.insert_many(shapes)

        return jsonify({
            "message": "Test data generated successfully",
            "user": {"id": str(user_id), "username": username},
            "whiteboard": {"id": str(whiteboard_id), "board_code": board_code},
            "shapes_count": len(shapes)
        }), 201

    except Exception as e:
        return jsonify({"message": f"Error generating test data: {str(e)}"}), 500
    


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5002, debug=True)