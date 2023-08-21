import { type ReactNode } from "react";
import { type DroppableProvidedProps } from "react-beautiful-dnd";

interface BoardColumnProps {
  title: string;
  dropableProps: DroppableProvidedProps;
  innerRef: (element: HTMLElement | null) => void;
  children: ReactNode;
  color: string;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  title,
  dropableProps,
  innerRef,
  children,
  color,
}) => {
  return (
    <div className="h-full w-64 text-black" {...dropableProps} ref={innerRef}>
      <div className="h-[5%] pb-4 text-center text-lg font-bold text-[#001529]">
        {title}
      </div>
      <div
        className={`h-[95%] rounded p-2 text-white opacity-75`}
        style={{ backgroundColor: color }}
      >
        {children}
      </div>
    </div>
  );
};
export default BoardColumn;
