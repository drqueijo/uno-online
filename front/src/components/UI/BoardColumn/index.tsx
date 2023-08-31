import { type ReactNode } from "react";
import { type DroppableProvidedProps } from "react-beautiful-dnd";
import { EditOutlined } from "@ant-design/icons";

interface BoardColumnProps {
  title: string;
  dropableProps: DroppableProvidedProps;
  innerRef: (element: HTMLElement | null) => void;
  children: ReactNode;
  color: string;
  onEditClick: () => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  title,
  dropableProps,
  innerRef,
  children,
  color,
  onEditClick,
}) => {
  return (
    <div className="h-full w-64 text-black" {...dropableProps} ref={innerRef}>
      <div className="flex h-[5%] items-center justify-between pb-4 text-lg font-bold text-[#001529]">
        {title}
        <div className="flex gap-4">
          <EditOutlined className="text-blue-600" onClick={onEditClick} />
        </div>
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
