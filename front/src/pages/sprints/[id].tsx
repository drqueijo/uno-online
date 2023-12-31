/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button, Card, Divider, FloatButton, Input } from "antd";
import { SnippetsOutlined, CloudDownloadOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "next/utils/api";
import { DATE_FORMAT } from "next/utils/date";
import { useEffect, useState } from "react";
import { DatePicker } from "antd";
import { type Card as PrimaCardType, type Status } from "@prisma/client";
import { z } from "zod";
import { useNotification } from "next/providers/NotificationProvider";
import * as XLSX from "xlsx";

type CardWithStatus = PrimaCardType & {
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
  name: z.string().nonempty("O campo nome precisa ser preenchido"),
  startAt: z.string({
    required_error: "o campo start at precisa ser preenchido",
  }),
  endAt: z.string({ required_error: "o campo end at precisa ser preenchido" }),
});

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
  const generateSpreadSheet = api.sprints.generateSpreadSheet.useMutation();
  const updateSprint = api.sprints.updateSprint.useMutation();
  const deleteSprint = api.sprints.deleteSprint.useMutation();
  const [form, setForm] = useState<SprintFormState>(SPRINT_FORM_INITIAL_STATE);
  const notification = useNotification();

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

    if (response.id)
      notification.onSuccess("Card added to sprint", response.title);
    if (!response.id)
      notification.onError("Error adding card to sprint", response.title);
    await issues.refetch();
  };

  const getExtraCard = (card: CardWithStatus) => {
    if (!card.status?.color) return;
    return (
      <div
        style={{ backgroundColor: card.status.color, marginLeft: 10 }}
        className="h-2 w-2 rounded-full"
      />
    );
  };

  const removeFromSprint = async (cardId: string) => {
    const response = await removeFromSprintRequent.mutateAsync({
      sprintId: id! as string,
      cardId: cardId,
    });
    if (response.id)
      notification.onSuccess("Card removed from sprint", response.title);
    if (!response.id)
      notification.onError("Error removing card from sprint", response.title);
    await issues.refetch();
  };

  const editSprint = async () => {
    const { name, startAt, endAt } = form;
    if (!startAt)
      return notification.onError("Error", "Start date is required");
    if (!endAt) return notification.onError("Error", "End date is required");
    if (!name) return notification.onError("Error", "Name is required");
    const response = await updateSprint.mutateAsync({
      ...sprint.data!,
      ...form,
      startAt: form.startAt?.toISOString() ?? "",
      endAt: form.startAt?.toISOString() ?? "",
    });
    if (!response.id)
      return notification.onError("Error", "Error updating sprint");
    if (response.id)
      return notification.onSuccess("Sprint updated", response.name);
  };

  const onDeleteSprint = async () => {
    await deleteSprint.mutateAsync({ sprintId: id! as string });
    await router.push("/sprints");
  };

  const generateRequest = async (downloadType: "json" | "excel") => {
    try {
      const response = await generateSpreadSheet.mutateAsync({
        sprintId: id! as string,
      });

      if (downloadType === "json") {
        // Download as JSON
        const jsonData = response; // Replace this with the actual JSON data
        const jsonBlob = new Blob([JSON.stringify(jsonData)], {
          type: "application/json",
        });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const link = document.createElement("a");
        link.href = jsonUrl;
        link.download = "sprint.json";
        link.click();
      } else if (downloadType === "excel") {
        // Download as Excel
        const jsonData = response; // Replace this with the actual JSON data

        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Create a worksheet
        const ws = XLSX.utils.json_to_sheet(jsonData as object[]);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");

        // Save the workbook as an Excel file
        XLSX.writeFile(wb, `sprint.xlsx`);
      }
    } catch (error) {
      console.error("Error generating file:", error);
    }
  };

  return (
    <div className="flex w-full flex-col p-4">
      <Button
        type="primary"
        className="mb-4 ml-auto"
        style={{ backgroundColor: "#ff0000" }}
        onClick={onDeleteSprint}
      >
        Delete Sprint
      </Button>
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
        <Button type="primary" onClick={editSprint} className="bg-blue-500">
          Submit
        </Button>
      </div>
      <Divider className="border-blue-500" />
      <div className="mb-4 text-xl font-bold text-blue-500">Active Issues</div>
      <div className="mb-4 flex flex-wrap gap-4 ">
        {issues.data?.cards.map((card) => (
          <Card
            title={card.title}
            key={card.id}
            extra={getExtraCard(card as CardWithStatus)}
            className="border-blue-500 p-2"
          >
            <Button
              type="primary"
              onClick={() => removeFromSprint(card.id)}
              className="rounded bg-blue-500 px-4 py-2 text-white shadow hover:bg-blue-700 focus:outline-none active:bg-blue-900"
            >
              Remove from this sprint
            </Button>
            <Divider />
            <Link
              className="ml-auto flex items-end justify-end text-blue-500"
              href={`/board/${card.boardId}`}
            >
              Visit board...
            </Link>
          </Card>
        ))}
      </div>
      <Divider className="border-blue-500" />
      <div className="mb-4 text-xl font-bold text-blue-500">Other Issues</div>
      <div className="mb-4 flex flex-wrap gap-4 ">
        {issues.data?.rest.map((card) => (
          <Card
            title={card.title}
            key={card.id}
            extra={getExtraCard(card as CardWithStatus)}
            className="border-blue-500 p-2"
          >
            <Button
              type="primary"
              onClick={() => addToSprint(card.id)}
              className="rounded bg-blue-500 px-4 py-2 text-white shadow hover:bg-blue-700 focus:outline-none active:bg-blue-900"
            >
              Add to this sprint
            </Button>
            <Divider />
            <Link
              className="ml-auto flex items-end justify-end text-blue-500"
              href={`/board/${card.boardId}`}
            >
              Visit board...
            </Link>
          </Card>
        ))}
      </div>
      <FloatButton.Group>
        <FloatButton
          onClick={() => generateRequest("excel")}
          shape="circle"
          type="primary"
          icon={<SnippetsOutlined />}
        />
        <FloatButton
          onClick={() => generateRequest("json")}
          shape="circle"
          type="primary"
          icon={<CloudDownloadOutlined />}
        />
      </FloatButton.Group>
    </div>
  );
};
export default SprintPage;
