/**
 * Email template: Store Approved
 * Sent to the vendor when admin approves their store registration.
 */
export function storeApprovedTemplate({ storeName, ownerName }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #16a34a; color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { padding: 32px 24px; color: #333; }
        .body p { line-height: 1.7; margin: 0 0 16px; }
        .badge { display: inline-block; background: #dcfce7; color: #15803d; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 15px; margin: 16px 0; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Store Approved!</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${ownerName}</strong>,</p>
          <p>Great news! Your store has been reviewed and approved by the DivineKart team.</p>
          <div class="badge">✅ ${storeName} is now Live</div>
          <p>You can now log in to your vendor dashboard, add products, and start receiving orders from customers near you.</p>
          <p>Use the same OTP-based login you used during registration. Welcome to the DivineKart family!</p>
          <p>– Team DivineKart</p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} DivineKart. All rights reserved.</div>
      </div>
    </body>
    </html>`;
}

/**
 * Email template: Store Rejected
 * Sent to the vendor when admin rejects their store registration.
 */
export function storeRejectedTemplate({ storeName, ownerName, reason = '' }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #dc2626; color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { padding: 32px 24px; color: #333; }
        .body p { line-height: 1.7; margin: 0 0 16px; }
        .reason-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px; margin: 16px 0; color: #991b1b; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Store Application Update</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${ownerName}</strong>,</p>
          <p>Thank you for applying to list <strong>${storeName}</strong> on DivineKart. After review, we were unable to approve your application at this time.</p>
          ${reason ? `<div class="reason-box"><strong>Reason:</strong> ${reason}</div>` : ''}
          <p>You are welcome to re-apply after addressing the concerns above. If you have any questions, please contact our support team.</p>
          <p>– Team DivineKart</p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} DivineKart. All rights reserved.</div>
      </div>
    </body>
    </html>`;
}

/**
 * Email template: New Order Notification to Vendor
 * Sent to the store owner when a new order is routed to their store.
 */
export function newOrderNotificationTemplate({ storeName, order }) {
    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${item.price.toFixed(2)}</td>
      </tr>`).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 620px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #7c3aed; color: white; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; }
        .body { padding: 32px 24px; color: #333; }
        .body p { line-height: 1.7; margin: 0 0 12px; }
        .order-id { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        thead { background: #f3f4f6; }
        th { padding: 10px 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .total-row td { padding: 10px 12px; font-weight: bold; background: #f9fafb; }
        .address-box { background: #f3f4f6; border-radius: 6px; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #374151; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 New Order Received</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${storeName}</strong>,</p>
          <p>A new order has been routed to your store. Please prepare the items for pickup.</p>
          <p class="order-id">Order ID: <strong>${order.orderId}</strong></p>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2">Total Amount</td>
                <td style="text-align:right;">₹${(order.totalAmount || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <p><strong>Customer Details:</strong></p>
          <div class="address-box">
            <strong>${order.customer?.name || 'Customer'}</strong><br/>
            📞 ${order.customer?.phone || 'N/A'}<br/>
            📍 ${order.customer?.address || 'N/A'}
          </div>

          <p>Payment Method: <strong>${order.paymentMethod}</strong></p>
          <p>Please ensure the order is ready for pickup by our delivery team. For any issues, contact the DivineKart admin.</p>
          <p>– Team DivineKart</p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} DivineKart. All rights reserved.</div>
      </div>
    </body>
    </html>`;
}
