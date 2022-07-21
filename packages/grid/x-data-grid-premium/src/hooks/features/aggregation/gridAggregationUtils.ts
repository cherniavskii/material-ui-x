import * as React from 'react';
import { capitalize } from '@mui/material';
import {
  GridColDef,
  GridRowId,
  GRID_ROOT_GROUP_ID,
  GridFooterNode,
  GridGroupNode,
} from '@mui/x-data-grid-pro';
import {
  GridColumnRawLookup,
  GridHydrateRowsValue,
  isDeepEqual,
  insertNodeInTree,
  removeNodeFromTree,
  addPinnedRow,
} from '@mui/x-data-grid-pro/internals';
import {
  GridAggregationFunction,
  GridAggregationModel,
  GridAggregationRule,
  GridAggregationRules,
} from './gridAggregationInterfaces';
import { GridStatePremium } from '../../../models/gridStatePremium';
import { DataGridPremiumProcessedProps } from '../../../models/dataGridPremiumProps';
import { GridApiPremium } from '../../../models/gridApiPremium';

export const PRIVATE_GRID_AGGREGATION_ROOT_FOOTER_ROW_ID = 'auto-generated-group-footer-root';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const private_getAggregationFooterRowIdFromGroupId = (groupId: GridRowId | null) => {
  if (groupId == null) {
    return PRIVATE_GRID_AGGREGATION_ROOT_FOOTER_ROW_ID;
  }

  return `auto-generated-group-footer-${groupId}`;
};

export const canColumnHaveAggregationFunction = ({
  column,
  aggregationFunctionName,
  aggregationFunction,
}: {
  column: GridColDef | undefined;
  aggregationFunctionName: string;
  aggregationFunction: GridAggregationFunction | undefined;
}): boolean => {
  if (!column || !column.private_aggregable) {
    return false;
  }

  if (!aggregationFunction) {
    return false;
  }

  if (column.private_availableAggregationFunctions != null) {
    return column.private_availableAggregationFunctions.includes(aggregationFunctionName);
  }

  if (!aggregationFunction.columnTypes) {
    return true;
  }

  return aggregationFunction.columnTypes.includes(column.type!);
};

export const getAvailableAggregationFunctions = ({
  aggregationFunctions,
  column,
}: {
  aggregationFunctions: Record<string, GridAggregationFunction>;
  column: GridColDef;
}) =>
  Object.keys(aggregationFunctions).filter((aggregationFunctionName) =>
    canColumnHaveAggregationFunction({
      column,
      aggregationFunctionName,
      aggregationFunction: aggregationFunctions[aggregationFunctionName],
    }),
  );

export const mergeStateWithAggregationModel =
  (aggregationModel: GridAggregationModel) =>
  (state: GridStatePremium): GridStatePremium => ({
    ...state,
    private_aggregation: { ...state.private_aggregation, model: aggregationModel },
  });

export const getAggregationRules = ({
  columnsLookup,
  aggregationModel,
  aggregationFunctions,
}: {
  columnsLookup: GridColumnRawLookup;
  aggregationModel: GridAggregationModel;
  aggregationFunctions: Record<string, GridAggregationFunction>;
}) => {
  const aggregationRules: GridAggregationRules = {};

  Object.entries(aggregationModel).forEach(([field, columnItem]) => {
    if (
      columnsLookup[field] &&
      canColumnHaveAggregationFunction({
        column: columnsLookup[field],
        aggregationFunctionName: columnItem,
        aggregationFunction: aggregationFunctions[columnItem],
      })
    ) {
      aggregationRules[field] = {
        aggregationFunctionName: columnItem,
        aggregationFunction: aggregationFunctions[columnItem],
      };
    }
  });

  return aggregationRules;
};

interface AddFooterRowsParams {
  getAggregationPosition: DataGridPremiumProcessedProps['private_getAggregationPosition'];
  /**
   * If `true`, there are some aggregation rules to apply
   */
  hasAggregationRule: boolean;
  apiRef: React.MutableRefObject<GridApiPremium>;
}

