import Order from '../models/Order';
import Problem from '../models/Problem';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class ProblemsController {
  async index(req, res) {
    const problems = await Problem.findAll({
      attributes: ['delivery_id', 'description'],
      include: [
        {
          model: Order,
          as: 'delivery',
          attributes: ['product'],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['name', 'email'],
            },
            {
              model: Recipient,
              as: 'recipient',
              attributes: ['name', 'logradouro', 'numero', 'cidade', 'estado'],
            },
          ],
        },
      ],
    });

    if (!problems) {
      return res
        .status(400)
        .json({ error: 'There are no orders with problems.' });
    }

    return res.json(problems);
  }
}

export default new ProblemsController();
