/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { type ReactNode, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DingdingOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme } from "antd";
import { signIn, signOut, useSession } from "next-auth/react";
import LoginPage from "../login";
import pagesAndRoutes from "next/utils/pagesAndRoutes";
import { useRouter } from "next/router";
import { NotificationProvider } from "next/providers/NotificationProvider";
import Image from "next/image";
import Head from "next/head";

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
    <>
      {sessionData ? (
        <Layout>
          <Head>
            <title>UNO - agile</title>
          </Head>
          <NotificationProvider>
            <Sider
              trigger={null}
              collapsible
              collapsed={collapsed}
              className="min-h-screen overflow-auto"
            >
              <div className="flex pt-4 text-5xl text-white">
                <Image
                  src="/cards.svg"
                  width={70}
                  height={70}
                  alt="card"
                  className="m-auto"
                />
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
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: "16px",
                    width: 64,
                    height: 64,
                  }}
                />
              </Header>
              <Content
                className="flex px-4 pb-6"
                style={{
                  minHeight: 280,
                  background: colorBgContainer,
                }}
              >
                {children}
              </Content>
            </Layout>
          </NotificationProvider>
        </Layout>
      ) : (
        <LoginPage />
      )}
    </>
  );
};

export default App;
