/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, Input, Modal, Select } from "antd";
import { useSession } from "next-auth/react";
import { useNotification } from "next/providers/NotificationProvider";
import { api } from "next/utils/api";
import { useEffect, useState } from "react";
import { z } from "zod";
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

const formSchema = z.object({
  title: z.string().nonempty("The name cant be empty"),
  content: z.string(),
  statusId: z.string().nonempty("The status cant be empty"),
});

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
  const notification = useNotification();
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
    let responseName = "";
    const validate = formSchema.safeParse(form);
    if (!validate.success)
      return notification.onError(
        "Form error",
        validate.error.errors[0]!.message
      );
    try {
      if (!id && session) {
        const response = await createCard.mutateAsync({
          ...form,
          boardId,
          creatorId: session.data?.user.id,
        });
        if (response?.id) responseName = response.title;
      }

      if (id && session) {
        const response = await updateCard.mutateAsync({ id, ...form });
        if (response?.id) responseName = response.title;
      }
    } catch (error) {
      return notification.onError("Error", "Something went wrong");
    }
    if (responseName) notification.onSuccess("Card created", responseName);

    onOk();
  };

  const onDelete = async () => {
    if (!id) return notification.onError("Error", "No id found");
    const response = await deleteCard.mutateAsync({ id });
    if (response.id) notification.onSuccess("Card deleted", response.title);
    if (!response.id)
      notification.onError("Error deleting card", response.title);
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
