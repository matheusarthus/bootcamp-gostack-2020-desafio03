import Sequelize, { Model } from 'sequelize';

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.INTEGER,
        canceled_at: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature',
    });
    this.belongsTo(models.Recipient, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });
    this.belongsTo(models.Deliveryman, {
      foreignKey: 'deliveryman_id',
      as: 'deliveryman',
    });
  }
}

export default Order;

/* id (id da entrega)
recipient_id (referência ao destinatário);
deliveryman_id (referência ao entregador);
signature_id (referência à uma assinatura do destinatário, que será uma imagem);
product (nome do produto a ser entregue);
canceled_at (data de cancelamento, se cancelada);
start_date (data de retirada do produto);
end_date (data final da entrega);
created_at;
updated_at;
 */
