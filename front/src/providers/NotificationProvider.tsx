import React, { type ReactNode, createContext, useContext } from "react";
import { notification } from "antd";
// Step 1: Create a new context
export const NotificationContext = createContext({
  onSuccess: (message: string, description: string) => {
    return;
  },
  onError: (message: string, description: string) => {
    return;
  },
});

// Step 2: Create the provider component
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [api, contextHolder] = notification.useNotification();

  const onSuccess = (message: string, description = "") => {
    return api.success({
      message,
      description,
    });
  };
  const onError = (message: string, description = "") => {
    return api.error({
      message,
      description,
    });
  };

  return (
    // Step 4: Provide the context value
    <NotificationContext.Provider
      value={{
        onSuccess,
        onError,
      }}
    >
      {children}
      {contextHolder}
    </NotificationContext.Provider>
  );
};

// Step 3: Create a hook to access the context
export const useNotification = () => {
  return useContext(NotificationContext);
};
