/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Team, type User } from "@prisma/client";
import { Avatar, Button, Card, Divider, Dropdown } from "antd";
import Link from "next/link";
import { type CreateOrUpdateProps } from "next/pages/teams";
import { SnippetsOutlined, CloudDownloadOutlined } from "@ant-design/icons";
import { api } from "next/utils/api";
import * as XLSX from "xlsx";
type TeamWithUsers = Team & {
  users: User[];
};

interface TeamCardProps {
  team: TeamWithUsers;
  admin?: User;
  onEditClick: ({ id, isOpen }: CreateOrUpdateProps) => void;
  onDeleteClick: (id: string) => void;
  isAdmin: boolean;
}

export default function TeamCard({
  team,
  onEditClick,
  onDeleteClick,
  admin,
  isAdmin,
}: TeamCardProps) {
  const generateSpreadSheet = api.teams.generateSpreadSheet.useMutation();

  const generateRequest = async (
    downloadType: "json" | "excel",
    userId: string
  ) => {
    try {
      const response = await generateSpreadSheet.mutateAsync({
        userId,
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

  const getMenuItems = (userId: string) => {
    return [
      {
        key: "1",
        label: (
          <p onClick={() => generateRequest("excel", userId)}>
            <SnippetsOutlined />
          </p>
        ),
      },
      {
        key: "2",
        label: (
          <p onClick={() => generateRequest("json", userId)}>
            <CloudDownloadOutlined />
          </p>
        ),
      },
    ];
  };

  return (
    <Card
      key={team.id}
      title={team.name}
      extra={
        <div className="flex gap-4">
          {isAdmin && (
            <>
              <Link
                onClick={() =>
                  onEditClick({
                    id: team.id,
                    isOpen: true,
                  })
                }
                href="#"
              >
                Edit
              </Link>
              <Link
                href="#"
                onClick={() => onDeleteClick(team.id)}
                className="text-red-600 hover:text-red-400"
              >
                Delete
              </Link>
            </>
          )}
        </div>
      }
      className="h-fit w-72 bg-blue-100"
    >
      <p className="flex items-center justify-between text-sm font-bold">
        {admin?.name}
        <Avatar src={admin?.image} style={{ backgroundColor: "#fde3cf" }}>
          {admin?.name?.charAt(0)}
        </Avatar>
      </p>
      <Divider />
      {team.users.map((user) => (
        <p
          className="flex items-center justify-between pt-1 text-sm"
          key={user.email}
        >
          {user.name}
          {isAdmin ? (
            <Dropdown
              menu={{ items: getMenuItems(user.id) }}
              placement="topRight"
              className="cursor-pointer"
            >
              <Avatar src={user.image} style={{ backgroundColor: "#d4cffd" }}>
                {user.name?.charAt(0)}
              </Avatar>
            </Dropdown>
          ) : (
            <Avatar src={user.image} style={{ backgroundColor: "#d4cffd" }}>
              {user.name?.charAt(0)}
            </Avatar>
          )}
        </p>
      ))}
      <Divider />
    </Card>
  );
}
