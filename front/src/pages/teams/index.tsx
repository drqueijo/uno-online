/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Divider, FloatButton, Modal, Button } from "antd";
import { useSession } from "next-auth/react";
import { api } from "next/utils/api";
import { useState } from "react";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { type User } from "@prisma/client";
import CreateOrUpdate from "next/components/UI/CreateOrUpdateTeam";
import TeamCard from "next/components/UI/TeamCard";
import { useNotification } from "next/providers/NotificationProvider";

export interface CreateOrUpdateProps {
  id?: string;
  isOpen: boolean;
}

const CREATE_OR_UPDATE_INITIAL_VALUE = {
  id: "",
  isOpen: false,
};

export default function Teams() {
  const deleteTeam = api.teams.deleteTeam.useMutation();
  const { data: sessionData } = useSession();
  const [modal, contextHolder] = Modal.useModal();
  const notification = useNotification();
  const [createOrUpdate, setCreateOrUpdate] = useState<CreateOrUpdateProps>(
    CREATE_OR_UPDATE_INITIAL_VALUE
  );
  const myTeams = api.teams.getMyTeams.useQuery({
    userId: sessionData?.user.id,
  });

  const teamsAsMember = api.teams.getTeamAsMember.useQuery({
    userId: sessionData?.user.id,
  });

  const deleteRequest = async (teamId: string) => {
    try {
      const request = await deleteTeam.mutateAsync({
        id: teamId,
        userId: sessionData?.user.id,
      });
      notification.onSuccess("Deleted", request!.name);
    } catch (e) {
      notification.onError("Error", `The delete request failed`);
    }

    await myTeams.refetch();
  };

  const handleDelete = async (teamId: string, canDelete: boolean) => {
    if (!canDelete)
      return notification.onError("Erro", "Exclua todos os boards antes");
    await modal.confirm({
      title: "Confirm Deletion",
      icon: <ExclamationCircleOutlined />,
      content:
        "Are you sure you want to delete this team? All boards will be removed.",
      okText: "Confirm Deletion",
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
      <div className="mb-8 text-2xl font-bold text-blue-400">Your Teams</div>
      <div className="flex flex-wrap gap-4">
        {myTeams.data?.map((team) => (
          <TeamCard
            onEditClick={(e) => setCreateOrUpdate(e)}
            onDeleteClick={() =>
              handleDelete(team.id, team.boards.length === 0)
            }
            admin={sessionData?.user as User}
            key={team.id}
            team={team}
            isAdmin={sessionData?.user.id === team.adminId}
          />
        ))}
      </div>
      <Divider />
      <div className="mb-8 text-2xl font-bold text-blue-400">
        {"Teams You're a Member Of"}
      </div>
      <div className="flex flex-wrap gap-4">
        {teamsAsMember.data?.map((team) => (
          <TeamCard
            onEditClick={(e) => setCreateOrUpdate(e)}
            onDeleteClick={() =>
              handleDelete(team.id, team.boards.length === 0)
            }
            admin={team.admin as User}
            key={team.id}
            team={team}
            isAdmin={sessionData?.user.id === team.adminId}
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
