/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { ReactNode, useState } from "react";
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
import { Layout, Menu, Button, theme } from "antd";
import { signIn, signOut, useSession } from "next-auth/react";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

const App: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { data: sessionData } = useSession();

  const handleNavigation = async (e: { key: string }) => {
    if (e.key === "Logout") await signOut();
    if (e.key === "Login") await signIn();
  };

  return (
    <Layout>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="h-screen overflow-auto"
      >
        <div className="flex p-4 text-5xl text-white">
          <DingdingOutlined className="m-auto" />
        </div>
        <Menu
          onClick={handleNavigation}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={[
            {
              key: "1",
              icon: <UserOutlined />,
              label: "nav 1",
            },
            {
              key: "2",
              icon: <VideoCameraOutlined />,
              label: "nav 2",
            },
            {
              key: "3",
              icon: <UploadOutlined />,
              label: "nav 3",
            },
            {
              key: sessionData ? "Logout" : "Login",
              icon: sessionData ? <LogoutOutlined /> : <LoginOutlined />,
              label: sessionData ? "Logout" : "Login",
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          {sessionData?.user.name ?? "not logged"}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
