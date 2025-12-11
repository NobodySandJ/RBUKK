const { supabase } = require('../config/database');
const midtransClient = require('midtrans-client');

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items, shipping_address, shipping_name, shipping_phone, notes } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Keranjang belanja kosong'
      });
    }

    if (!shipping_address || !shipping_name || !shipping_phone) {
      return res.status(400).json({
        success: false,
        message: 'Data pengiriman wajib diisi'
      });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .eq('id', item.product_id)
        .eq('is_active', true)
        .single();

      if (error || !product) {
        return res.status(404).json({
          success: false,
          message: `Produk dengan ID ${item.product_id} tidak ditemukan`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stok ${product.name} tidak mencukupi`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        total_amount: totalAmount,
        shipping_address,
        shipping_name,
        shipping_phone,
        notes,
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) throw itemsError;

    // Create Midtrans transaction
    const midtransOrderId = `ORDER-${order.id}-${Date.now()}`;
    
    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: totalAmount
      },
      customer_details: {
        first_name: shipping_name,
        phone: shipping_phone
      },
      item_details: orderItems.map(item => ({
        id: item.product_id,
        price: item.price,
        quantity: item.quantity,
        name: item.product_name
      }))
    };

    const transaction = await snap.createTransaction(parameter);

    // Update order with Midtrans info
    await supabase
      .from('orders')
      .update({
        midtrans_order_id: midtransOrderId,
        payment_url: transaction.redirect_url
      })
      .eq('id', order.id);

    // Reduce stock
    for (const item of items) {
      await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        quantity: item.quantity
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order berhasil dibuat',
      data: {
        order_id: order.id,
        payment_url: transaction.redirect_url,
        midtrans_token: transaction.token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// Midtrans payment webhook
exports.paymentCallback = async (req, res, next) => {
  try {
    const notification = req.body;

    // Verify notification
    const statusResponse = await snap.transaction.notification(notification);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let orderStatus = 'pending';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        orderStatus = 'paid';
      }
    } else if (transactionStatus === 'settlement') {
      orderStatus = 'paid';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      orderStatus = 'cancelled';
    } else if (transactionStatus === 'pending') {
      orderStatus = 'pending';
    }

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: orderStatus,
        midtrans_transaction_id: statusResponse.transaction_id,
        updated_at: new Date()
      })
      .eq('midtrans_order_id', orderId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
