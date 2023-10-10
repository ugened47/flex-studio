import { useMemo } from 'react';

import cx from 'classnames';

import {
  AutomaticArrow,
  CustomerArrow,
  OperatorArrow,
  PrivilegedStateIcon,
  ProviderArrow,
} from '@/components/shared/icons/transition-arrow';
import { SelectedEdgeType } from '@/lib/constants';

interface NewTransitionPanelProps {
  onSelect: (edgeType: SelectedEdgeType) => void;
  togglePrivileged?: (edgeType: string) => void;
  selectedEdge?: SelectedEdgeType;
  newEdgeName: string;
  onEdgeNameChange: (edgeName: string) => void;
}

const NewTransitionPanel = ({
  onSelect,
  selectedEdge,
  onEdgeNameChange,
  newEdgeName,
}: NewTransitionPanelProps) => {
  const handleSelect = (edgeType: SelectedEdgeType) => {
    onSelect(edgeType);
  };

  const edgeTypes = useMemo(
    () => [
      {
        type: SelectedEdgeType.Customer,
        label: 'Customer',
        icon: <CustomerArrow />,
      },
      {
        type: SelectedEdgeType.Provider,
        label: 'Provider',
        icon: <ProviderArrow />,
      },
      {
        type: SelectedEdgeType.Operator,
        label: 'Marketplace Operator',
        icon: <OperatorArrow />,
      },
      {
        type: SelectedEdgeType.Automatic,
        label: 'Automatic',
        icon: <AutomaticArrow />,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-md p-2">
      <input
        className="flex flex-row items-center gap-2 cursor-pointer mb-2 rounded-xl border-gray-200 bg-gray-50 shadow-md p-1"
        placeholder="Transition name"
        value={newEdgeName}
        onChange={(event) => onEdgeNameChange(event.target.value)}
      />

      {edgeTypes.map(({ type, label, icon }) => (
        <div
          key={type}
          className={cx(
            'flex flex-row items-center gap-2 cursor-pointer mb-2',
            {
              'rounded-xl border-gray-200 bg-gray-50 shadow-md p-1':
                selectedEdge === type,
            },
          )}
          onClick={() => handleSelect(type)}
        >
          {icon}
          <span className="underline text-[#4A4A4A] text-sm leading-6 relative top-[-2px]">
            {label}
          </span>
        </div>
      ))}

      <div className="flex flex-row items-center gap-2">
        <PrivilegedStateIcon />
        <span className="text-[#4A4A4A] text-sm leading-6">
          Privileged transition
        </span>
      </div>
    </div>
  );
};

export default NewTransitionPanel;
