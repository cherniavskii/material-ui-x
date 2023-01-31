# Data Grid - Editing events

<p class="description">Editing events emitted by the data grid.</p>

## Editing events

The mouse and keyboard interactions that [start](/x/react-data-grid/editing/#start-editing) and [stop](/x/react-data-grid/editing/#stop-editing) cell editing do so by triggering the `'cellEditStart'` and `'cellEditStop'` [events](/x/react-data-grid/events/), respectively.
For row editing, the events are `'rowEditStart'` and `'rowEditStop'`.
You can control how these events are handled to customize editing behavior.

For convenience, you can also listen to these events using their respective props:

- `onCellEditStart`
- `onCellEditStop`
- `onRowEditStart`
- `onRowEditStop`

These events and props are called with an object containing the row ID and column field of the cell that is being edited.
The object also contains a `reason` param that specifies which type of interaction caused the event to be fired—for instance, `'cellDoubleClick'` when a double-click initiates edit mode.

The following demo shows how to prevent the user from exiting edit mode when clicking outside of a cell.
To do this, the `onCellEditStop` prop is used to check if the `reason` is `'cellFocusOut'`.
If that condition is true, it [disables](/x/react-data-grid/events/#disabling-the-default-behavior) the default event behavior.
In this context, the user can only stop editing a cell by pressing <kbd class="key">Enter</kbd>, <kbd class="key">Escape</kbd> or <kbd class="key">Tab</kbd>.

{{"demo": "DisableStopEditModeOnFocusOut.js", "bg": "inline"}}

## API

- [DataGrid](/x/api/data-grid/data-grid/)
- [DataGridPro](/x/api/data-grid/data-grid-pro/)
- [DataGridPremium](/x/api/data-grid/data-grid-premium/)
