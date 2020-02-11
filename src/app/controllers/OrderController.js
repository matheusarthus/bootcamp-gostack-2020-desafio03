import * as Yup from 'yup';

import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import SolicitationMail from '../jobs/SolicitationMail';
import UpdatingMail from '../jobs/UpdatingMail';
import CancellationMail from '../jobs/CancellationMail';
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
    const schema = Yup.object().shape({
      product_name: Yup.string().required(),
      recipient_name: Yup.string().required(),
      deliveryman_name: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fail' });
    }

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
      order_id: order.id,
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

  async update(req, res) {
    const schema = Yup.object().shape({
      product_name: Yup.string(),
      recipient_name: Yup.string(),
      deliveryman_name: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fail' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ erro: 'Order does not exist.' });
    }

    if (order.start_date != null) {
      return res.status(400).json({ erro: 'Order already started.' });
    }

    const {
      product_name: productNameReq,
      recipient_name: recipientNameReq,
      deliveryman_name: deliverymanNameReq,
    } = req.body;

    if (!productNameReq && !recipientNameReq && !deliverymanNameReq) {
      return res.status(400).json({ erro: 'No data for updating.' });
    }

    const deliverymanOrder = await Deliveryman.findByPk(order.deliveryman_id);
    const recipientOrder = await Recipient.findByPk(order.recipient_id);

    let product_name = order.product;
    let deliveryman_id = deliverymanOrder.id;
    let deliveryman_name = deliverymanOrder.name;
    let deliveryman_email = deliverymanOrder.email;
    let recipient_id = recipientOrder.id;
    let recipient_name = recipientOrder.name;
    let { logradouro } = recipientOrder;
    let { numero } = recipientOrder;
    let { cidade } = recipientOrder;
    let { estado } = recipientOrder;
    let { complemento } = recipientOrder;
    let { cep } = recipientOrder;
    let productChanged = false;
    let recipientChanged = false;
    let deliverymanChanged = false;

    if (productNameReq) {
      product_name = productNameReq;
      productChanged = true;
    }

    if (recipientNameReq) {
      const recipient = await Recipient.findOne({
        where: { name: recipientNameReq },
      });

      if (!recipient) {
        return res.status(400).json({ erro: 'Recipient does not exist.' });
      }

      recipient_name = recipient.name;
      recipient_id = recipient.id;
      recipient_name = recipient.name;
      logradouro = recipient.logradouro;
      numero = recipient.numero;
      cidade = recipient.cidade;
      estado = recipient.estado;
      complemento = recipient.complemento;
      cep = recipient.cep;
      recipientChanged = true;
    }

    if (deliverymanNameReq) {
      const deliveryman = await Deliveryman.findOne({
        where: { name: deliverymanNameReq, deleted_at: null },
      });

      if (!deliveryman) {
        return res.status(400).json({ erro: 'Deliveryman does not exist.' });
      }

      deliveryman_id = deliveryman.id;
      deliveryman_name = deliveryman.name;
      deliveryman_email = deliveryman.email;
      deliverymanChanged = true;
    }

    const { id } = await order.update({
      recipient_id,
      deliveryman_id,
      product: productNameReq,
    });

    const infos = {
      order_id: order.id,
      deliveryman_name,
      deliveryman_email,
      product_name,
      recipient_name,
      logradouro,
      numero,
      cidade,
      estado,
      complemento,
      cep,
    };

    if (
      (recipientChanged === true || productChanged === true) &&
      deliverymanChanged === false
    ) {
      await Queue.add(UpdatingMail.key, {
        infos,
      });
    } else {
      await Queue.add(SolicitationMail.key, {
        infos,
      });
    }

    return res.json({ id, product_name, recipient_name, deliveryman_name });
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ erro: 'Order does not exist.' });
    }

    if (order.start_date != null) {
      return res.status(400).json({ erro: 'Order already started.' });
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

export default new OrderController();
