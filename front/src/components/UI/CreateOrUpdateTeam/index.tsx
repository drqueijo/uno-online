/* eslint-disable @typescript-eslint/no-misused-promises */
import { Input, Modal, Select } from "antd";

import { useSession } from "next-auth/react";
import { useNotification } from "next/providers/NotificationProvider";

import { api } from "next/utils/api";
import { useEffect, useState } from "react";
import { z } from "zod";

interface EditModalProps {
  id?: string;
  isOpen: boolean;
  onCancel: () => void;
  onOk: () => void;
}

const formSchema = z.object({
  name: z.string().nonempty("The team name cant be empty"),
  users: z.string().array().nonempty("Fill at least one member in your team"),
});

const FORM_INITIAL_STATE = {
  name: "",
  users: [] as string[],
};

const CreateOrUpdate: React.FC<EditModalProps> = ({
  id,
  isOpen,
  onCancel,
  onOk,
}) => {
  const { data: sessionData } = useSession();
  const team = api.teams.getTeamById.useQuery({ id });
  const [form, setForm] = useState(FORM_INITIAL_STATE);
  const notification = useNotification();
  const createTeam = api.teams.createTeam.useMutation();
  const updateTeam = api.teams.updateTeam.useMutation();
  const usersRequest = api.users.getUsers.useQuery();
  const usersOptions =
    usersRequest.data
      ?.map((user) => ({ label: user.email, value: user.id }))
      .filter((user) => user.value !== sessionData?.user.id) ?? [];

  useEffect(() => {
    setForm(FORM_INITIAL_STATE);
    if (!id || !team.data) return;
    const { users, name } = team.data;
    setForm({
      users: users.map((user) => user.id),
      name,
    });
  }, [team.data, id]);

  const onSubmit = async () => {
    const validate = formSchema.safeParse(form);
    let responseName = "";
    if (!validate.success)
      return notification.onError(
        "Form error",
        validate.error.errors[0]!.message
      );

    try {
      if (!id && sessionData) {
        const response = await createTeam.mutateAsync({
          ...form,
          adminId: sessionData.user.id,
        });
        responseName = response.name;
      }

      if (id && sessionData) {
        const response = await updateTeam.mutateAsync({ id, ...form });
        responseName = response!.name;
      }
    } catch (err) {
      return notification.onError("Error", "Error on create request");
    }
    notification.onSuccess("Success", responseName);
    setForm(FORM_INITIAL_STATE);
    onOk();
  };

  const title = id ? "Edit your team" : "Create a new team";
  return (
    <Modal open={isOpen} onCancel={onCancel} onOk={onSubmit} title={title}>
      <div className="flex w-full flex-col  gap-4">
        <label className="flex flex-col gap-2 font-bold">
          Team Name
          <Input
            placeholder="Jhons team"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full"
          />
        </label>
        <label className="flex flex-col gap-2 font-bold">
          Team users
          <Select
            mode="multiple"
            onChange={(e) => setForm({ ...form, users: e })}
            options={usersOptions}
            value={form.users}
            className="w-full"
            loading={usersRequest.isLoading || team.isLoading}
          />
        </label>
      </div>
    </Modal>
  );
};

export default CreateOrUpdate;
