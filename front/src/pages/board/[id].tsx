/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from "next/router";
import { api } from "next/utils/api";
import { type Card, type Status } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "react-beautiful-dnd";
import BoardColumn from "next/components/UI/BoardColumn";
import CardDroppable from "next/components/UI/CardDroppable";
import { PlusOutlined } from "@ant-design/icons";
import CreateOrUpdateCard from "next/components/UI/CreateOrUpdateCard";
import CreateOrUpdateStatus from "next/components/UI/CreateOrUpdateStatus";
import { useSession } from "next-auth/react";
import { FloatButton } from "antd";
import { SnippetsOutlined, CloudDownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

interface StatusWithCards extends Status {
  cards: Card[];
}

const MODAL_INITIAL_STATE = {
  isOpen: false,
  id: "",
  statusId: "",
};

export const BoardPanel: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: sessionData } = useSession();
  const board = api.cards.getCardsByBoardId.useQuery({
    boardId: typeof id === "string" ? id : "",
  });
  const generateSpreadSheet = api.boards.generateSpreadSheet.useMutation();
  const moveCards = api.cards.moveCards.useMutation();
  const [cardModal, setCardModal] = useState(MODAL_INITIAL_STATE);
  const [statusModal, setStatusModal] = useState(MODAL_INITIAL_STATE);
  const [columns, setColumns] = useState<StatusWithCards[]>([]);

  const isAdmin = board.data?.team?.adminId === sessionData?.user.id;

  useEffect(() => {
    if (!board.data) return;
    const mountedColumns = board.data.status.map((status) => {
      const cards = board.data?.cards
        .filter((card) => card.statusId === status.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);
      return { ...status, cards: cards ?? [] };
    });
    setColumns(mountedColumns);
  }, [board.data]);

  const generateRequest = async (downloadType: "json" | "excel") => {
    try {
      const response = await generateSpreadSheet.mutateAsync({
        boardId: id! as string,
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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (!destination ?? !source) return;

    let columnSourceCopy: StatusWithCards | null = null;
    let columnDestinationCopy: StatusWithCards | null = null;
    const columnsCopy = new Array(...columns);

    columns.forEach((col) => {
      if (col.id === source.droppableId) {
        columnSourceCopy = new Object({ ...col }) as StatusWithCards;
        const index = columnsCopy.findIndex(
          (column) => column.id === source.droppableId
        );
        columnsCopy.splice(index, 1);
        console.log(index);
      }
      if (col.id === destination.droppableId) {
        columnDestinationCopy = new Object({ ...col }) as StatusWithCards;
        const index = columnsCopy.findIndex(
          (column) => column.id === destination.droppableId
        );
        if (index !== -1) columnsCopy.splice(index, 1);
        console.log(index);
      }
    });

    if (!columnSourceCopy || !columnDestinationCopy) return;

    const removed = (columnSourceCopy as StatusWithCards).cards.splice(
      source.index,
      1
    );
    const card: Card = {
      ...removed[0]!,
      statusId: destination.droppableId,
      orderIndex: destination.index,
    };

    (columnDestinationCopy as StatusWithCards).cards.splice(
      destination.index,
      0,
      card
    );
    const resultColumns: StatusWithCards[] = [];
    if (source.droppableId === destination.droppableId)
      resultColumns.push(
        { ...(columnDestinationCopy as StatusWithCards) },
        ...columnsCopy
      );
    if (source.droppableId !== destination.droppableId)
      resultColumns.push(
        { ...(columnDestinationCopy as StatusWithCards) },
        { ...(columnSourceCopy as StatusWithCards) },
        ...columnsCopy
      );
    setColumns(resultColumns);
    const cardsToSave: Card[] = [];
    resultColumns.map((col) => {
      col.cards.map((card) => {
        cardsToSave.push(card);
      });
    });
    moveCards.mutate(cardsToSave);
  };

  const onModalOk = async () => {
    await board.refetch();
    setCardModal(MODAL_INITIAL_STATE);
    setStatusModal(MODAL_INITIAL_STATE);
  };

  return (
    <div className="flex flex-col overflow-x-auto">
      <CreateOrUpdateStatus
        {...statusModal}
        onOk={() => onModalOk()}
        onCancel={() => setStatusModal(MODAL_INITIAL_STATE)}
        boardId={id as string}
      />
      <CreateOrUpdateCard
        {...cardModal}
        onOk={() => onModalOk()}
        onCancel={() => setCardModal(MODAL_INITIAL_STATE)}
        boardId={id as string}
      />
      <DragDropContext onDragEnd={(e) => onDragEnd(e)}>
        <div className="flex h-full w-fit gap-8 py-4">
          {columns
            ?.sort((a, b) => {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return dateA - dateB;
            })
            .map((status) => (
              <Droppable key={status.id} droppableId={status.id} type="CARD">
                {(provided) => (
                  <BoardColumn
                    onEditClick={() =>
                      setStatusModal({
                        isOpen: true,
                        id: status.id,
                        statusId: status.id,
                      })
                    }
                    color={status.color}
                    dropableProps={provided.droppableProps}
                    innerRef={provided.innerRef}
                    title={status.name}
                  >
                    {status.cards
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((card, cardIndex) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={cardIndex}
                        >
                          {(provided) => (
                            <CardDroppable
                              onClick={() =>
                                setCardModal({
                                  isOpen: true,
                                  id: card.id,
                                  statusId: status.id,
                                })
                              }
                              index={cardIndex}
                              draggableProps={provided.draggableProps}
                              dragHandleProps={provided.dragHandleProps}
                              innerRef={provided.innerRef}
                              title={card.title}
                            />
                          )}
                        </Draggable>
                      ))}
                    <div
                      onClick={() =>
                        setCardModal({
                          isOpen: true,
                          id: "",
                          statusId: status.id,
                        })
                      }
                      className="mb-4 flex cursor-pointer items-center justify-between rounded-lg border border-black bg-white p-2 font-bold text-black opacity-70"
                    >
                      add new card <PlusOutlined />
                    </div>
                    {provided.placeholder}
                  </BoardColumn>
                )}
              </Droppable>
            ))}
          <div
            onClick={() =>
              setStatusModal({
                isOpen: true,
                id: "",
                statusId: "",
              })
            }
            className="mb-4 flex h-fit w-64 cursor-pointer items-center justify-between rounded-lg border border-black bg-[#001529] p-2 font-bold text-white"
          >
            add new status <PlusOutlined />
          </div>
        </div>
      </DragDropContext>
      {isAdmin && (
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
      )}
    </div>
  );
};
export default BoardPanel;
