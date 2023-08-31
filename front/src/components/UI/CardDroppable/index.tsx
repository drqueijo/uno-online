import {
  type DraggableProvidedDraggableProps,
  type DraggableProvidedDragHandleProps,
} from "react-beautiful-dnd";

interface CardDroppableProps {
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  innerRef: (element: HTMLElement | null) => void;
  title: string;
  index: number;
  onClick: () => void;
}

export const CardDroppable: React.FC<CardDroppableProps> = ({
  draggableProps,
  dragHandleProps,
  innerRef,
  title,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      {...draggableProps}
      {...dragHandleProps}
      ref={innerRef}
      className="mb-4 rounded-lg border border-black bg-white p-3 font-bold text-black"
    >
      {title}
    </div>
  );
};
export default CardDroppable;
