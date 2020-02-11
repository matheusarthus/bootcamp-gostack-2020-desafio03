import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      logradouro: Yup.string().required(),
      numero: Yup.number(),
      complemento: Yup.string().max(20),
      cidade: Yup.string().required(),
      estado: Yup.string().required(),
      cep: Yup.number()
        .required()
        .max(99999999),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fail' });
    }

    const recipientExist = await Recipient.findOne({
      where: { name: req.body.name },
    });

    if (recipientExist) {
      return res.status(400).json({ erro: 'Recipient already exists.' });
    }

    const {
      name,
      logradouro,
      numero,
      complemento,
      cidade,
      estado,
      cep,
    } = await Recipient.create(req.body);

    return res.json({
      name,
      adress: {
        logradouro,
        numero,
        complemento,
        cidade,
        estado,
        cep,
      },
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      logradouro: Yup.string(),
      numero: Yup.number(),
      complemento: Yup.string().max(20),
      cidade: Yup.string(),
      estado: Yup.string(),
      cep: Yup.number().max(99999999),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fail' });
    }

    const { name } = req.body;

    const recipient = await Recipient.findOne({
      where: { name },
    });

    if (!recipient) {
      return res.status(400).json({ erro: 'Recipient does not exist.' });
    }

    const {
      id,
      logradouro,
      numero,
      complemento,
      cidade,
      estado,
      cep,
    } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      adress: {
        logradouro,
        numero,
        complemento,
        cidade,
        estado,
        cep,
      },
    });
  }
}

export default new RecipientController();
