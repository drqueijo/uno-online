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
import LoginPage from "../login";
import pagesAndRoutes from "next/utils/pagesAndRoutes";
import { useRouter } from "next/router";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
}

const App: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { data: sessionData } = useSession();
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>(
    router.pathname ?? ""
  );

  const handleNavigation = async (e: { key: string }) => {
    if (e.key === "Logout") await signOut();
    if (e.key === "Login") await signIn();
    setSelectedMenuItem(e.key ?? "");
    await router.push(e.key);
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
          selectedKeys={[selectedMenuItem]}
          onClick={handleNavigation}
          theme="dark"
          mode="inline"
          items={pagesAndRoutes}
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
          className="flex px-4"
          style={{
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          {sessionData ? children : <LoginPage />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
