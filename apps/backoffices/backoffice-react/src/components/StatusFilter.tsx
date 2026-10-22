import type { OrderStatusFilter } from '@shop/orders-contract';

const statuses: OrderStatusFilter[] = ['all', 'open', 'shipped'];

interface IStatusFilterProps {
  value: OrderStatusFilter;
  onChange: (status: OrderStatusFilter) => void;
}

export function StatusFilter({ value, onChange }: IStatusFilterProps) {
  return (
    <div className="toolbar" role="group" aria-label="Order status">
      {statuses.map((status) => (
        <button
          key={status}
          type="button"
          className="button"
          aria-pressed={status === value}
          onClick={() => onChange(status)}
        >
          {status}
        </button>
      ))}
    </div>
  );
}
