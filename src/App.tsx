import { useEffect, useMemo, useState } from "react";
import { RiSendPlaneFill } from "react-icons/ri";
import { BiSolidLike } from "react-icons/bi";
import { BiLike } from "react-icons/bi";
import { BiDislike } from "react-icons/bi";
import { BiSolidDislike } from "react-icons/bi";
import { v4 as uuidv4 } from "uuid";

function App() {
  const userId = useMemo(() => {
    const id = (Math.random() * 10000).toString();
    return id;
  }, []);

  console.log(userId);
  const GUEST_ID_KEY = "my_app_guest_id";
  const roomId = "1";
  const [input, setInput] = useState("");
  const [connection, setConnection] = useState<WebSocket>();

  const [messages, setMessages] = useState<
    Array<{ name: string; userId: string; message: string }>
  >([]);

  const handleSend = (e: any) => {
    e.preventDefault();

    // const userId = localStorage.getItem(GUEST_ID_KEY);

    connection?.send(
      JSON.stringify({
        type: "SEND_MESSAGE",
        payload: {
          roomId,
          userId: userId,
          message: input,
        },
      })
    );

    // setMessages((prev) => [...prev, newMessage]);

    setInput("");
  };

  // const getOrSetGuestId = (): string => {
  //   let guestId = localStorage.getItem(GUEST_ID_KEY);

  //   if (!guestId) {
  //     guestId = (Math.random() * 10000).toString(); // Generate a new unique ID
  //     localStorage.setItem(GUEST_ID_KEY, guestId);
  //   }
  //   return guestId;
  // };

  useEffect(() => {
    // Create a new WebSocket connection.
    // const guestId = getOrSetGuestId();
    const ws = new WebSocket("ws://localhost:8080", ["echo-protocol"]);

    // --- 1. Set up event listeners ---
    ws.onopen = () => {
      console.log("WebSocket connection established.");
      // Send a join room message upon connection
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: {
            name: "Madhav",
            userId,
            roomId,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      // Assuming the server sends back messages in the same format
      const receivedMessage = JSON.parse(event.data);
      console.log(receivedMessage);
      const { payload, type } = receivedMessage;

      if (type === "ADD_CHAT") {
        console.log(payload);
        setMessages((prev) => [
          ...prev,
          {
            name: payload.name,
            userId: payload?.userId,
            message: payload?.message,
          },
        ]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    // Set the connection object in state
    setConnection(ws);

    // --- 2. Cleanup function ---
    // This function will be called when the component unmounts.
    return () => {
      console.log("Closing WebSocket connection.");
      ws.close();
    };
  }, []);

  return (
    <div className="grid grid-cols-4 w-full h-screen bg-blue-950 p-4 gap-4 ">
      <div className="col-span-4 max-h-full h-full bg-white/20 rounded-2xl flex flex-col gap-4 justify-between p-4 overflow-hidden border border-white/20">
        <div
          className="SCREEN flex-1 rounded-2xl flex flex-col gap-2 overflow-y-auto"
          ref={(el) => {
            if (el) {
              el.scrollTop = el.scrollHeight;
            }
          }}
        >
          {messages &&
            messages.map((item, i) => (
              <MessageCard
                key={i}
                name={item?.name}
                message={item?.message}
                isYou={item?.userId === userId}
              />
            ))}
        </div>
        <form
          onSubmit={handleSend}
          className="h-[50px] bg-white/20 rounded-2xl flex p-2 pl-4 gap-4 text-white placeholder:text-white border border-white/20"
        >
          <input
            placeholder="Type something here..."
            onChange={(e) => setInput(e.target.value)}
            value={input}
            className="w-full focus:outline-none"
          />
          <button
            type="submit"
            className="h-full px-4 rounded-2xl text-white bg-gray-400 cursor-pointer"
          >
            <RiSendPlaneFill />
          </button>
        </form>
      </div>
      {/* <div className="bg-white/20 rounded-2xl border border-white/20"></div>
      <div className="bg-white/20 rounded-2xl border border-white/20"></div> */}
    </div>
  );
}

export default App;

const MessageCard = ({
  name,
  message,
  isYou,
}: {
  name: string;
  message: string;
  isYou: boolean;
}) => {
  return (
    <div
      className={`w-fit max-w-3/4 rounded-2xl flex flex-col p-3 gap-1 shadow-sm ${
        isYou ? "ml-auto bg-amber-600/80" : "bg-white/20"
      }`}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex gap-1 items-center">
          <div className="h-4 w-4 rounded-4xl bg-white text-[10px] flex justify-center items-center font-semibold">
            {name[0]}
          </div>
          <p className="text-[14px] font-semibold text-white">
            {isYou ? "You" : name}
          </p>
        </div>
        <div className="VOTES flex text-white gap-3 items-center">
          <button className="cursor-pointer">
            <BiDislike />
          </button>
          <button className="cursor-pointer">
            <BiLike />
          </button>
        </div>
      </div>
      <p className="text-[14px] text-blue-100">{message}</p>
    </div>
  );
};
