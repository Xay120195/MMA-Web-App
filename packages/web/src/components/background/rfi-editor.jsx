import { useEffect } from 'react';
import 'remirror/styles/all.css';
import * as Y from 'yjs';
import { Remirror, useRemirror } from '@remirror/react';
import { WebsocketProvider } from 'y-websocket';
import {
  AnnotationExtension,
  PlaceholderExtension,
  YjsExtension,
} from 'remirror/extensions';
const testNames = [
  'John Doe',
  'Richard Doe',
  'John Martin',
  'Tom Cruise',
  'Emmy Crossby',
  'Cade Cox',
  'Kyle Roth',
  'Elliot Yang',
  'Trace Clarke',
];
const testColors = [
  '#f97316',
  '#86efac',
  '#1e40af',
  '#5b21b6',
  '#f472b6',
  '#9d174d',
  '#365314',
  '#7c2d12',
];

const RFIEditor = ({ item }) => {
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(
    'ws://122.248.246.56:4332',
    item.id,
    ydoc
  );
  const awareness = provider.awareness;
  const extensions = () => [
    new AnnotationExtension(),
    new PlaceholderExtension({
      placeholder: 'Open second tab and start to type...',
    }),
    new YjsExtension({ getProvider: () => provider }),
  ];
  const { manager } = useRemirror({ extensions });

  useEffect(() => {
    const firstName = localStorage.getItem('firstName'),
      lastName = localStorage.getItem('lastName');

    awareness.setLocalStateField('user', {
      name: `${firstName} ${lastName}`,
      color: testColors[Math.floor(Math.random() * testColors.length)],
    });
  }, []);

  return <Remirror manager={manager} autoFocus autoRender="end" />;
};

export default RFIEditor;
