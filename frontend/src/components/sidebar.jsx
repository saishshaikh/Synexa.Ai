// src/components/Sidebar.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Plus,
  Menu,
  X,
  Settings,
  LogOut,
  MessageSquare,
  Trash2,
  Edit2,
  Search,
} from "lucide-react";

import useGetConversations from "../hooks/useGetConversations";

import {
  setCurrentConversation,
  fetchConversationById,
  deleteConversation,
} from "../redux/conversationSlice";

import { logout } from "../redux/userSlice";
import Api from "../utils/axios";

const Sidebar = () => {
  const dispatch = useDispatch();

  // =========================
  // LOCAL STATES
  // =========================

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // =========================
  // REDUX
  // =========================

  const { user } = useSelector((state) => state.user);

  const currentConversation = useSelector(
    (state) => state.conversations.currentConversation
  );

  // =========================
  // GET CONVERSATIONS
  // =========================

  const {
    conversations,
    loading,
    error,
    refetch,
  } = useGetConversations();

  // =========================
  // DEVICE DETECTION
  // =========================

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  // =========================
  // CLOSE MOBILE MENU
  // =========================

  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  // =========================
  // SEARCH
  // =========================

  const filteredConversations = conversations.filter((conv) => {
    const title = conv?.title || "";

    return title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  // =========================
  // DATE HELPERS
  // =========================

  const getConversationDate = (conv) => {
    const rawDate =
      conv?.createdAt ||
      conv?.updatedAt ||
      conv?.date;

    if (!rawDate) {
      return "Today";
    }

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return "Today";
    }

    return date.toISOString().split("T")[0];
  };

  const formatDate = (date) => {
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayString = today.toISOString().split("T")[0];
    const yesterdayString = yesterday
      .toISOString()
      .split("T")[0];

    if (date === todayString) {
      return "Today";
    }

    if (date === yesterdayString) {
      return "Yesterday";
    }

    const parsedDate = new Date(date);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    return date;
  };

  // =========================
  // GROUP CONVERSATIONS
  // =========================

  const groupedConversations = filteredConversations.reduce(
    (groups, conv) => {
      const date = getConversationDate(conv);

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(conv);

      return groups;
    },
    {}
  );

  // =========================
  // NEW CHAT
  // =========================
  // IMPORTANT:
  // Yahan API call nahi hogi.
  // First message send hone par conversation create hogi.

  const handleNewChat = () => {
    dispatch(setCurrentConversation(null));

    setSearchTerm("");

    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // =========================
  // SELECT OLD CHAT
  // =========================

  const handleSelectChat = (conv) => {
    const conversationId = conv?._id || conv?.id;

    if (!conversationId) {
      console.error("Conversation ID missing:", conv);
      return;
    }

    // Existing conversation ko Redux me load karo
    dispatch(fetchConversationById(conversationId));

    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // =========================
  // DELETE CHAT
  // =========================

  const handleDeleteChat = async (e, conv) => {
    e.stopPropagation();

    const conversationId = conv?._id || conv?.id;

    if (!conversationId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(conversationId);

      await dispatch(
        deleteConversation(conversationId)
      ).unwrap();

      // Agar deleted chat current chat thi
      const currentId =
        currentConversation?._id ||
        currentConversation?.id;

      if (currentId === conversationId) {
        dispatch(setCurrentConversation(null));
      }

      // Sidebar refresh
      refetch();
    } catch (err) {
      console.error(
        "Failed to delete conversation:",
        err
      );

      alert(
        typeof err === "string"
          ? err
          : "Failed to delete conversation"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // EDIT CHAT
  // =========================

  const handleEditChat = (e, conv) => {
    e.stopPropagation();

    const conversationId =
      conv?._id || conv?.id;

    if (!conversationId) {
      return;
    }

    const oldTitle =
      conv?.title || "New Chat";

    const newTitle = window.prompt(
      "Enter new conversation title:",
      oldTitle
    );

    if (!newTitle?.trim()) {
      return;
    }

    // NOTE:
    // Agar tum updateConversation ko use karna chahte ho,
    // is function ko Redux se dispatch kar sakte ho.
    //
    // Abhi simple alert diya hai taaki
    // accidental API call na ho.

    alert(
      "Edit title API ko updateConversation ke through connect karna hai."
    );
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await Api.post("/api/auth/firebase-logout");

      dispatch(logout());
      dispatch(setCurrentConversation(null));

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);

      dispatch(logout());

      window.location.href = "/login";
    }
  };

  // =========================
  // USER DATA
  // =========================

  const userName =
    user?.name || "User Name";

  const userEmail =
    user?.email || "user@email.com";

  const userAvatar =
    user?.avatar;

  // =========================
  // CURRENT CONVERSATION ID
  // =========================

  const currentConversationId =
    currentConversation?._id ||
    currentConversation?.id;

  // =========================
  // UI
  // =========================

  return (
    <>
      {/* =====================================
          MOBILE MENU BUTTON
      ===================================== */}

      <button
        onClick={() =>
          setIsMobileMenuOpen(
            !isMobileMenuOpen
          )
        }
        className={`
          md:hidden fixed z-50 p-2.5
          bg-white dark:bg-gray-800
          rounded-xl shadow-lg
          border border-sky-200
          dark:border-purple-500/20
          hover:shadow-xl
          transition-all duration-300
          ${
            isMobileMenuOpen
              ? "top-4 left-[280px]"
              : "top-3 left-3"
          }
        `}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <div
        className={`
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:translate-x-0

          fixed md:relative
          top-0 left-0

          w-[280px] sm:w-72
          h-screen

          bg-white dark:bg-[#0f172a]

          border-r
          border-sky-200/50
          dark:border-purple-500/20

          transition-all duration-300
          ease-in-out

          flex flex-col

          z-40

          shadow-2xl
          md:shadow-none
        `}
      >
        {/* =====================================
            HEADER
        ===================================== */}

        <div
          className="
            flex items-center justify-between
            px-3 py-3
            border-b
            border-sky-200/50
            dark:border-purple-500/20
            bg-white
            dark:bg-[#0f172a]
          "
        >
          <div className="flex items-center gap-2.5">
            <div
              className="
                w-8 h-8
                rounded-lg
                bg-gradient-to-r
                from-sky-500
                to-purple-500
                flex items-center justify-center
                shadow-md
                shadow-sky-500/25
                flex-shrink-0
              "
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 3v4M3 5h4m3-4l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>

            <span
              className="
                text-base
                font-bold
                bg-gradient-to-r
                from-sky-600
                to-purple-600
                bg-clip-text
                text-transparent
              "
            >
              Synexa.AI
            </span>
          </div>
        </div>

        {/* =====================================
            NEW CHAT
        ===================================== */}

        <div className="p-2.5 bg-white dark:bg-[#0f172a]">
          <button
            onClick={handleNewChat}
            className="
              w-full
              flex items-center
              justify-center
              gap-2
              px-3 py-2.5
              rounded-xl

              bg-gradient-to-r
              from-sky-500
              to-purple-500

              hover:from-sky-600
              hover:to-purple-600

              text-white
              font-medium

              transition-all
              duration-300

              shadow-md
              hover:shadow-lg

              group
              text-sm
            "
          >
            <Plus
              className="
                w-4 h-4
                group-hover:rotate-90
                transition-transform
                duration-300
              "
            />

            <span>New Chat</span>
          </button>
        </div>

        {/* =====================================
            SEARCH
        ===================================== */}

        <div
          className="
            px-2.5 pb-2.5
            bg-white
            dark:bg-[#0f172a]
          "
        >
          <div className="relative">
            <Search
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                w-3.5 h-3.5
                text-gray-400
                dark:text-gray-500
              "
            />

            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="
                w-full

                pl-8 pr-2
                py-1.5

                text-xs

                bg-sky-50/50
                dark:bg-gray-800

                border
                border-sky-200/50
                dark:border-purple-500/20

                rounded-xl

                focus:outline-none

                focus:ring-2
                focus:ring-sky-500/50
                dark:focus:ring-purple-500/50

                transition-all
                duration-200

                placeholder:text-gray-400
                dark:placeholder:text-gray-500

                text-gray-900
                dark:text-white
              "
            />
          </div>
        </div>

        {/* =====================================
            CONVERSATIONS
        ===================================== */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-2.5
            pb-2.5
            space-y-2
            sidebar-scroll

            bg-white
            dark:bg-[#0f172a]
          "
        >
          {/* LOADING */}

          {loading && (
            <div className="text-center py-6">
              <div
                className="
                  w-6 h-6
                  border-2
                  border-purple-500
                  border-t-transparent
                  rounded-full
                  animate-spin
                  mx-auto
                "
              />

              <p className="text-xs text-gray-400 mt-2">
                Loading...
              </p>
            </div>
          )}

          {/* ERROR */}

          {error && !loading && (
            <div className="text-center py-6">
              <p className="text-xs text-red-500">
                Error: {error}
              </p>

              <button
                onClick={refetch}
                className="
                  mt-2
                  text-xs
                  text-blue-500
                  hover:text-blue-600
                "
              >
                Retry
              </button>
            </div>
          )}

          {/* CONVERSATIONS */}

          {!loading &&
            !error &&
            Object.keys(groupedConversations).length >
              0 &&
            Object.entries(
              groupedConversations
            ).map(([date, convs]) => (
              <div key={date}>
                {/* DATE */}

                <p
                  className="
                    text-[10px]
                    font-semibold
                    text-gray-400
                    dark:text-gray-500

                    mb-1.5
                    px-1
                  "
                >
                  {formatDate(date)}
                </p>

                <div className="space-y-0.5">
                  {convs.map((conv) => {
                    const conversationId =
                      conv?._id ||
                      conv?.id;

                    const isActive =
                      currentConversationId ===
                      conversationId;

                    const isDeleting =
                      deletingId ===
                      conversationId;

                    return (
                      <div
                        key={conversationId}
                        className="group relative"
                      >
                        <div
                          className={`
                            w-full

                            flex items-center
                            gap-2

                            px-2 py-2

                            rounded-xl

                            transition-all
                            duration-200

                            ${
                              isActive
                                ? `
                                  bg-sky-100
                                  dark:bg-purple-900/40
                                  `
                                : `
                                  hover:bg-sky-50
                                  dark:hover:bg-purple-900/30
                                  `
                            }
                          `}
                        >
                          {/* CHAT SELECT */}

                          <button
                            onClick={() =>
                              handleSelectChat(conv)
                            }
                            className="
                              flex items-center
                              gap-2
                              min-w-0
                              flex-1
                              text-left
                            "
                          >
                            <MessageSquare
                              className={`
                                w-3.5 h-3.5
                                flex-shrink-0

                                ${
                                  isActive
                                    ? `
                                      text-sky-600
                                      dark:text-purple-400
                                      `
                                    : `
                                      text-gray-400
                                      group-hover:text-sky-500
                                      dark:group-hover:text-purple-400
                                      `
                                }
                              `}
                            />

                            <span
                              className={`
                                text-xs
                                truncate
                                flex-1

                                ${
                                  isActive
                                    ? `
                                      font-medium
                                      text-gray-900
                                      dark:text-white
                                      `
                                    : `
                                      text-gray-700
                                      dark:text-gray-300
                                      `
                                }
                              `}
                              title={
                                conv?.title ||
                                "New Chat"
                              }
                            >
                              {conv?.title ||
                                "New Chat"}
                            </span>
                          </button>

                          {/* ACTION BUTTONS */}

                          <div
                            className="
                              flex
                              gap-0.5
                              opacity-0
                              group-hover:opacity-100
                              transition-opacity
                            "
                          >
                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={(e) =>
                                handleEditChat(
                                  e,
                                  conv
                                )
                              }
                              className="
                                p-1
                                hover:bg-gray-200
                                dark:hover:bg-gray-700
                                rounded-lg
                                transition-colors
                              "
                              title="Edit"
                            >
                              <Edit2
                                className="
                                  w-3 h-3
                                  text-gray-400
                                  hover:text-gray-600
                                  dark:hover:text-gray-300
                                "
                              />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={(e) =>
                                handleDeleteChat(
                                  e,
                                  conv
                                )
                              }
                              disabled={isDeleting}
                              className="
                                p-1
                                hover:bg-red-100
                                dark:hover:bg-red-900/30
                                rounded-lg
                                transition-colors
                                disabled:opacity-50
                              "
                              title="Delete"
                            >
                              {isDeleting ? (
                                <div
                                  className="
                                    w-3 h-3
                                    border
                                    border-red-500
                                    border-t-transparent
                                    rounded-full
                                    animate-spin
                                  "
                                />
                              ) : (
                                <Trash2
                                  className="
                                    w-3 h-3
                                    text-gray-400
                                    hover:text-red-500
                                    dark:hover:text-red-400
                                  "
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          {/* NO CONVERSATIONS */}

          {!loading &&
            !error &&
            Object.keys(groupedConversations)
              .length === 0 && (
              <div className="text-center py-6">
                <MessageSquare
                  className="
                    w-6 h-6
                    text-gray-300
                    dark:text-gray-600
                    mx-auto
                    mb-2
                  "
                />

                <p
                  className="
                    text-xs
                    text-gray-400
                    dark:text-gray-500
                  "
                >
                  No conversations found
                </p>

                <p
                  className="
                    text-[10px]
                    text-gray-400
                    dark:text-gray-500
                    mt-1
                  "
                >
                  Start a new chat to begin
                </p>
              </div>
            )}
        </div>

        {/* =====================================
            USER PROFILE
        ===================================== */}

        <div
          className="
            border-t
            border-sky-200/50
            dark:border-purple-500/20

            p-2.5

            hover:bg-sky-50/50
            dark:hover:bg-purple-900/20

            transition-colors
            duration-200

            bg-white
            dark:bg-[#0f172a]
          "
        >
          <div className="flex items-center gap-2.5">
            {/* AVATAR */}

            <div
              className="
                w-7 h-7
                rounded-full

                bg-gradient-to-r
                from-sky-500
                to-purple-500

                flex items-center
                justify-center

                text-white
                font-semibold
                text-[10px]

                shadow-md
                shadow-sky-500/25

                flex-shrink-0
                overflow-hidden
              "
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Avatar"
                  className="
                    w-full
                    h-full
                    object-cover
                  "
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";

                    if (
                      e.currentTarget
                        .parentElement
                    ) {
                      e.currentTarget.parentElement.innerText =
                        userName
                          ?.charAt(0)
                          ?.toUpperCase() ||
                        "U";
                    }
                  }}
                />
              ) : (
                userName
                  ?.charAt(0)
                  ?.toUpperCase() || "U"
              )}
            </div>

            {/* USER INFO */}

            <div
              className="
                flex-1
                min-w-0
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-gray-700
                  dark:text-gray-200
                  truncate
                "
              >
                {userName}
              </p>

              <p
                className="
                  text-[10px]
                  text-gray-400
                  dark:text-gray-500
                  truncate
                "
              >
                {userEmail}
              </p>
            </div>

            {/* SETTINGS + LOGOUT */}

            <div className="flex gap-0.5">
              <button
                type="button"
                className="
                  p-1
                  hover:bg-sky-100
                  dark:hover:bg-purple-900/30
                  rounded-lg
                  transition-all
                  duration-200
                  hover:scale-110
                "
                title="Settings"
              >
                <Settings
                  className="
                    w-3.5 h-3.5
                    text-gray-500
                    dark:text-gray-400
                    hover:text-sky-500
                    dark:hover:text-purple-400
                  "
                />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  p-1
                  hover:bg-red-100
                  dark:hover:bg-red-900/30
                  rounded-lg
                  transition-all
                  duration-200
                  hover:scale-110
                "
                title="Logout"
              >
                <LogOut
                  className="
                    w-3.5 h-3.5
                    text-gray-500
                    dark:text-gray-400
                    hover:text-red-500
                    dark:hover:text-red-400
                  "
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      {isMobileMenuOpen && (
        <div
          className="
            fixed
            inset-0
            bg-black/40
            backdrop-blur-sm
            z-30
            md:hidden
          "
          onClick={() =>
            setIsMobileMenuOpen(false)
          }
        />
      )}
    </>
  );
};

export default Sidebar;