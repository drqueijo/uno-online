/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Avatar, Button, Card, Divider, FloatButton, Input, Modal } from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "next/utils/api";
import { useState, type FormEvent } from "react";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import DeleteModal from "./CreateOrUpdate";
import { type Team, type User } from "@prisma/client";
import CreateOrUpdate from "./CreateOrUpdate";
import TeamCard from "./TeamCard";

export interface CreateOrUpdateProps {
  id?: string;
  isOpen: boolean;
}

const CREATE_OR_UPDATE_INITIAL_VALUE = {
  id: "",
  isOpen: false,
};

export default function Home() {
  const deleteTeam = api.teams.deleteTeam.useMutation();
  const { data: sessionData } = useSession();
  const [modal, contextHolder] = Modal.useModal();
  const [createOrUpdate, setCreateOrUpdate] = useState<CreateOrUpdateProps>(
    CREATE_OR_UPDATE_INITIAL_VALUE
  );
  const myTeams = api.teams.getMyTeams.useQuery({
    userId: sessionData?.user.id,
  });

  const deleteRequest = async (teamId: string) => {
    await deleteTeam.mutateAsync({ id: teamId, userId: sessionData?.user.id });
    await myTeams.refetch();
  };

  const handleDelete = async (teamId: string) => {
    await modal.confirm({
      title: "Are you sure want to delete this team? All boards will be missed",
      icon: <ExclamationCircleOutlined />,
      content: "",
      okText: "Confirm deletion",
      cancelText: "Cancel",
      onOk: () => deleteRequest(teamId),
    });
  };

  const onCloseModal = async () => {
    await myTeams.refetch();
    setCreateOrUpdate(CREATE_OR_UPDATE_INITIAL_VALUE);
  };

  return (
    <div className="flex w-full flex-col">
      <Divider />
      <CreateOrUpdate
        {...createOrUpdate}
        onOk={() => onCloseModal()}
        onCancel={() => setCreateOrUpdate(CREATE_OR_UPDATE_INITIAL_VALUE)}
      />
      <div className="mb-8 text-lg font-bold text-blue-500">Your teams</div>
      <div className="flex flex-wrap gap-4">
        {myTeams.data?.map((team) => (
          <TeamCard
            onEditClick={(e) => setCreateOrUpdate(e)}
            onDeleteClick={() => handleDelete(team.id)}
            admin={sessionData?.user as User}
            key={team.id}
            team={team}
          />
        ))}
      </div>
      <FloatButton
        onClick={() => setCreateOrUpdate({ id: "", isOpen: true })}
        shape="circle"
        type="primary"
        icon={<PlusOutlined />}
      />
      {contextHolder}
    </div>
  );
}
