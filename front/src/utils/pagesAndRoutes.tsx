import { UserOutlined, LogoutOutlined, TableOutlined } from "@ant-design/icons";

const pagesAndRoutes = [
  {
    key: "/teams",
    icon: <UserOutlined />,
    label: "Teams",
  },
  {
    key: "/boards",
    icon: <TableOutlined />,
    label: "Boards",
  },
  {
    key: "Logout",
    icon: <LogoutOutlined />,
    label: "Logout",
  },
];

export default pagesAndRoutes;
