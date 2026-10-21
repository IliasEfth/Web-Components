import express, { type NextFunction, type Request, type Response } from 'express';
import { databaseFile, ensureDatabase } from './database.ts';
import { isOrderStatus, isOrderStatusFilter } from './order.ts';
import { OrdersStore } from './orders-store.ts';

const port = Number(process.env['PORT'] ?? 3000);

await ensureDatabase();
const store = await OrdersStore.open(databaseFile);
const app = express();

app.use(allowEveryOrigin);
app.use(express.json());

app.get('/orders', (request, response) => {
  const status = request.query['status'] ?? 'all';
  if (!isOrderStatusFilter(status)) {
    response.status(400).json({ error: 'status must be all, open or shipped' });
    return;
  }

  response.json(store.list(status));
});

app.get('/orders/:id', (request, response) => {
  const order = store.find(request.params.id);
  if (!order) {
    response.status(404).json({ error: `Order ${request.params.id} not found` });
    return;
  }

  response.json(order);
});

app.patch('/orders/:id', async (request, response) => {
  const { status } = (request.body ?? {}) as { status?: unknown };
  if (!isOrderStatus(status)) {
    response.status(400).json({ error: 'status must be open or shipped' });
    return;
  }

  const order = await store.updateStatus(request.params.id, status);
  if (!order) {
    response.status(404).json({ error: `Order ${request.params.id} not found` });
    return;
  }

  response.json(order);
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Mock API ready on http://localhost:${port}/orders`);
});

function allowEveryOrigin(request: Request, response: Response, next: NextFunction): void {
  response.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
}
