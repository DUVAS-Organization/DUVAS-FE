import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";

const RealtimeContext = createContext();

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error("useRealtime must be used within a RealtimeProvider");
    }
    return context;
};

export const RealtimeProvider = ({ children }) => {
    const savedPostConnectionRef = useRef(null);
    const chatConnectionRef = useRef(null);
    const [isSavedPostConnected, setIsSavedPostConnected] = useState(false);
    const [isChatConnected, setIsChatConnected] = useState(false);
    const [userId, setUserId] = useState(null);

    // Hàm kết nối socket
    const connectSocket = (uid, hubType = "savedPost") => {
        if (!uid) return;

        const token = localStorage.getItem("authToken");
        if (!token) {
            // console.error("No token found in localStorage. Cannot connect to SignalR.");
            return;
        }

        if (hubType === "savedPost" && !savedPostConnectionRef.current) {
            const hubUrl = `http://apiduvas1.runasp.net/savedPostHub?access_token=${token}`;
            savedPostConnectionRef.current = new HubConnectionBuilder()
                .withUrl(hubUrl, { withCredentials: true })
                .withAutomaticReconnect()
                .build();

            savedPostConnectionRef.current
                .start()
                .then(() => {
                    // console.log(`SignalR connected to SavedPostHub for user ${uid}`);
                    setIsSavedPostConnected(true);
                    setUserId(uid);
                })
                .catch((err) => {
                    // console.error("SignalR connection error (SavedPostHub):", err);
                });

            savedPostConnectionRef.current.onclose((err) => {
                setIsSavedPostConnected(false);
                setUserId(null);
                if (err) {
                    // console.error("SignalR connection closed with error (SavedPostHub):", err);
                } else {
                    // console.log("SignalR connection closed (SavedPostHub).");
                }
            });
        }

        if (hubType === "chat" && !chatConnectionRef.current) {
            const hubUrl = `http://apiduvas1.runasp.net/chathub?access_token=${token}`;
            chatConnectionRef.current = new HubConnectionBuilder()
                .withUrl(hubUrl, { withCredentials: true })
                .withAutomaticReconnect()
                .build();

            chatConnectionRef.current
                .start()
                .then(() => {
                    // console.log(`SignalR connected to ChatHub for user ${uid}`);
                    setIsChatConnected(true);
                    setUserId(uid);
                })
                .catch((err) => {
                    // console.error("SignalR connection error (ChatHub):", err);
                });

            chatConnectionRef.current.onclose((err) => {
                setIsChatConnected(false);
                setUserId(null);
                if (err) {
                    // console.error("SignalR connection closed with error (ChatHub):", err);
                } else {
                    // console.log("SignalR connection closed (ChatHub).");
                }
            });
        }
    };

    // Hàm ngắt kết nối
    const disconnectSocket = (hubType = "savedPost") => {
        if (hubType === "savedPost" && savedPostConnectionRef.current) {
            savedPostConnectionRef.current.stop();
            savedPostConnectionRef.current = null;
            setIsSavedPostConnected(false);
            setUserId(null);
        }
        if (hubType === "chat" && chatConnectionRef.current) {
            chatConnectionRef.current.stop();
            chatConnectionRef.current = null;
            setIsChatConnected(false);
            setUserId(null);
        }
    };

    // Đăng ký sự kiện
    const onEvent = (eventName, callback, hubType = "savedPost") => {
        const connection = hubType === "savedPost"
            ? savedPostConnectionRef.current
            : chatConnectionRef.current;
        if (connection) {
            connection.on(eventName, callback);
        }
    };

    // Huỷ đăng ký sự kiện
    const offEvent = (eventName, callback, hubType = "savedPost") => {
        const connection = hubType === "savedPost"
            ? savedPostConnectionRef.current
            : chatConnectionRef.current;
        if (connection) {
            connection.off(eventName, callback);
        }
    };

    // Gọi hàm trên server
    const emitEvent = (eventName, data, hubType = "savedPost") => {
        const connection = hubType === "savedPost"
            ? savedPostConnectionRef.current
            : chatConnectionRef.current;
        if (connection) {
            connection.invoke(eventName, data).catch((err) =>
                console.error(`Error invoking ${eventName} on ${hubType}:`, err)
            );
        }
    };

    // Khi component unmount, ngắt kết nối
    useEffect(() => {
        return () => {
            disconnectSocket("savedPost");
            disconnectSocket("chat");
        };
    }, []);
    useEffect(() => {
        if (isChatConnected && userId) {
            setTimeout(() => {
                emitEvent("RegisterUser", Number(userId), "chat");
            }, 500);
        }
    }, [isChatConnected, userId]);

    return (
        <RealtimeContext.Provider
            value={{
                connectSocket,
                disconnectSocket,
                onEvent,
                offEvent,
                emitEvent,
                isSavedPostConnected,
                isChatConnected,
                userId,
            }}
        >
            {children}
        </RealtimeContext.Provider>
    );
};
