"use client";

import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ref, onValue, push, set } from 'firebase/database';
import { db, rtdb } from '../../../firebaseconfig';

interface ChatUIProps {
  currentUserId: string;
}

const ChatUI: React.FC<ChatUIProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [messages, setMessages] = useState<{ id: string; text: string; senderId: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const [cleanKey, setCleanKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, name: data.name || 'Unknown', role: data.role || 'Unknown' };
      });
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Manually extract the 'key' parameter from the URL
    const queryParams = new URLSearchParams(window.location.search);
    const key = queryParams.get('key');
    
    if (key) {
      // Split the key into the two user IDs
      const [user1, user2] = key.split('_');
      
      // Set the cleanKey to be the ID of the other user
      if (user1 !== currentUserId) {
        setCleanKey(user1); // Set the cleanKey to user1's ID
      } else {
        setCleanKey(user2); // Set the cleanKey to user2's ID
      }

      // Find and set the selected user if found
      const selected = users.find(user => user.id === cleanKey);
      if (selected) {
        setSelectedUser(selected);
      }
    }
  }, [users, currentUserId, cleanKey]);

  useEffect(() => {
    if (selectedUser) {
      console.log('Selected user:', selectedUser);
      const chatPath = [currentUserId, selectedUser.id].sort().join('_');
      const messagesRef = ref(rtdb, `messages/${chatPath}`);
      onValue(messagesRef, (snapshot) => {
        const messagesData = snapshot.val();
        const messagesList = messagesData ? Object.keys(messagesData).map(key => ({
          id: key,
          text: messagesData[key].text,
          senderId: messagesData[key].senderId
        })) : [];
        setMessages(messagesList);
      });
    }
  }, [selectedUser, currentUserId]);

  const handleSendMessage = () => {
    if (selectedUser && newMessage.trim()) {
      const chatPath = [currentUserId, selectedUser.id].sort().join('_');
      const messageRef = push(ref(rtdb, `messages/${chatPath}`));
      set(messageRef, {
        text: newMessage,
        senderId: currentUserId
      });

      // Update chat preview
      const chatPreviewPath = [currentUserId, selectedUser.id].sort().join('_');
      const chatPreviewRef = ref(rtdb, `chatPreviews/${chatPreviewPath}`);
      set(chatPreviewRef, {
        lastMessage: newMessage,
        senderId: currentUserId,
      });

      setNewMessage('');
    }
  };

  const handleScroll = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.classList.add('scrolling');
      clearTimeout((chatWindowRef.current as any).scrollTimeout);
      (chatWindowRef.current as any).scrollTimeout = setTimeout(() => {
        chatWindowRef.current?.classList.remove('scrolling');
      }, 1000);
    }
  };

  const filteredUsers = users
    .filter(user => user.id !== currentUserId)
    .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <div className="flex h-full">
        <div className="w-1/3 bg-gray-100 p-4 flex flex-col border-r border-gray-300">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="p-2 border-b cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div>{user.name}</div>
                <div className="text-sm text-gray-500">{user.role}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-2/3 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4">
                <div className="inline-block rounded bg-gray-200 p-2">Chat with {selectedUser.name}</div>
              </div>
              <div
                className="flex-1 p-4 overflow-y-auto chat-window"
                onScroll={handleScroll}
                ref={chatWindowRef}
              >
                {messages.map(message => (
                  <div key={message.id} className={`p-2 ${message.senderId === currentUserId ? 'text-right' : 'text-left'}`}>
                    {message.text}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 p-4 overflow-y-auto text-center text-gray-500">Select a user to start chatting</div>
          )}
          <div className="p-4 border-t">
            <input
              type="text"
              placeholder="Type a message"
              className="w-full p-2 border rounded"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatUI;
