/* eslint-disable @typescript-eslint/no-misused-promises */
import { Input, Modal, Select } from "antd";
import { useSession } from "next-auth/react";
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
  team: "",
};

export const CreateOrUpdate: React.FC<CreateOrUpdateProps> = ({
  id,
  isOpen,
  onCancel,
  onOk,
}) => {
  const [form, setForm] = useState(FORM_INITIAL_STATE);
  const createBoard = api.boards.createBoard.useMutation();
  const { data: sessionData } = useSession();
  const myTeams = api.teams.getMyTeams.useQuery({
    userId: sessionData?.user.id,
  });
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
      team: team.id,
      name,
    });
  }, [board.data, id]);

  const onSubmit = async () => {
    if (!id && sessionData)
      await createBoard.mutateAsync(form).catch((e) => console.log(e));
    setForm(FORM_INITIAL_STATE);
    onOk();
  };

  const title = id ? "Edit your board" : "Create a new board";
  return (
    <Modal open={isOpen} onCancel={onCancel} onOk={onSubmit} title={title}>
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
            onChange={(e) => setForm({ ...form, team: e })}
            options={teamsOptions}
            value={form.team}
            className="w-full"
            loading={board.isLoading || myTeams.isLoading}
          />
        </label>
      </div>
    </Modal>
  );
};
export default CreateOrUpdate;
