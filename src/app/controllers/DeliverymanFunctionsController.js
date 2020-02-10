import Sequelize from 'sequelize';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

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

  async update(req, res) {}

  async store(req, res) {}
}

export default new DeliverymanFunctionsController();
