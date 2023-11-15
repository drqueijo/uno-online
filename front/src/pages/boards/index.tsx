/* eslint-disable @typescript-eslint/no-misused-promises */
import { Divider, FloatButton, Modal, Button } from "antd";
import { useSession } from "next-auth/react";
import { api } from "next/utils/api";
import CreateOrUpdate from "next/components/UI/CreateOrUpdateBoard";
import { useState } from "react";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import BoardCard from "next/components/UI/BoardCard";
import { type User } from "@prisma/client";
import { useNotification } from "next/providers/NotificationProvider";

export interface CreateOrUpdateProps {
  id: string;
  isOpen: boolean;
}

const CREATE_OR_UPDATE_INITIAL_VALUE = {
  id: "",
  isOpen: false,
};

export const Boards: React.FC = ({}) => {
  const { data: sessionData } = useSession();
  const [modal, contextHolder] = Modal.useModal();
  const notification = useNotification();
  const [createOrUpdate, setCreateOrUpdate] = useState(
    CREATE_OR_UPDATE_INITIAL_VALUE
  );
  const boards = api.boards.getMyBoards.useQuery({
    userId: sessionData?.user.id,
  });
  const deleteTeam = api.boards.deleteBoard.useMutation();
  const onCloseModal = async () => {
    setCreateOrUpdate(CREATE_OR_UPDATE_INITIAL_VALUE);
    await boards.refetch();
    return;
  };

  const deleteRequest = async (boardId: string) => {
    const res = await deleteTeam.mutateAsync({ boardId });
    if (res.error) return notification.onError("Error", res.message);
    notification.onSuccess("Board", res.message);
    await boards.refetch();
  };

  const handleDelete = async (boardId: string, isEmpty: boolean) => {
    if (!isEmpty)
      return notification.onWarning(
        "Error",
        "Remove all cards before deleting."
      );
    await modal.confirm({
      title: "Confirm Deletion",
      icon: <ExclamationCircleOutlined />,
      content:
        "Are you sure you want to delete this board? All cards will be removed.",
      okText: "Confirm Deletion",
      cancelText: "Cancel",
      onOk: () => deleteRequest(boardId),
    });
    return;
  };

  return (
    <div className="flex w-full flex-col">
      <CreateOrUpdate
        {...createOrUpdate}
        onOk={() => onCloseModal()}
        onCancel={() => setCreateOrUpdate(CREATE_OR_UPDATE_INITIAL_VALUE)}
      />
      <Divider />
      <div className=" text-2xl font-bold text-blue-400">Your Boards</div>
      {boards.data?.map((team) => (
        <>
          <div
            key={team.id}
            className="mb-4 mt-8 text-lg font-bold text-blue-400"
          >
            {team.name}
          </div>
          {team.boards.length === 0 ? (
            <div className="italic text-gray-500">
              No boards available in this team.
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {team.boards.map((board) => (
                <BoardCard
                  onEditClick={(e) => setCreateOrUpdate(e)}
                  onDeleteClick={() =>
                    handleDelete(board.id, board.cards.length === 0)
                  }
                  admin={sessionData?.user as User}
                  key={board.id}
                  board={board}
                  isAdmin={sessionData?.user.id === team.adminId}
                />
              ))}
            </div>
          )}
        </>
      ))}
      <FloatButton
        onClick={() => setCreateOrUpdate({ id: "", isOpen: true })}
        shape="circle"
        type="primary"
        icon={<PlusOutlined />}
      />
      {contextHolder}
    </div>
  );
};

export default Boards;