/**
 * Add a footer for each group that has at least one column with an aggregated value.
 */
export const addFooterRows = (
  hydrateRowsValue: GridHydrateRowsValue,
  params: AddFooterRowsParams,
) => {
  let newHydrateRowsValue = {
    ...hydrateRowsValue,
    tree: { ...hydrateRowsValue.tree },
    treeDepths: { ...hydrateRowsValue.treeDepths },
  };

  const addGroupFooter = (groupNode: GridGroupNode) => {
    if (params.hasAggregationRule && params.getAggregationPosition(groupNode) === 'footer') {
      const footerId = private_getAggregationFooterRowIdFromGroupId(groupNode.id);
      if (groupNode.footerId !== footerId) {
        if (groupNode.footerId != null) {
          removeNodeFromTree({
            node: newHydrateRowsValue.tree[groupNode.footerId],
            tree: newHydrateRowsValue.tree,
            treeDepths: newHydrateRowsValue.treeDepths,
          });
        }

        if (groupNode.depth === -1) {
          newHydrateRowsValue = addPinnedRow({
            params: newHydrateRowsValue,
            apiRef: params.apiRef,
            position: 'bottom',
            rowId: footerId,
            rowModel: {},
          });
        } else {
          const footerNode: GridFooterNode = {
            id: footerId,
            parent: groupNode.id,
            depth: groupNode ? groupNode.depth + 1 : 0,
            type: 'footer',
          };

          insertNodeInTree({
            node: footerNode,
            tree: newHydrateRowsValue.tree,
            treeDepths: newHydrateRowsValue.treeDepths,
          });
        }
      }
    } else if (groupNode.footerId != null) {
      removeNodeFromTree({
        node: newHydrateRowsValue.tree[groupNode.footerId],
        tree: newHydrateRowsValue.tree,
        treeDepths: newHydrateRowsValue.treeDepths,
      });
      newHydrateRowsValue.tree[groupNode.id] = {
        ...(newHydrateRowsValue.tree[groupNode.id] as GridGroupNode),
        footerId: null,
      };
    }

    groupNode.children.forEach((childId) => {
      const childNode = newHydrateRowsValue.tree[childId];
      if (childNode.type === 'group') {
        addGroupFooter(childNode);
      }
    });
  };

  addGroupFooter(newHydrateRowsValue.tree[GRID_ROOT_GROUP_ID] as GridGroupNode);

  return {
    ...hydrateRowsValue,
    ...newHydrateRowsValue,
  };
};

/**
 * Compares two sets of aggregation rules to determine if they are equal or not.
 */
export const hasAggregationRulesChanged = (
  previousValue: GridAggregationRules | undefined,
  newValue: GridAggregationRules,
) => {
  const previousFields = Object.keys(previousValue ?? {});
  const newFields = Object.keys(newValue);

  if (!isDeepEqual(previousFields, newFields)) {
    return true;
  }

  return newFields.some((field) => {
    const previousRule = previousValue?.[field];
    const newRule = newValue[field];

    if (previousRule?.aggregationFunction !== newRule?.aggregationFunction) {
      return true;
    }

    if (previousRule?.aggregationFunctionName !== newRule?.aggregationFunctionName) {
      return true;
    }

    return false;
  });
};

export const getAggregationFunctionLabel = ({
  apiRef,
  aggregationRule,
}: {
  apiRef: React.MutableRefObject<GridApiPremium>;
  aggregationRule: GridAggregationRule;
}): string => {
  if (aggregationRule.aggregationFunction.label != null) {
    return aggregationRule.aggregationFunction.label;
  }

  try {
    return apiRef.current.getLocaleText(
      `aggregationFunctionLabel${capitalize(
        aggregationRule.aggregationFunctionName,
      )}` as 'aggregationFunctionLabelSum',
    );
  } catch (e) {
    return aggregationRule.aggregationFunctionName;
  }
};
