import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import OrderController from './app/controllers/OrderController';
import DeliverymanFunctionsController from './app/controllers/DeliverymanFunctionsController';
import OrderFunctionsController from './app/controllers/OrderFunctionsController';
import OrderProblemsController from './app/controllers/OrderProblemsController';
import ProblemsController from './app/controllers/ProblemsController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/deliveryman/:id', DeliverymanFunctionsController.index);
routes.put(
  '/deliveryman/:deliveryman_id/delivery/:delivery_id',
  DeliverymanFunctionsController.update
);
routes.post('/delivery/:id/problems', DeliverymanFunctionsController.store);

routes.get('/deliveries/:id', OrderFunctionsController.index);
routes.put(
  '/delivery/:delivery_id/signature/:signature_id',
  OrderFunctionsController.update
);

routes.get('/problems', ProblemsController.index);
routes.get('/problems/:id', OrderProblemsController.index);
routes.delete('/problem/:id/cancel-delivery', OrderProblemsController.delete);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/deliverymen', DeliverymanController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen', DeliverymanController.update);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

routes.get('/orders', OrderController.index);
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

export default routes;
