"use client";

import { useId, type ReactNode } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableAreaProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  layout?: "list" | "grid";
  children: ReactNode;
}

/**
 * Drag-to-reorder for a list or grid: mouse, touch (by the handle, so the
 * page still scrolls) and keyboard (focus the handle, Space, arrows, Space).
 */
export function SortableArea<T extends { id: string }>({
  items,
  onReorder,
  layout = "list",
  children,
}: SortableAreaProps<T>) {
  // A stable id, so the server and browser agree on dnd-kit's aria ids
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const position = (id: string | number | undefined) =>
    `position ${items.findIndex((i) => i.id === id) + 1} of ${items.length}`;

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from !== -1 && to !== -1) onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable: "To move, press Space. Use the arrow keys to move, then Space to drop, or Escape to cancel.",
        },
        announcements: {
          onDragStart: ({ active }) => `Picked up the item at ${position(active.id)}.`,
          onDragOver: ({ over }) => (over ? `Moving to ${position(over.id)}.` : undefined),
          onDragEnd: ({ over }) => (over ? `Dropped at ${position(over.id)}.` : "Dropped."),
          onDragCancel: () => "Move cancelled.",
        },
      }}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemProps {
  id: string;
  /** Read out for the drag handle, e.g. "Move Ceylon Road" */
  label: string;
  className?: string;
  children: (handle: ReactNode) => ReactNode;
}

/** One draggable item; place the `handle` it passes you wherever it belongs */
export function SortableItem({ id, label, className = "", children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={label}
      className="flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-muted hover:bg-stone hover:text-ink focus-visible:outline-2 focus-visible:outline-gold active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical aria-hidden className="size-5" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`${className} ${isDragging ? "relative z-10 shadow-xl ring-1 ring-gold-light" : ""}`}
    >
      {children(handle)}
    </div>
  );
}
