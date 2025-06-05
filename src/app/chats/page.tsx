"use client"

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseClient";
import Link from "next/link";

export default function ChatsPage() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const tempMessage = message;
    if (!user || !message.trim()) return;
    setMessage("");
    await addDoc(collection(db, "chats"), {
      text: tempMessage,
      user: user.displayName || user.email,
      userId: user.uid,
      createdAt: new Date(),
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow p-8 flex flex-col min-h-[400px] items-center justify-center relative">
      <div className="absolute top-4 left-4 z-10">
        <Link href="/" className="flex items-center text-blue-600 hover:underline">
          <span className="mr-2 text-2xl">&#8592;</span>
          <span className="font-semibold">Go back home</span>
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6 mt-8">ShopSmart Forum</h1>
      <div className="w-full flex flex-col gap-2 bg-white rounded-lg shadow p-4 min-h-[300px] max-h-[400px] overflow-y-auto mb-6">
        {loading ? (
          <div>Loading...</div>
        ) : chats.length === 0 ? (
          <div className="text-gray-500">No messages yet.</div>
        ) : (
          chats.map(chat => {
            const isCurrentUser = user && chat.userId === user.uid;
            return (
              <div
                key={chat.id}
                className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`flex flex-col px-3 py-2 rounded-lg max-w-xs break-words ${isCurrentUser ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`}
                >
                  <span className={`font-semibold text-xs mb-1 ${isCurrentUser ? 'text-blue-700' : 'text-gray-700'}`}>{chat.user}</span>
                  <span className="text-sm">{chat.text}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
      {user ? (
        <form onSubmit={handleSend} className="w-full flex gap-2">
          <input
            className="flex-1 px-3 py-2 border rounded-lg"
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            disabled={!message.trim()}
          >
            Send
          </button>
        </form>
      ) : (
        <div className="text-gray-500">Please <Link href="/auth" className="text-blue-600 underline">sign in</Link> to chat.</div>
      )}
    </div>
  );
}
