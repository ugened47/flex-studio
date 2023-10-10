interface GraphgActionsPanelProps {
  onLayout: ({ direction, useInitialNodes }: any) => void;
  onSave: () => void;
  onRestore: () => void;
}

const GraphgActionsPanel = ({
  onLayout,
  onSave,
  onRestore,
}: GraphgActionsPanelProps) => {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-md p-2">
      <button
        onClick={() => onLayout({ direction: 'DOWN' })}
        className="mb-2 mr-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800"
      >
        vertical layout
      </button>

      <button
        onClick={onSave}
        className="mb-2 mr-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800"
      >
        save
      </button>
      <button
        onClick={onRestore}
        className="group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-pink-200 group-hover:from-pink-500 group-hover:to-orange-400 dark:text-white dark:focus:ring-pink-800"
      >
        <span className="relative rounded-md px-5 py-2.5 text-gray-900 transition-all duration-75 ease-in group-hover:bg-opacity-0 group-hover:text-white">
          restore
        </span>
      </button>
    </div>
  );
};

export default GraphgActionsPanel;
