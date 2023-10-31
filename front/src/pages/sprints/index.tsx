/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, DatePicker, Divider, Input } from "antd";
import { api } from "next/utils/api";
import { useState } from "react";
import { Card } from "antd";
import { useRouter } from "next/router";
import dayjs, { type Dayjs } from "dayjs";
import { DATE_FORMAT, formatDate } from "next/utils/date";
import { z } from "zod";
import { useNotification } from "next/providers/NotificationProvider";

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

export const Boards: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<SprintFormState>(SPRINT_FORM_INITIAL_STATE);
  const sprints = api.sprints.getSprints.useQuery();
  const createSprint = api.sprints.createSprint.useMutation();
  const notification = useNotification()
  const isSprintActive = (end: Date) => {
    const endDate = dayjs(end);
    if (today.isAfter(endDate)) return <p className="text-red-600">Finished</p>;
    return <p className="text-green-600">Active</p>;
  };

  const onSubmit = async () => {

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
    const response = await createSprint.mutateAsync({
      ...form,
      startAt: form.startAt!.toISOString(),
      endAt: form.endAt!.toISOString(),
    });
    if (!response.id) return;
    setForm(SPRINT_FORM_INITIAL_STATE);
    await sprints.refetch();
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mb-8 text-lg font-bold text-blue-500">Sprints</div>
      <Divider />
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
        <Button type="primary" onClick={onSubmit}>
          submit
        </Button>
      </div>
      <Divider />
      <div className="flex flex-wrap gap-4">
        {sprints.data?.map((sprint) => (
          <Card
            key={sprint.id}
            title={sprint.name}
            onClick={() => router.push(`/sprints/${sprint.id}`)}
            className="cursor-pointer"
          >
            <p className="flex items-center justify-between text-sm font-bold">
              {formatDate(sprint.startAt)} -{formatDate(sprint.endAt)}
            </p>
            <Divider />
            <p className="flex items-center justify-end text-sm font-bold">
              {isSprintActive(sprint.endAt)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Boards;
