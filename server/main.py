# server.py
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from pymongo import MongoClient
from flask_cors import CORS 
import eventlet

eventlet.monkey_patch()

app = Flask(__name__)
app.config["SECRET_KEY"] = "some_random_secret_key"

# Enable CORS for your frontend origin
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Initialize Flask-SocketIO with CORS allowed for all origins (for development)
socketio = SocketIO(app, cors_allowed_origins="*")

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["my_whiteboard_db"]

@app.route("/ping", methods=["GET"])
def ping():
    print("Client pinged")
    return jsonify({"message": "pong"}), 200

@app.route("/testdb", methods=["GET"])
def test_db():
    test_collection = db["test_collection"]
    # Insert a simple doc
    result = test_collection.insert_one({"test_key": "test_value"})
    # Retrieve it back
    doc = test_collection.find_one({"_id": result.inserted_id})
    return jsonify({"inserted_document": str(doc)}), 200

# Socket.IO event
@socketio.on("pingEvent")
def handle_ping_event(data):
    print("Received pingEvent with data:", data)
    # Respond with a "pongEvent"
    emit("pongEvent", {"message": "pong from server"})

if __name__ == "__main__":
    # Start the Flask-SocketIO server on port 5000
    socketio.run(app, host="0.0.0.0", port=5001, debug=True)