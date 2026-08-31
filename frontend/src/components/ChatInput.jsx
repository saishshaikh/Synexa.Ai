import React, { useState } from "react";
import useMessageSend from "../hooks/useMessageSend";

const ChatInput = () => {
  const [prompt, setPrompt] = useState("");

  const {
    sendMessage,
    sending,
    isCreating,
    error,
  } = useMessageSend();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    const text = prompt;

    setPrompt("");

    await sendMessage(text);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask Synexa.AI..."
        disabled={sending || isCreating}
        className="flex-1 border rounded-lg px-4 py-3"
      />

      <button
        type="submit"
        disabled={sending || isCreating || !prompt.trim()}
        className="px-5 py-3 rounded-lg bg-black text-white disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send"}
      </button>

    </form>
  );
};

export default ChatInput;