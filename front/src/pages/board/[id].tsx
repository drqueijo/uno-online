/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from "next/router";
import { api } from "next/utils/api";
import { Card, type Board, Status } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
} from "react-beautiful-dnd";
import { Button, Input } from "antd";
import { useSession } from "next-auth/react";
import BoardColumn from "next/components/UI/BoardColumn";
import CardDroppable from "next/components/UI/CardDroppable";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CreateOrUpdateCard from "next/components/UI/CreateOrUpdateCard";
import CreateOrUpdateStatus from "next/components/UI/CreateOrUpdateStatus";

interface StatusWithCards extends Status {
  cards: Card[];
}

const MODAL_INITIAL_STATE = {
  isOpen: false,
  id: "",
  statusId: "",
};

export const BoardPanel: React.FC = ({}) => {
  const router = useRouter();
  const { id } = router.query;

  const board = api.cards.getCardsByBoardId.useQuery({
    boardId: typeof id === "string" ? id : "",
  });
  const updateCard = api.cards.moveCard.useMutation();
  const [cardModal, setCardModal] = useState(MODAL_INITIAL_STATE);
  const [statusModal, setStatusModal] = useState(MODAL_INITIAL_STATE);
  const [columns, setColumns] = useState<StatusWithCards[]>([]);

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (!destination ?? !source) return;

    let columnSourceCopy: StatusWithCards | null = null;
    columns.forEach((col) => {
      if (col.id !== source.droppableId) return;
      columnSourceCopy = col;
    });
    if (!columnSourceCopy) return;
    if (source.droppableId === destination.droppableId) {
      if (!columnSourceCopy) return;
      columnSourceCopy;
    }
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
        <div className="flex h-full gap-4 py-4">
          {columns?.map((status, statusIndex) => (
            <Droppable key={status.id} droppableId={status.id} type="CARD">
              {(provided) => (
                <BoardColumn
                  color={status.color}
                  dropableProps={provided.droppableProps}
                  innerRef={provided.innerRef}
                  title={status.name}
                >
                  {status.cards.map((card, cardIndex) => (
                    <Draggable
                      key={card.id}
                      draggableId={card.id}
                      index={cardIndex}
                    >
                      {(provided) => (
                        <CardDroppable
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
    </div>
  );
};
export default BoardPanel;
