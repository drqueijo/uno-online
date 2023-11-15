import React, { type ReactNode, createContext, useContext } from "react";
import { notification } from "antd";

export const NotificationContext = createContext({
  onSuccess: (message: string, description: string) => {
    return;
  },
  onError: (message: string, description: string) => {
    return;
  },
  onWarning: (message: string, description: string) => {
    return;
  },
});

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
  const onWarning = (message: string, description = "") => {
    return api.warning({
      message,
      description,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        onSuccess,
        onError,
        onWarning,
      }}
    >
      {children}
      {contextHolder}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};
