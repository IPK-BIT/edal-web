import { Server } from '@tus/server';
import { FileStore } from '@tus/file-store';
import fs from 'fs';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const tusServer = new Server({
  path: '/tus-receiver',
  datastore: new FileStore({ directory: uploadDir }),
});

export const POST = async (event) => {
  return tusServer.handleWeb(event.request);
};

export const OPTIONS = POST;
export const HEAD = POST;
export const PATCH = POST;
export const DELETE = POST;
export const GET = POST;