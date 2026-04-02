import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ActivityType {
  id: number;
  user_name: string;
  action: string;
  location?: string;
  timestamp: string;
}

interface ActivityContextType {
  liveActivities: ActivityType[];
  friendActivityCount: number;
  ephemeralContent: any[];
  updateMyActivity: (activity: any) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType>({
  liveActivities: [],
  friendActivityCount: 0,
  ephemeralContent: [],
  updateMyActivity: async () => {},
});

export const ActivityProvider = ({ children, currentUser }: { children: ReactNode; currentUser: any }) => {
  const [liveActivities, setLiveActivities] = useState<ActivityType[]>([]);
  const [friendActivityCount, setFriendActivityCount] = useState(0);
  const [ephemeralContent, setEphemeralContent] = useState<any[]>([]);

  const mockActivities: ActivityType[] = [
    { id: 1, user_name: "Sarah", action: "browsing", location: "trending posts", timestamp: new Date().toISOString() },
    { id: 2, user_name: "Mike", action: "in village", location: "Gaming Village", timestamp: new Date().toISOString() },
    { id: 3, user_name: "Emma", action: "posting", location: "Art Village", timestamp: new Date().toISOString() },
    { id: 4, user_name: "Alex", action: "chatting", location: "DMs", timestamp: new Date().toISOString() },
  ];

  useEffect(() => {
    if (currentUser) {
      setLiveActivities(mockActivities);
      setFriendActivityCount(mockActivities.length);
    }
  }, [currentUser]);

  const updateMyActivity = async (activity: any) => {
    console.log("Activity updated:", activity);
  };

  return (
    <ActivityContext.Provider value={{
      liveActivities,
      friendActivityCount,
      ephemeralContent,
      updateMyActivity
    }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => useContext(ActivityContext);
