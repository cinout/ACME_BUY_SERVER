import { RoleEnum } from "@/utils/enums";
import {
  checkAccessRight,
  checkIdMongooseValid,
  checkInputUpdateIsEmpty,
  checkRole,
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
import OrderModel from "@/models/OrderModel";
import UserModel from "@/models/UserModel";
import ProductModel from "@/models/ProductModel";
import { GqlRouteContext } from "..";
import { GraphQLError } from "graphql";

export const typeDefOrder = `
  scalar OrderItems

  enum OrderStatusEnum {
    Pending
    Paid
    Shipped
    Completed
    Canceled
  }

  input UpdateOrdertInput {
    status: OrderStatusEnum
    shippingCountry: String
    shippingState: String
    shippingCity: String
    shippingPostCode: String
    shippingAddress: String
    contactFirstname: String
    contactLastname: String
    contactPhone: String
    contactEmail: String
    items: [OrderItems!]
  }
  
  type Order {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    items: [OrderItems!]!
    itemDetails: [Product!]
    userId: ID!
    status: OrderStatusEnum!
    shippingCountry: String
    shippingState: String
    shippingCity: String
    shippingPostCode: String
    shippingAddress: String
    contactFirstname: String
    contactLastname: String
    contactPhone: String
    contactEmail: String
  }

  type OnOrderComplete {
    products: [Product!]!
    user: User
  }

  extend type Query {
    getOrderAndProductDetailsByOrderId(id: ID!): Order
    getOrderAndProductDetailsByCustomerId: [Order!]!
  }

  extend type Mutation {
    initiateOrder(items: [OrderItems!]!): Order
    updateOrder(id:ID!, input: UpdateOrdertInput!): Order
    onOrderCompleted(id:ID!): OnOrderComplete
    deleteOrder(id: ID!): Boolean
  }
`;

export const resolversOrder = {
  Query: {
    // get user's order information by orderId
    getOrderAndProductDetailsByOrderId: async (
      _: unknown,
      { id: orderId }: { id: string },
      { id: userId, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(orderId);
        checkIdMongooseValid(userId);
        await checkAccessRight(userId, OrderModel, orderId, "userId");

        const order = await OrderModel.findById(orderId);
        if (!order) {
          throw new GraphQLError(`The order does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }
        return order;
      } catch (error) {
        gqlGenericError(error as Error);
      }
    },
    // get order history for customer
    getOrderAndProductDetailsByCustomerId: async (
      _: unknown,
      __: void,
      { id: userId, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(userId);

        const order = await OrderModel.find({ userId: userId });

        return order;
      } catch (error) {
        gqlGenericError(error as Error);
      }
    },
  },
  Order: {
    itemDetails: async (
      parent: { items: { productId: string }[] },
      _: void,
      { loaders }: GqlRouteContext
    ) => {
      return await Promise.all(
        // queues all load() calls without waiting.
        // DataLoader batches them together in the same event loop cycle
        parent.items.map((item) =>
          loaders.productDataLoader.load(item.productId)
        )
      );
    },
  },
  Mutation: {
    // initiate an order (Pending)
    initiateOrder: async (
      _: unknown,
      {
        items,
      }: { items: { productId: string; sellerId: string; quantity: number }[] },
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(id);

        const newOrder = await OrderModel.create({
          userId: id,
          items: items.map((a) => ({
            productId: a.productId,
            sellerId: a.sellerId,
            quantity: a.quantity,
          })),
        });

        return newOrder;
      } catch (error) {
        gqlGenericError(error as Error);
      }
    },
    // update order
    updateOrder: async (
      _: unknown,
      { id: orderId, input }: { id: string; input: any },
      { id: userId, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(userId);
        checkIdMongooseValid(orderId);
        await checkAccessRight(userId, OrderModel, orderId, "userId");
        checkInputUpdateIsEmpty(input);

        // update order, e.g. status, shippingAddress
        const updatedOrder = await OrderModel.findOneAndUpdate(
          { _id: orderId },
          input,
          {
            runValidators: true,
            new: true,
          }
        );

        if (!updatedOrder) {
          throw new GraphQLError(`The order does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        } else {
          return updatedOrder;
        }
      } catch (error) {
        gqlGenericError(error as Error);
      }
    },
    // Pending -> Paid
    onOrderCompleted: async (
      _: unknown,
      { id: orderId }: { id: string },
      { id: userId, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(userId);
        checkIdMongooseValid(orderId);
        await checkAccessRight(userId, OrderModel, orderId, "userId");

        // empty user's cart
        const updatedUser = await UserModel.findOneAndUpdate(
          { _id: userId },
          { cart: [] },
          {
            runValidators: true,
            new: true,
          }
        );
        if (!updatedUser) {
          throw new GraphQLError(`The user does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }

        // reduce stock for products in the order
        const order = await OrderModel.findById(orderId);
        if (!order) {
          throw new GraphQLError(`The order does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }
        const orderItems = order.items;
        const updatedProducts = await Promise.all(
          orderItems.map(async ({ productId, quantity }) => {
            return await ProductModel.findOneAndUpdate(
              { _id: productId, stock: { $gte: quantity } },
              { $inc: { stock: -quantity } },
              {
                runValidators: true,
                new: true,
              }
            );
          })
        );
        if (!updatedProducts) {
          throw new GraphQLError(`Failed to reduce products' quantity.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        }

        return {
          products: updatedProducts,
          user: updatedUser,
        };
      } catch (error) {
        gqlGenericError(error as Error);
      }
    },
    deleteOrder: async (
      _: unknown,
      { id: orderId }: { id: string },
      { id: userId, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(orderId);
        checkIdMongooseValid(userId);

        await checkAccessRight(userId, OrderModel, orderId, "userId");

        const result = await OrderModel.deleteOne({ _id: orderId });

        if (result.deletedCount === 0) {
          throw new GraphQLError(`The order does not exist.`, {
            extensions: gql_custom_code_bad_user_input,
          });
        } else {
          return true;
        }
      } catch (e) {
        gqlGenericError(e as Error);
      }
    },
  },
};
