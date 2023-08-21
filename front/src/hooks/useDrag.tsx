import { useState } from "react";
import { DropResult } from "react-beautiful-dnd";

export const useDrag = () => {
  const [items, setItems] = useState([]);

  const onDragEnd = (result: DropResult) => {
    return;
  };
  return [items, onDragEnd];
};
export default useDrag;
