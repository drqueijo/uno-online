import { notification } from "antd";

const useNotification = () => {
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
  return [onError, onSuccess, contextHolder];
};

export default useNotification;
