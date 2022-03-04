import { GridKeyValue } from '@mui/x-data-grid';
import type { GridRowScrollEndParams, GridGroupingValueGetterParams } from '../models';
import type { GridPinnedColumns, GridRowGroupingModel, GridAggregationFunction } from '../hooks';
import type { GridCanBeReorderedPreProcessingContext } from '../hooks/features/columnReorder/columnReorderInterfaces';

export interface GridControlledStateEventLookupPro {
  rowGroupingModelChange: { params: GridRowGroupingModel };
  pinnedColumnsChange: { params: GridPinnedColumns };
}

export interface GridEventLookupPro {
  rowsScrollEnd: { params: GridRowScrollEndParams };
}

export interface GridPreProcessingGroupLookupPro {
  canBeReordered: {
    value: boolean;
    context: GridCanBeReorderedPreProcessingContext;
  };
}

export interface GridColDefPro {
  /**
   * Function that transforms a complex cell value into a key that be used for grouping the rows.
   * TODO: Move to `x-data-grid-premium`
   * @param {GridGroupingValueGetterParams} params Object containing parameters for the getter.
   * @returns {GridKeyValue | null | undefined} The cell key.
   */
  groupingValueGetter?: (params: GridGroupingValueGetterParams) => GridKeyValue | null | undefined;

  /**
   * TODO: Move to `x-data-grid-premium
   */
  aggregationFunction?: GridAggregationFunction;

  /**
   * TODO: Move to `x-data-grid-premium
   */
  availableAggregationFunctions?: GridAggregationFunction[];
}

declare module '@mui/x-data-grid' {
  interface GridEventLookup extends GridEventLookupPro {}

  interface GridControlledStateEventLookup extends GridControlledStateEventLookupPro {}

  interface GridPreProcessingGroupLookup extends GridPreProcessingGroupLookupPro {}
}

declare module '@mui/x-data-grid/models/colDef/gridColDef' {
  export interface GridColDef extends GridColDefPro {}
}
