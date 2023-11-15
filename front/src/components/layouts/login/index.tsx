/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button } from "antd";
import { signIn } from "next-auth/react";
import Head from "next/head";

const LoginPage: React.FC = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300">
      <Head>
        <title>UNO agile - Login</title>
      </Head>
      <div className="text-center text-white">
        <h1 className="mb-6 text-4xl font-bold">Welcome to Your Uno Agile</h1>
        <p className="mb-8 text-lg">
          Unlock the power of collaboration and efficiency. Log in to manage
          your team and explore all the features.
        </p>
      </div>

      <div className="rounded-md bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold">Ready to Dive In?</h2>
        <p className="mb-8 text-gray-600">
          Take control and make your projects shine!
        </p>

        <Button type="primary" size="large" onClick={() => signIn()}>
          Login
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
