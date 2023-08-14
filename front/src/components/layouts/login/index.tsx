/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button } from "antd";
import { signIn } from "next-auth/react";
import { type ReactNode } from "react";

const LoginPage: React.FC = () => {
  return (
    <div className="m-auto flex flex-col items-center justify-center">
      <h3 className="bold pb-4 text-2xl">
        {" "}
        To manage your team and see all the features plase login{" "}
      </h3>
      <Button onClick={() => signIn()}>Login</Button>
    </div>
  );
};

export default LoginPage;
