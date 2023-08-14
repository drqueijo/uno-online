import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DingdingOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const pagesAndRoutes = [
  {
    key: "/teams",
    icon: <UserOutlined />,
    label: "Teams",
  },
  {
    key: "/",
    icon: <LogoutOutlined />,
    label: "Logout",
  },
];

export default pagesAndRoutes;
