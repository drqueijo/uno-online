/* eslint-disable @typescript-eslint/no-misused-promises */
import { Input, Modal, Select } from "antd";

import { useSession } from "next-auth/react";
import { useNotification } from "next/providers/NotificationProvider";
import { api } from "next/utils/api";
import { useEffect, useState } from "react";

interface CreateOrUpdateProps {
  id?: string;
  isOpen: boolean;
  onCancel: () => void;
  onOk: () => void;
}

const FORM_INITIAL_STATE = {
  name: "",
  teamId: "",
};

export const CreateOrUpdate: React.FC<CreateOrUpdateProps> = ({
  id,
  isOpen,
  onCancel,
  onOk,
}) => {
  const [form, setForm] = useState(FORM_INITIAL_STATE);
  const createBoard = api.boards.createBoard.useMutation();
  const updateBoard = api.boards.updateBoard.useMutation();
  const { data: sessionData } = useSession();
  const myTeams = api.teams.getMyTeams.useQuery({
    userId: sessionData?.user.id,
  });
  const notification = useNotification();
  const board = api.boards.getBoardById.useQuery({ id });
  const teamsOptions = myTeams.data?.map((team) => ({
    label: team.name,
    value: team.id,
  }));

  useEffect(() => {
    setForm(FORM_INITIAL_STATE);
    if (!id || !board.data) return;
    const { team, name } = board.data;
    setForm({
      teamId: team.id,
      name,
    });
  }, [board.data, id]);

  const onCreateBoard = async () => {
    const res = await createBoard.mutateAsync(form);
    if (res.error) {
      return notification.onError("Erro", res.message);
    }
    notification.onSuccess(res.reponse!.name, res.message);
    setForm(FORM_INITIAL_STATE);
    onOk();
  };

  const onUpdateBoard = async () => {
    if (!id)
      return notification.onError(
        "Board",
        "Precisa selectionar um board valido"
      );
    const res = await updateBoard.mutateAsync({ id, ...form });
    if (res.error) {
      return notification.onError("Erro", res.message);
    }
    notification.onSuccess(res.reponse!.name, res.message);
    setForm(FORM_INITIAL_STATE);
    onOk();
  };

  const title = id ? "Edit your board" : "Create a new board";
  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      onOk={id ? onUpdateBoard : onCreateBoard}
      title={title}
    >
      <div className="flex w-full flex-col  gap-4">
        <label className="flex flex-col gap-2 font-bold">
          Board Name
          <Input
            placeholder="Jhons team manage board"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
          />
        </label>
        <label className="flex flex-col gap-2 font-bold">
          Boards team
          <Select
            onChange={(e) => setForm({ ...form, teamId: e })}
            options={teamsOptions}
            value={form.teamId}
            className="w-full"
            loading={board.isLoading || myTeams.isLoading}
          />
        </label>
      </div>
    </Modal>
  );
};
export default CreateOrUpdate;
