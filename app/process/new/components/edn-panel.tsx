import { clojure } from '@nextjournal/lang-clojure';
import CodeMirror from '@uiw/react-codemirror';
import { parseEDNString, toEDNStringFromSimpleObject } from 'edn-data';
import { ReactFlowInstance } from 'reactflow';

const EdnPanel = ({
  rfInstance,
}: {
  rfInstance: ReactFlowInstance<any, any>;
}) => {
  const stateObject = () => {
    if (!rfInstance) {
      return {
        format: ':v3',
        transitions: [],
        notification: [],
      };
    }

    const reactFlowState = rfInstance?.toObject();

    // Convert edges to transitions
    const transitions = reactFlowState.edges.map((edge) => {
      if (edge.source && edge.target) {
        const fromMaybe =
          edge.source === 'initial' ? {} : { from: edge.source };
        const transition = {
          name: `:transition/${edge.id}`,
          from: `:state/${edge.source}`,
          to: `:state/${edge.target}`,
          actor: `:actor/${edge.data.edgeType}`,
          actions: [],
          // ... other properties can be added as needed
        };
        return transition;
      }
    });

    return {
      format: ':v3',
      transitions,
      notifications: [],
      // ... other properties can be added as needed
    };
  };

  const formatEDNObject = (obj: object | any[], indent = 0) => {
    if (Array.isArray(obj)) {
      const formattedArray: string = obj
        .map((item) => formatEDNObject(item, indent + 1))
        .join(', ');
      return `[${formattedArray}]`;
    } else if (typeof obj === 'object' && obj !== null) {
      const formattedEntries: any = Object.entries(obj)
        .map(([key, value]) => {
          const formattedKey = `:${key}`;
          const formattedValue = formatEDNObject(value, indent + 1);
          return `${' '.repeat(indent + 1)}${formattedKey} ${formattedValue}`;
        })
        .join(',\n');
      return `{\n${formattedEntries}\n${' '.repeat(indent)}}`;
    } else {
      return obj;
    }
  };

  const beautifyEDN = (ednString: string) => {
    const parsedData = parseEDNString(ednString, {
      mapAs: 'object',
      keywordAs: 'string',
    });
    return formatEDNObject(parsedData as any);
  };

  const ednString = toEDNStringFromSimpleObject(stateObject() as any);
  const beautifiedEDNString = beautifyEDN(ednString);

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-md p-2 max-w-sm">
      <h1 className="text-bold">Transaction Process</h1>
      <CodeMirror
        readOnly
        value={beautifiedEDNString}
        height="300px"
        extensions={[clojure()]}
      />
      {/* <CodeMirror
          readOnly
          value={JSON.stringify(stateObject(), null, 2)} height="200px" extensions={[javascript({ jsx: true })]} /> */}
    </div>
  );
};

export default EdnPanel;
