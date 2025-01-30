import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Stage, Layer, Rect } from "react-konva";
import { io } from "socket.io-client";

interface Shape {
  _id: string;
  shape_type: string;
  color: string;
  data: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

const Whiteboard = () => {
  const { boardCode } = useParams();
  const [whiteboard, setWhiteboard] = useState<any>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedColor, setSelectedColor] = useState("#FF0000");

  // Fetch whiteboard & shapes from MongoDB
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL);

    async function fetchData() {
      try {
        const boardRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/whiteboards/${boardCode}`
        );
        setWhiteboard(boardRes.data.whiteboard);

        const shapesRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/whiteboards/${boardCode}/shapes`
        );
        setShapes(shapesRes.data.shapes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
    socket.emit("join_room", { whiteboard_id: boardCode });

    socket.on("join_room_response", (data) => {
      console.log("join_room_response:", data);
    });

    // Listen for new shapes from server
    socket.on("shape_created", (newShape) => {
      setShapes((prevShapes) => [...prevShapes, newShape]);
    });

    return () => {
      socket.disconnect();
    };
  }, [boardCode]);

  const addRectangle = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add_shape`, {
        user_id: localStorage.getItem("user_id"),
        board_code: boardCode,
        shape_type: "rectangle",
        color: selectedColor,
        data: { x1: 200, y1: 200, x2: 300, y2: 250 },
      });
      // Server will broadcast new shape via Socket.IO
    } catch (error) {
      console.log("Error adding shape:", error);
    }
  };

  // Handle Dragging (onDragEnd)
  // const handleDragEnd = async (shapeId: string, e: any) => {
  //   const updatedShape = shapes.find(shape => shape._id === shapeId);
  //   if (!updatedShape) return;

  //   // Update shape coordinates
  //   const newShapeData = {
  //     ...updatedShape,
  //     data: {
  //       x1: e.target.x(),
  //       y1: e.target.y(),
  //       x2: e.target.x() + 100,
  //       y2: e.target.y() + 50
  //     }
  //   };

  //   // Update local state
  //   setShapes(prevShapes => prevShapes.map(shape => shape._id === shapeId ? newShapeData : shape));

  //   // Send update to server & broadcast to other clients
  //   const socket = io(import.meta.env.VITE_BACKEND_URL);
  //   socket.emit("update_shape", { board_code: boardCode, shape: newShapeData });

  //   try {
  //     await axios.post(`${import.meta.env.VITE_BACKEND_URL}/update_shape`, {
  //       _id: shapeId,
  //       data: newShapeData.data
  //     });
  //   } catch (error) {
  //     console.error("Error updating shape:", error);
  //   }
  // };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Whiteboard: {boardCode}</h2>
      {whiteboard && (
        <p className="mb-4">
          Owner: {whiteboard.owner_id} | Created:{" "}
          {new Date(whiteboard.created_at).toLocaleString()}
        </p>
      )}

      <div className="flex space-x-4 mb-4">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-10 h-10 cursor-pointer"
        />
        <button
          onClick={addRectangle}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Rectangle
        </button>
      </div>

      {/* Canvas */}
      <Stage width={600} height={500} className="border bg-white">
        <Layer>
          {shapes.map((shape) => (
            <Rect
              key={shape._id}
              x={shape.data.x1}
              y={shape.data.y1}
              width={shape.data.x2 - shape.data.x1}
              height={shape.data.y2 - shape.data.y1}
              fill={shape.color}
              // draggable
              shadowBlur={10}
              // onDragEnd={(e) => handleDragEnd(shape._id, e)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Whiteboard;
