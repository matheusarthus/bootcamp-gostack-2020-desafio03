import Order from '../models/Order';
import Problem from '../models/Problem';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class OrderProblemsController {
  async index(req, res) {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Order does not exist' });
    }

    const problems = await Problem.findAll({
      where: { delivery_id: req.params.id },
      attributes: ['description'],
    });

    return res.json(problems);
  }

  async delete(req, res) {
    const problem = await Problem.findByPk(req.params.id);

    if (!problem) {
      return res
        .status(400)
        .json({ error: 'There is no problem with this id.' });
    }

    const order = await Order.findOne({
      where: { id: problem.delivery_id },
    });

    if (!order) {
      return res.status(400).json({ error: 'Order does not exist.' });
    }

    if (order.canceled_at !== null) {
      return res.status(400).json({ error: 'Order already canceled.' });
    }

    order.canceled_at = new Date();

    await order.save();

    const deliveryman = await Deliveryman.findByPk(order.deliveryman_id);
    const recipient = await Recipient.findByPk(order.recipient_id);

    const infos = {
      order_id: order.id,
      deliveryman_name: deliveryman.name,
      deliveryman_email: deliveryman.email,
      product_name: order.product,
      recipient_name: recipient.name,
      logradouro: recipient.logradouro,
      numero: recipient.numero,
      cidade: recipient.cidade,
      estado: recipient.estado,
      complemento: recipient.complemento,
      cep: recipient.cep,
    };

    await Queue.add(CancellationMail.key, {
      infos,
    });

    return res.json(order);
  }
}

export default new OrderProblemsController();
