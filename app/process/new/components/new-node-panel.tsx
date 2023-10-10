interface NewNodePanelProps {
  stateName: string;
  onStateNameChange: (stateName: string) => void;
}

const NewNodePanel = ({ stateName, onStateNameChange }: NewNodePanelProps) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (!stateName) return;

    event.dataTransfer.setData('application/reactflow', stateName);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-md p-2">
      <div className="description">
        You can drag these nodes to the pane on the right.
      </div>
      <div
        className="mb-2 mr-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800"
        onDragStart={onDragStart}
        draggable
      >
        <input
          className="w-full text-sm font-medium text-white bg-transparent border-0 border-b-[1px] border-white placeholder-white focus:ring-0 focus:border-white focus:border-b-2 hover:border-b-2 placeholder:italic"
          placeholder="State name"
          value={stateName}
          onChange={(event) => onStateNameChange(event.target.value)}
        />
      </div>
    </div>
  );
};

export default NewNodePanel;
