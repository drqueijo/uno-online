/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, ColorPicker, Input, Modal } from "antd";
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
  const statuses = api.status.getStatus.useQuery({ boardId });
  const createStatus = api.status.createStatus.useMutation();
  const updateStatus = api.status.updateStatus.useMutation();
  const deleteStatus = api.status.deleteStatus.useMutation();
  const cards = api.cards.getCardsByBoardId.useQuery({ boardId });
  const cardsInThisStatusFound = cards.data?.cards.filter(
    (card) => card.statusId === id
  );
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

    await statuses.refetch();
    onOk();
  };

  const onDelete = async () => {
    if (!id) return;
    await deleteStatus.mutateAsync({ statusId: id });
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
        {id && cardsInThisStatusFound?.length === 0 && (
          <div>
            <Button type="primary" danger onClick={onDelete}>
              DELETE
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
export default CreateOrUpdateCard;
