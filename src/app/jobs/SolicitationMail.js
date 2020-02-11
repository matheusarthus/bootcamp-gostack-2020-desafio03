import Mail from '../../lib/Mail';

class SolicitationMail {
  get key() {
    return 'SolicitationMail';
  }

  async handle({ data }) {
    const { infos } = data;

    await Mail.sendMail({
      to: `${infos.deliveryman_name} <${infos.deliveryman_email}>`,
      subject: 'Nova encomenda disponível para retirada',
      template: 'solicitation',
      context: {
        id_product: infos.order_id,
        deliveryman: infos.deliveryman_name,
        product: infos.product_name,
        recipient: infos.recipient_name,
        adress: `${infos.logradouro}, ${infos.numero} - ${infos.cidade}-${infos.estado}. ${infos.complemento}`,
        cep: infos.cep,
      },
    });
  }
}

export default new SolicitationMail();
