"use client";

import ChatUI from '../../components/Chat/ChatUI';
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import useAuth from '../../hooks/useAuth';

const Home = () => {
  const { currentUser } = useAuth();
  

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <DefaultLayout>
        <ChatUI currentUserId={currentUser.uid} />
      </DefaultLayout>
    </div>
  );
};

export default Home;