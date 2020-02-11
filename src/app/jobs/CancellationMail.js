import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { infos } = data;

    await Mail.sendMail({
      to: `${infos.deliveryman_name} <${infos.deliveryman_email}>`,
      subject: '[urgente] Encomenda Cancelada',
      template: 'cancellation',
      context: {
        id_product: infos.order_id,
        deliveryman: infos.deliveryman_name,
        product: infos.product_name,
        recipient: infos.recipient_name,
      },
    });
  }
}

export default new CancellationMail();
