import * as Yup from 'yup';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const deliverymen = await Deliveryman.findAll({
      order: ['created_at'],
      attributes: ['id', 'name', 'email', 'deleted_at'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fail' });
    }

    const deliveryman = await Deliveryman.findOne({
      where: { name: req.body.name },
    });

    if (deliveryman && deliveryman.deleted_at == null) {
      return res.status(400).json({ erro: 'Deliveryman already exists.' });
    }

    if (deliveryman && deliveryman.deleted_at !== null) {
      deliveryman.deleted_at = null;

      await deliveryman.save();

      return res.json(deliveryman);
    }

    const { id, name, email } = await Deliveryman.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fail' });
    }

    const deliveryman = await Deliveryman.findOne({
      where: { name: req.body.name, deleted_at: null },
    });

    if (!deliveryman) {
      return res.status(400).json({ erro: 'Deliveryman does not exist.' });
    }

    const { id, name, email } = await deliveryman.update(req.body);

    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const deliverymen = await Deliveryman.findByPk(req.params.id);

    if (!deliverymen) {
      return res.status(400).json({ erro: 'Deliveryman does not exist.' });
    }

    deliverymen.deleted_at = new Date();

    await deliverymen.save();

    return res.json(deliverymen);
  }
}

export default new DeliverymanController();
