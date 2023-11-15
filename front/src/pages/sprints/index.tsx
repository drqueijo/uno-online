/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, DatePicker, Divider, Input } from "antd";
import { api } from "next/utils/api";
import { useState } from "react";
import { Card } from "antd";
import { useRouter } from "next/router";
import dayjs, { type Dayjs } from "dayjs";
import { DATE_FORMAT, formatDate } from "next/utils/date";
import { useNotification } from "next/providers/NotificationProvider";

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

export const Sprints: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<SprintFormState>(SPRINT_FORM_INITIAL_STATE);
  const sprints = api.sprints.getSprints.useQuery();
  const notification = useNotification();
  const createSprint = api.sprints.createSprint.useMutation();

  const isSprintActive = (end: Date) => {
    const endDate = dayjs(end);
    if (today.isAfter(endDate)) return <p className="text-red-600">Finished</p>;
    return <p className="text-green-600">Active</p>;
  };

  const onSubmit = async () => {
    if (!form.startAt || !form.endAt || !form.name) return;
    const response = await createSprint.mutateAsync({
      ...form,
      startAt: form.startAt.toISOString(),
      endAt: form.endAt.toISOString(),
    });
    if (!response.id)
      return notification.onError("Something went wrong", "Please try again");
    if (response.id) notification.onSuccess("Sprint created", response.name);
    setForm(SPRINT_FORM_INITIAL_STATE);
    await sprints.refetch();
  };

  return (
    <div className="flex w-full flex-col p-4">
      <Divider className="border-blue-500" />
      <div className="mb-8 text-2xl font-bold text-blue-500">Sprints</div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-2">
          <p className="text-blue-500">Name:</p>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border-blue-500"
          />
        </label>
        <label className="flex flex-col gap-2">
          <p className="text-blue-500">Starts at:</p>
          <DatePicker
            format={DATE_FORMAT}
            onChange={(e) => setForm({ ...form, startAt: e })}
            value={form.startAt}
            className="border-blue-500"
          />
        </label>
        <label className="flex flex-col gap-2">
          <p className="text-blue-500">Ends at:</p>
          <DatePicker
            format={DATE_FORMAT}
            onChange={(e) => setForm({ ...form, endAt: e })}
            value={form.endAt}
            className="border-blue-500"
          />
        </label>
        <Button type="primary" onClick={onSubmit} className="bg-blue-500">
          Submit
        </Button>
      </div>
      <Divider className="border-blue-500" />
      <div className="flex flex-wrap gap-4">
        {sprints.data?.map((sprint) => (
          <Card
            key={sprint.id}
            title={<span className="text-blue-500">{sprint.name}</span>}
            onClick={() => router.push(`/sprints/${sprint.id}`)}
            className="cursor-pointer border-blue-500"
            hoverable
          >
            <p className="flex items-center justify-between text-sm font-bold">
              {formatDate(sprint.startAt)} - {formatDate(sprint.endAt)}
            </p>
            <Divider className="border-blue-500" />
            <p className="flex items-center justify-end text-sm font-bold">
              {isSprintActive(sprint.endAt)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Sprints;
