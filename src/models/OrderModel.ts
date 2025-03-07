import { OrderStatusEnum } from "@/utils/enums";
import { Schema, model } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
      required: true,
    },
    // totalAmount: { type: Number, required: true },
    // currency: { type: String, default: "USD" },
    // paymentMethod: { type: String, required: true },
    // paymentStatus: {
    //   type: String,
    //   enum: ["pending", "paid", "failed", "refunded"],
    //   default: "pending",
    // },
    // transactionId: { type: String },
    // paymentDate: { type: Date },

    // shippingAddress: {
    //   fullName: { type: String, required: true },
    //   street: { type: String, required: true },
    //   city: { type: String, required: true },
    //   state: { type: String, required: true },
    //   zipCode: { type: String, required: true },
    //   country: { type: String, required: true },
    // },
    // shippingMethod: { type: String, required: true },
    // shippingCost: { type: Number, default: 0 },
    // trackingNumber: { type: String },
    // deliveryStatus: {
    //   type: String,
    //   enum: ["pending", "shipped", "delivered", "canceled"],
    //   default: "pending",
    // },

    status: {
      type: String,
      enum: Object.values(OrderStatusEnum),
      default: OrderStatusEnum.Pending,
      required: true,
    },
    // cancelReason: { type: String },

    // discount: {
    //   code: { type: String },
    //   amount: { type: Number },
    // },
    // taxAmount: { type: Number, default: 0 },

    // isGift: { type: Boolean, default: false },
    // giftMessage: { type: String },
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

const Order = model("Order", OrderSchema);
export default Order;
