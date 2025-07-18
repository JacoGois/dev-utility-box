import { RefObject } from "react";

type TodoListProps = {
  instanceId: string;
  parentModalContainerRef?: RefObject<HTMLDivElement>;
};

export const TodoList = ({ instanceId }: TodoListProps) => {
  return (
    <div className="text-black font-bold text-2xl flex h-full w-full items-center justify-center">
      {instanceId}
    </div>
  );
};
