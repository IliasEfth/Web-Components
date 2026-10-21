import { Link, useLoaderData } from 'react-router';
import type { IOrder } from '../models/order';

const euros = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });

export function DashboardPage() {
  const orders = useLoaderData<IOrder[]>();
  const openOrders = orders.filter((order) => order.status === 'open');
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <>
      <p className="intro">
        A plain React page: no remote is loaded here. Open an order to jump into the Angular
        detail through the URL.
      </p>

      <div className="tiles">
        <section className="card tile">
          <span className="tile__label">Open orders</span>
          <span className="tile__value">{openOrders.length}</span>
        </section>
        <section className="card tile">
          <span className="tile__label">Shipped orders</span>
          <span className="tile__value">{orders.length - openOrders.length}</span>
        </section>
        <section className="card tile">
          <span className="tile__label">Revenue</span>
          <span className="tile__value">{euros.format(revenue)}</span>
        </section>
      </div>

      <section className="card">
        <h2>Waiting to ship</h2>
        <ul className="order-links">
          {openOrders.map((order) => (
            <li key={order.id}>
              <Link to={`/orders/${order.id}`}>{order.id}</Link>
              <span>{order.customer}</span>
              <span>{euros.format(order.total)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
