import { Search, User } from "lucide-react";
import ChatItem from "../components/shared/ChatItem";

const chat = {
  name: "Alex Linderson",
  message: "How are you today",
  time: "2:30 PM",
  unread: 3,
  avatar: "H",
};

export default function ChatHome() {
  return (
    <>
      <div className="bg-[#000E08] pt-5">
        <div className="flex h-[15vh] justify-between items-center p-6 text-white">
          <div className="border-2 border-[#363F3B] rounded-full w-11 h-11 flex items-center justify-center bg-[#363F3B]">
            <Search></Search>
          </div>
          <p className="font-bold text-lg">Messages</p>
          <div className="border-2 border-[#363F3B] rounded-full w-11 h-11 flex items-center justify-center bg-[#363F3B]">
            <User></User>
          </div>
        </div>
        <div className="bg-white h-[85vh] pt-1 rounded-t-[20px] border">
          <div className="bg-slate-300 w-14 h-2 rounded-full mx-auto mt-4"></div>
          <ul className="">
            <ChatItem chat={chat} />
          </ul>
        </div>
      </div>
    </>
  );
}
