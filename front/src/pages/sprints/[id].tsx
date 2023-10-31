/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Status, type Card as PrismaCardType } from "@prisma/client";
import { Button, Card, Divider, Input } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "next/utils/api";
import { DATE_FORMAT, isoDate } from "next/utils/date";
import { useEffect, useState } from "react";
import { DatePicker } from "antd";
import { z } from "zod";
import { useNotification } from "next/providers/NotificationProvider";

type CardWithStatus = PrismaCardType & {
  status: Status;
};

export interface SprintFormState {
  name: string;
  startAt: Dayjs | null;
  endAt: Dayjs | null;
}

const today = dayjs();
const nextMonth = dayjs().add(1, "M");

const schema = z.object({
  name: z.string().nonempty('O campo nome precisa ser preenchido'),
  startAt: z.string({required_error: 'o campo start at precisa ser preenchido'}),
  endAt: z.string({required_error: 'o campo end at precisa ser preenchido'}),
})

const SPRINT_FORM_INITIAL_STATE: SprintFormState = {
  name: "",
  startAt: today,
  endAt: nextMonth,
};

export const SprintPage: React.FC = ({}) => {
  const router = useRouter();
  const { id } = router.query;
  const issues = api.cards.getCardsBySprintId.useQuery({ id } as {
    id: string;
  });
  const sprint = api.sprints.getById.useQuery({ id } as { id: string });
  const addCardToSprintRequest = api.sprints.addCardtoSprint.useMutation();
  const removeFromSprintRequent =
    api.sprints.removeCardFromSprint.useMutation();
  const updateSprint = api.sprints.updateSprint.useMutation();
  const deleteSprint = api.sprints.deleteSprint.useMutation();
  const [form, setForm] = useState<SprintFormState>(SPRINT_FORM_INITIAL_STATE);
  const notification = useNotification()

  useEffect(() => {
    if (!sprint.data) return;
    setForm({
      name: sprint.data.name,
      startAt: dayjs(sprint.data.startAt),
      endAt: dayjs(sprint.data.endAt),
    });
  }, [sprint.data]);

  const addToSprint = async (cardId: string) => {
    const response = await addCardToSprintRequest.mutateAsync({
      sprintId: id! as string,
      cardId: cardId,
    });
    if(!response.id) return notification.onError('Card', 'Erro ao adicionar card da sprint')
    notification.onSuccess(response.title, 'Card adicionado com sucesso')
    await issues.refetch();
  };

  const getExtraCard = (card: CardWithStatus) => {
    if (!card.status?.color) return;
    return <p style={{ color: card.status.color }}>{card.status.name}</p>;
  };

  const removeFromSprint = async (cardId: string) => {
    const response = await removeFromSprintRequent.mutateAsync({
      sprintId: id! as string,
      cardId: cardId,
    });
    if(!response.id) return notification.onError('Card', 'Erro ao remover card da sprint')
    notification.onSuccess(response.title, 'Card removido com sucesso')
    await issues.refetch();
  };

  const editSprint = async () => {
    
    const payload = {
      ...form,
      startAt: form.startAt?.toISOString(),
      endAt: form.endAt?.toISOString(),
    }
    const validator = schema.safeParse(payload)
    if(!validator.success) {
      const message = validator.error.issues[0]?.message ?? "";
      return notification.onError('Sprint', message)
    }
    await updateSprint.mutateAsync({
      ...sprint.data!,
      ...form,
      startAt: form.startAt?.toISOString() ?? '',
      endAt: form.startAt?.toISOString() ?? '',
    });
  };

  const onDeleteSprint = async () => {
    await deleteSprint.mutateAsync({ sprintId: id! as string });
    await router.push("/sprints");
  };

  return (
    <div className="flex w-full flex-col">
      <Button
        type="primary"
        className="ml-auto"
        style={{ backgroundColor: "#ff0000" }}
        onClick={onDeleteSprint}
      >
        DELETE SPRINT
      </Button>
      <Divider />
      <div className="text-lg font-bold text-blue-500">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-2">
            <p>name:</p>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            <p>Starts at:</p>
            <DatePicker
              format={DATE_FORMAT}
              onChange={(e) => setForm({ ...form, startAt: e })}
              value={form.startAt}
            />
          </label>
          <label className="flex flex-col gap-2">
            <p>Ends at:</p>
            <DatePicker
              format={DATE_FORMAT}
              onChange={(e) => setForm({ ...form, endAt: e })}
              value={form.endAt}
            />
          </label>
          <Button type="primary" onClick={editSprint}>
            submit
          </Button>
        </div>
      </div>
      <Divider />
      <div className="mb-4 text-lg font-bold text-blue-500">
        Issues in this sprint
      </div>
      <div className="flex flex-wrap gap-4 ">
        {issues.data?.cards.map((card) => (
          <Card
            title={card.title}
            key={card.id}
            extra={getExtraCard(card as CardWithStatus)}
          >
            <p className="flex items-center justify-between text-sm font-bold">
              {card.content}
            </p>
            <Divider />
            <Link
              className="ml-auto flex items-end justify-end"
              href={`/board/${card.boardId}`}
            >
              Visit board...
            </Link>
            <Divider />
            <Button type="primary" onClick={() => removeFromSprint(card.id)}>
              remove from sprint
            </Button>
          </Card>
        ))}
      </div>
      <Divider />
      <div className="mb-4 text-lg font-bold text-blue-500">Another issues</div>
      <div className="flex flex-wrap gap-4 ">
        {issues.data?.rest.map((card) => (
          <Card
            title={card.title}
            key={card.id}
            extra={getExtraCard(card as CardWithStatus)}
          >
            <p className="flex items-center justify-between text-sm font-bold">
              {card.content}
            </p>
            <Divider />
            <Link
              className="ml-auto flex items-end justify-end"
              href={`/board/${card.boardId}`}
            >
              Visit board...
            </Link>
            <Divider />
            <Button type="primary" onClick={() => addToSprint(card.id)}>
              add to this sprint
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default SprintPage;
