import React from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import { DragSource } from '../../typings';
import { useAppSelector } from '../../store';
import { selectDragRotated, selectItemAmount } from '../../store/inventory';
import { isSlotWithItem } from '../../helpers';

const GridDragPreview: React.FC = () => {
  const dragRotated = useAppSelector(selectDragRotated);
  const itemAmount = useAppSelector(selectItemAmount);

  const { data, isDragging, currentOffset } = useDragLayer((monitor) => ({
    data: monitor.getItem() as DragSource | null,
    currentOffset: monitor.getClientOffset() as XYCoord | null,
    isDragging: monitor.isDragging(),
  }));

  const sourceCount = useAppSelector((state) => {
    if (!data?.item) return null;

    const inventories = [
      state.inventory.leftInventory,
      state.inventory.backpackInventory,
      state.inventory.rightInventory,
    ];

    const sourceInventory = inventories.find((inv) => inv.type === data.inventory && (!data.inventoryId || inv.id === data.inventoryId));
    if (!sourceInventory) return null;

    const sourceItem = sourceInventory.items.find((slot) => slot != null && slot.slot === data.item.slot);
    return sourceItem && isSlotWithItem(sourceItem) ? sourceItem.count : null;
  });

  if (!isDragging || !currentOffset || !data?.item) return null;

  const baseW = data.width ?? 1;
  const baseH = data.height ?? 1;
  const effectiveW = dragRotated ? baseH : baseW;
  const effectiveH = dragRotated ? baseW : baseH;
  const selectedAmount = data.splitCount ?? (itemAmount > 0 ? itemAmount : null);
  const dragSplitAmount = sourceCount && selectedAmount ? Math.min(selectedAmount, sourceCount - 1) : null;
  const showSplitAmount = dragSplitAmount !== null && dragSplitAmount >= 1;

  return (
    <div
      className="grid-drag-preview"
      style={{
        transform: `translate(${currentOffset.x}px, ${currentOffset.y}px) translate(-50%, -50%)`,
        width: `calc(${effectiveW} * var(--cell-size) + ${effectiveW - 1} * var(--grid-gap))`,
        height: `calc(${effectiveH} * var(--cell-size) + ${effectiveH - 1} * var(--grid-gap))`,
      }}
    >
      <div
        className="grid-drag-preview-image"
        style={{
          backgroundImage: data.image,
          transform: dragRotated ? 'rotate(90deg) scale(0.9)' : undefined,
        }}
      />
      {showSplitAmount && <div className="grid-drag-preview-amount">{dragSplitAmount}</div>}
    </div>
  );
};

export default GridDragPreview;
