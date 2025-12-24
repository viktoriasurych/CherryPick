import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Напівпрозорість, коли тягнеш
    cursor: 'grab',
    touchAction: 'none' // Важливо для мобільних
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  );
}