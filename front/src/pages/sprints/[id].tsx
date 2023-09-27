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

  useEffect(() => {
    if (!sprint.data) return;
    setForm({
      name: sprint.data.name,
      startAt: dayjs(sprint.data.startAt),
      endAt: dayjs(sprint.data.endAt),
    });
  }, [sprint.data]);

  const addToSprint = async (cardId: string) => {
    await addCardToSprintRequest.mutateAsync({
      sprintId: id! as string,
      cardId: cardId,
    });
    await issues.refetch();
  };

  const getExtraCard = (card: CardWithStatus) => {
    if (!card.status?.color) return;
    return <p style={{ color: card.status.color }}>{card.status.name}</p>;
  };

  const removeFromSprint = async (cardId: string) => {
    await removeFromSprintRequent.mutateAsync({
      sprintId: id! as string,
      cardId: cardId,
    });
    await issues.refetch();
  };

  const editSprint = async () => {
    const { name, startAt, endAt } = form;
    if (!startAt) return;
    if (!endAt) return;
    if (!name) return;
    await updateSprint.mutateAsync({
      ...sprint.data!,
      name,
      startAt: isoDate(startAt),
      endAt: isoDate(endAt),
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
