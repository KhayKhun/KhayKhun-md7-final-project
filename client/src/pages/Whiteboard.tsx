import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Stage, Layer, Rect, Text, Circle } from "react-konva";
import { io, Socket } from "socket.io-client";

interface Shape {
  _id: string;
  shape_type: string;
  user_id: string;
  color: string;
  data: ShapeData;
}

interface ShapeData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const Whiteboard = () => {
  const { boardCode } = useParams();
  const [whiteboard, setWhiteboard] = useState<any>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [username, setUsername] = useState("");
  const [hoveredShape, setHoveredShape] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const stageRef = useRef<any>(null);

  const handleDownload = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `whiteboard_${boardCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function handleMouseOver(shapeId: string) {
    try {
      const userRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/get_username/${shapeId}`
      );
      console.log(userRes);
      setUsername(userRes.data.username);
    } catch {
      setUsername("");
    }
  }
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
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_BACKEND_URL);

      socketRef.current.emit("join_room", { whiteboard_id: boardCode });

      socketRef.current.on("join_room_response", (data) => {
        console.log("Joined room:", data);
      });

      socketRef.current.on("shape_created", (newShape) => {
        setShapes((prevShapes) => [...prevShapes, newShape]);
      });

      socketRef.current.on("update_shape_response", (data) => {
        setShapes((prevShapes) =>
          prevShapes.map((shape) =>
            shape._id === data.shape.shapeId
              ? { ...shape, data: data.shape.data }
              : shape
          )
        );
      });
    }

    // Fetch data on mount
    fetchData();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [boardCode]);

  const addRectangle = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add_shape`, {
        user_id: sessionStorage.getItem("user_id"),
        board_code: boardCode,
        shape_type: "rectangle",
        color: selectedColor,
        data: { x1: 200, y1: 200, x2: 250, y2: 250 },
      });
    } catch (error) {
      console.log("Error adding shape:", error);
    }
  };
  const addCircle = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add_shape`, {
        user_id: sessionStorage.getItem("user_id"),
        board_code: boardCode,
        shape_type: "circle",
        color: selectedColor,
        data: { x1: 200, y1: 200, x2: 250, y2: 250 },
      });
    } catch (error) {
      console.log("Error adding shape:", error);
    }
  };

  const updateSingleShape = async (shapeId: string, data: ShapeData) => {
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/update_shape`, {
        _id: shapeId,
        data,
      });
    } catch (error) {
      console.log("Error adding shape:", error);
    }
  };

  const handleDragEnd = async (shapeId: string, e: any) => {
    // console.log(
    //   `Dragging shape ${shapeId} to (${e.target.x()}, ${e.target.y()})`
    // );

    const updatedData: ShapeData = {
      x1: e.target.x(),
      y1: e.target.y(),
      x2: e.target.x() + 50,
      y2: e.target.y() + 50,
    };

    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape._id === shapeId ? { ...shape, data: updatedData } : shape
      )
    );

    await updateSingleShape(shapeId, updatedData);

    if (socketRef.current) {
      socketRef.current.emit("update_shape", {
        board_code: boardCode,
        shape: { shapeId, data: updatedData },
      });
    }
  };

  return (
    <div className="p-6 bg-neutral-50 min-h-screen flex flex-col items-center">
      <h2 className="text-3xl font-bold text-primary-600 mb-4">
        Whiteboard: {boardCode}
      </h2>
      {whiteboard && (
        <p className="mb-4 text-neutral-500 text-sm">
          Owner: {whiteboard.owner_id} | Created:{" "}
          {new Date(whiteboard.created_at).toLocaleString()}
        </p>
      )}

      <div className="flex space-x-4 mb-4">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-12 h-12 border rounded-lg cursor-pointer shadow-md"
        />
        <button
          onClick={addRectangle}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 shadow-md"
        >
          Add Rectangle
        </button>
        <button
          onClick={addCircle}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 shadow-md"
        >
          Add Circle
        </button>
      </div>

      {/* Canvas */}
      <div className="border border-primary-500 bg-white rounded-lg shadow-lg p-4">
        <Stage
          ref={stageRef}
          width={600}
          height={500}
          className="border bg-white"
        >
          <Layer>
            {shapes.map((shape) => {
              if (shape.shape_type === "rectangle") {
                return (
                  <Rect
                    key={shape._id}
                    x={shape.data.x1}
                    y={shape.data.y1}
                    width={shape.data.x2 - shape.data.x1}
                    height={shape.data.y2 - shape.data.y1}
                    fill={shape.color}
                    draggable
                    shadowBlur={5}
                    onDragEnd={(e) => handleDragEnd(shape._id, e)}
                    onMouseOver={(e) => {
                      setHoveredShape({
                        id: shape._id,
                        x: e.target.x(),
                        y: e.target.y() - 20,
                      });
                      handleMouseOver(shape._id);
                    }}
                    onMouseLeave={() => setHoveredShape(null)}
                  />
                );
              } else if (shape.shape_type === "circle") {
                return (
                  <Circle
                    key={shape._id}
                    x={shape.data.x1}
                    y={shape.data.y1}
                    radius={25}
                    fill={shape.color}
                    draggable
                    shadowBlur={5}
                    onDragEnd={(e) => handleDragEnd(shape._id, e)}
                    onMouseOver={(e) => {
                      setHoveredShape({
                        id: shape._id,
                        x: e.target.x(),
                        y: e.target.y() - 20,
                      });
                      handleMouseOver(shape._id);
                    }}
                    onMouseLeave={() => setHoveredShape(null)}
                  />
                );
              }
            })}

            {/* Show tooltip if hovering */}
            {username && hoveredShape && (
              <Text
                text={username}
                fontSize={14}
                fill="black"
                x={hoveredShape.x}
                y={hoveredShape.y}
                padding={5}
                align="center"
                verticalAlign="middle"
              />
            )}
          </Layer>
        </Stage>
      </div>
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md"
      >
        Download Whiteboard
      </button>
    </div>
  );
};

export default Whiteboard;
