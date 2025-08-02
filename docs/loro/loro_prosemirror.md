## Prosemirror Binding for Loro




-   Sync document state with Loro
-   Sync cursors with Loro's Awareness and [Cursor](https://loro.dev/docs/tutorial/cursor)
-   Undo/Redo in collaborative editing
-   [🎨 Try it online](https://main--6661e86e215da40180d90507.chromatic.com/)

```
import {
  CursorAwareness,
  LoroCursorPlugin,
  LoroSyncPlugin,
  LoroUndoPlugin,
  redo,
  undo,
} from "loro-prosemirror";
import { LoroDoc } from "loro-crdt";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";

const doc \= new LoroDoc();
const awareness \= new CursorAwareness(doc.peerIdStr);
const plugins \= \[
  ...pmPlugins,
  LoroSyncPlugin({ doc }),
  LoroUndoPlugin({ doc }),
  keymap({
    "Mod-z": undo,
    "Mod-y": redo,
    "Mod-Shift-z": redo,
  }),
  LoroCursorPlugin(awareness, {}),
\];
const editor \= new EditorView(editorDom, {
  state: EditorState.create({ doc, plugins }),
});
```

collab-undo.mp4