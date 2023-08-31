/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, Input, Modal, Select } from "antd";
import { useSession } from "next-auth/react";
import { api } from "next/utils/api";
import { useEffect, useState } from "react";
interface CreateOrUpdateCardProps {
  isOpen: boolean;
  onCancel: () => void;
  onOk: () => void;
  id?: string;
  boardId: string;
  statusId: string;
}

const FORM_INITIAL_STATE = {
  title: "",
  content: "",
  statusId: "",
};

export const CreateOrUpdateCard: React.FC<CreateOrUpdateCardProps> = ({
  isOpen,
  onCancel,
  onOk,
  boardId,
  id,
  statusId,
}) => {
  const card = api.cards.getCardBydId.useQuery({ cardId: id });
  const status = api.status.getStatus.useQuery({ boardId });
  const createCard = api.cards.createCard.useMutation();
  const updateCard = api.cards.updateCard.useMutation();
  const deleteCard = api.cards.deleteCard.useMutation();
  const session = useSession();

  const statusOptions = status.data?.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const [form, setForm] = useState(FORM_INITIAL_STATE);

  useEffect(() => {
    setForm({ ...FORM_INITIAL_STATE, statusId });
    if (!id || !card.data) return;
    const { title, content, statusId: cardStatus } = card.data;
    setForm({
      title,
      content,
      statusId: cardStatus,
    });
  }, [card.data, id, statusId, status.data]);

  const onSubmit = async () => {
    if (!id && session)
      await createCard
        .mutateAsync({ ...form, boardId, creatorId: session.data?.user.id })
        .catch((e) => console.log(e));
    if (id && session) await updateCard.mutateAsync({ id, ...form });
    onOk();
  };

  const onDelete = async () => {
    if (!id) return;
    await deleteCard.mutateAsync({ id });
    onOk();
  };
  const title = id ? "Update card" : "Create card";
  return (
    <Modal open={isOpen} onCancel={onCancel} onOk={onSubmit} title={title}>
      <div className="flex w-full flex-col  gap-4">
        <label className="flex flex-col gap-2 font-bold">
          Card Title
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full"
          />
        </label>
        <label className="flex flex-col gap-2 font-bold">
          Card Content
          <Input.TextArea
            placeholder="Place items center"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full"
            rows={4}
          />
        </label>
        {statusOptions && statusOptions.length > 0 && (
          <label className="flex flex-col gap-2 font-bold">
            Card status
            <Select
              onChange={(e) => setForm({ ...form, statusId: e })}
              options={statusOptions}
              value={form.statusId}
              className="w-full"
              loading={card.isLoading || status.isLoading}
            />
          </label>
        )}

        {id && (
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
