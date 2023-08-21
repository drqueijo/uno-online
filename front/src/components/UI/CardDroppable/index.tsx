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
}

export const CardDroppable: React.FC<CardDroppableProps> = ({
  draggableProps,
  dragHandleProps,
  innerRef,
  title,
  index,
}) => {
  return (
    <div
      {...draggableProps}
      {...dragHandleProps}
      ref={innerRef}
      className="mb-4 rounded-lg border border-black bg-white p-3 font-bold text-black"
    >
      {title}
      {index}
    </div>
  );
};
export default CardDroppable;
