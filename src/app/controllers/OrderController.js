import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import SolicitationMail from '../jobs/SolicitationMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll({
      order: ['created_at'],
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
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

  async store(req, res) {
    const { product_name, recipient_name, deliveryman_name } = req.body;

    const recipient = await Recipient.findOne({
      where: { name: recipient_name },
    });

    if (!recipient) {
      return res.status(400).json({ erro: 'Recipient does not exist.' });
    }

    const deliveryman = await Deliveryman.findOne({
      where: { name: deliveryman_name, deleted_at: null },
    });

    if (!deliveryman) {
      return res.status(400).json({ erro: 'Deliveryman does not exist.' });
    }

    const order = await Order.create({
      product: product_name,
      recipient_id: recipient.id,
      deliveryman_id: deliveryman.id,
    });

    const infos = {
      deliveryman_name: deliveryman.name,
      deliveryman_email: deliveryman.email,
      product_name,
      recipient_name,
      logradouro: recipient.logradouro,
      numero: recipient.numero,
      cidade: recipient.cidade,
      estado: recipient.estado,
      complemento: recipient.complemento,
      cep: recipient.cep,
    };

    await Queue.add(SolicitationMail.key, {
      infos,
    });

    return res.json(order);
  }
}

export default new OrderController();
