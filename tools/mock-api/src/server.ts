import express from 'express';
import { databaseFile, ensureDatabase } from './database.ts';
import { isNoteText, maxNoteLength } from './note.ts';
import { isOrderStatus, isOrderStatusFilter } from './order.ts';
import { OrdersStore } from './orders-store.ts';

const port = Number(process.env['PORT'] ?? 3000);

await ensureDatabase();
const store = await OrdersStore.open(databaseFile);
const app = express();

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

app.get('/orders/:id/notes', (request, response) => {
  if (!store.find(request.params.id)) {
    response.status(404).json({ error: `Order ${request.params.id} not found` });
    return;
  }

  response.json(store.listNotes(request.params.id));
});

app.post('/orders/:id/notes', async (request, response) => {
  const { text } = (request.body ?? {}) as { text?: unknown };
  if (!isNoteText(text)) {
    response.status(400).json({ error: `text must be 1 to ${maxNoteLength} characters` });
    return;
  }

  if (!store.find(request.params.id)) {
    response.status(404).json({ error: `Order ${request.params.id} not found` });
    return;
  }

  response.status(201).json(await store.addNote(request.params.id, text));
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Mock API ready on http://localhost:${port}/orders`);
});
