import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async store(req, res) {
    const { id, name, email } = await Deliveryman.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const deliveryman = await Deliveryman.findOne({
      where: { name: req.body.name },
    });

    if (!deliveryman) {
      return res.status(400).json({ erro: 'Deliveryman does not exist.' });
    }

    const { id, name, email } = await deliveryman.update(req.body);

    return res.json({ id, name, email });
  }
}

export default new DeliverymanController();
