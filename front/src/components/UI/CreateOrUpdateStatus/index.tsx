/* eslint-disable @typescript-eslint/no-misused-promises */
import { ColorPicker, Input, Modal, Select } from "antd";
import { useSession } from "next-auth/react";
import { api } from "next/utils/api";
import { useEffect, useState } from "react";
interface CreateOrUpdateCardProps {
  isOpen: boolean;
  onCancel: () => void;
  onOk: () => void;
  id?: string;
  boardId: string;
}

const FORM_INITIAL_STATE = {
  name: "",
  color: "",
};

export const CreateOrUpdateCard: React.FC<CreateOrUpdateCardProps> = ({
  isOpen,
  onCancel,
  onOk,
  boardId,
  id,
}) => {
  const status = api.status.getStatusById.useQuery({ statusId: id });
  const createStatus = api.status.createStatus.useMutation();
  const updateStatus = api.status.updateStatus.useMutation();
  const session = useSession();
  const [form, setForm] = useState(FORM_INITIAL_STATE);

  useEffect(() => {
    setForm(FORM_INITIAL_STATE);
    if (!id || !status.data) return;
    const { name, color } = status.data;
    setForm({
      name,
      color,
    });
  }, [status.data, id]);

  const onSubmit = async () => {
    if (!id && session)
      await createStatus
        .mutateAsync({ ...form, boardId })
        .catch((e) => console.log(e));
    if (id && session)
      await updateStatus.mutateAsync({ statusId: id, ...form });
    onOk();
  };
  const title = id ? "Update status" : "Create status";
  return (
    <Modal open={isOpen} onCancel={onCancel} onOk={onSubmit} title={title}>
      <div className="flex w-full flex-col  gap-4">
        <label className="flex flex-col gap-2 font-bold">
          Status Name
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
          />
        </label>
        <label className="flex flex-col gap-2 font-bold">Status Color</label>
        <ColorPicker
          onChange={(color, hex) => setForm({ ...form, color: hex })}
          showText={(color) => (
            <span>Current color ({color.toHexString()})</span>
          )}
          value={form.color}
        />
      </div>
    </Modal>
  );
};
export default CreateOrUpdateCard;
