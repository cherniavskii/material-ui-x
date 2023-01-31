# Data Grid - Row editing

<p class="description">The data grid has built-in support for row editing.</p>

## Row editing

Row editing lets the user edit all cells in a row simultaneously.
The same basic rules for cell editing also apply to row editing.
To enable it, change the `editMode` prop to `"row"`, then follow the same guidelines as those for cell editing to set the `editable` property in the definition of the columns that the user can edit.

```tsx
<DataGrid editMode="row" columns={[{ field: 'name', editable: true }]} />
```

The following demo illustrates how row editing works.
The user can [start](/x/react-data-grid/editing/#start-editing) and [stop](/x/react-data-grid/editing/#stop-editing) editing a row using the same actions as those provided for cell editing (e.g. double-clicking a cell).

{{"demo": "BasicRowEditingGrid.js", "bg": "inline", "defaultCodeOpen": false}}

:::warning
By design, when changing the value of a cell all `preProcessEditCellProps` callbacks from other columns are also called.
This lets you apply conditional validation where the value of a cell impacts the validation status of another cell in the same row.
If you only want to run validation when the value has changed, check if the `hasChanged` param is `true`.
:::

### Full-featured CRUD component

Row editing makes it possible to create a full-featured CRUD (Create, Read, Update, Delete) component similar to those found in enterprise applications.
In the following demo, the typical ways to start and stop editing are all disabled.
Instead, use the buttons available in each row or in the toolbar.

{{"demo": "FullFeaturedCrudGrid.js", "bg": "inline", "defaultCodeOpen": false}}

## API

- [DataGrid](/x/api/data-grid/data-grid/)
- [DataGridPro](/x/api/data-grid/data-grid-pro/)
- [DataGridPremium](/x/api/data-grid/data-grid-premium/)
