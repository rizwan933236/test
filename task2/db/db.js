const { SQLDataSource } = require('apollo-datasource-sqlite');

class OrderAPI extends SQLDataSource {
  async getOrders() {
    const orders = await this.db.all(`SELECT * FROM orders`);
    return orders.map(order => this.orderReducer(order));
  }

  async getOrdersByStatus(status) {
    const orders = await this.db.all(`SELECT * FROM orders WHERE status = ?`, [
      status
    ]);
    return orders.map(order => this.orderReducer(order));
  }

  async getOrderById(id) {
    const order = await this.db.get(`SELECT * FROM orders WHERE id = ?`, [id]);
    return this.orderReducer(order);
  }

  async updateOrderStatus(id, status) {
    await this.db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
    return this.getOrderById(id);
  }

  orderReducer(order) {
    return {
      id: order.id,
      deliveryAddress: order.deliveryAddress,
      items: order.items.split(',').map(item => item.trim()),
      total: order.total,
      discountCode: order.discountCode,
      comment: order.comment,
      status: order.status
    };
  }
}

module.exports = OrderAPI;
