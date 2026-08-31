// components/MessageBubbles.jsx
const MessageBubbles = ({ message }) => {
    const content = message?.content || message?.text || message?.message || "";

    return (
        <div
            className={`flex ${
                message.role === "user"
                    ? "justify-end"
                    : "justify-start"
            } mb-3`}
        >
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === "user"
                        ? "bg-sky-600 text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700"
                }`}
            >
                {content}
            </div>
        </div>
    );
};

export default MessageBubbles;