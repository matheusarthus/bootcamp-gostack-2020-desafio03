import Sequelize from 'sequelize';
import { format } from 'date-fns';
import * as Yup from 'yup';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Problem from '../models/Problem';

class DeliverymanFunctionsController {
  async index(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exist.' });
    }

    const orders = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        end_date: { [Sequelize.Op.not]: null },
      },
      attributes: ['id', 'product', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'logradouro', 'numero', 'cidade', 'estado'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(orders);
  }

  async update(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exist.' });
    }

    const order = await Order.findByPk(req.params.delivery_id);

    if (!order) {
      return res.status(400).json({ error: 'Delivery does not exist.' });
    }

    if (order.canceled_at !== null) {
      return res.status(400).json({ error: 'Delivery canceled.' });
    }

    if (order.start_date !== null) {
      return res.status(400).json({ error: 'Delivery already started.' });
    }

    if (order.deliveryman_id != req.params.deliveryman_id) {
      return res.status(400).json({ error: 'Deliveryman is not authorized.' });
    }

    const countOrders = await Order.findAndCountAll({
      where: {
        deliveryman_id: req.params.deliveryman_id,
        start_date: { [Sequelize.Op.not]: null },
        end_date: null,
        canceled_at: null,
      },
    });

    if (countOrders.count >= 5) {
      return res
        .status(401)
        .json({ error: 'Number of orders per day exceeded.' });
    }

    const correntHour = format(new Date(), 'HH');

    if (correntHour < 8 || correntHour > 18) {
      return res.status(401).json({ error: 'Pickup time not allowed.' });
    }

    order.start_date = new Date();

    await order.save();

    return res.json(order);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fail' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Delivery does not exist.' });
    }

    if (order.canceled_at !== null) {
      return res.status(400).json({ error: 'Delivery canceled.' });
    }

    if (order.end_date !== null) {
      return res.status(400).json({ error: 'Order already delivered.' });
    }

    const problem = await Problem.create({
      delivery_id: req.params.id,
      description: req.body.description,
    });

    return res.json(problem);
  }
}

export default new DeliverymanFunctionsController();
