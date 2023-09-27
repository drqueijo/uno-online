import {
  UserOutlined,
  LogoutOutlined,
  TableOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";

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
    key: "/sprints",
    icon: <FieldTimeOutlined />,
    label: "Sprints",
  },
  {
    key: "Logout",
    icon: <LogoutOutlined />,
    label: "Logout",
  },
];

export default pagesAndRoutes;
