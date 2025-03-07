import { RoleEnum } from "@/utils/enums";
import {
  checkAccessRight,
  checkIdMongooseValid,
  checkRole,
  gql_custom_code_bad_user_input,
  gqlGenericError,
} from "@/utils/gqlErrorResponse";
import OrderModel from "@/models/OrderModel";
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
  
  type Order {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    items: [OrderItems!]!
    itemDetails: [Product!]
    userId: ID!
    status: OrderStatusEnum!
  }

  extend type Query {
    getOrderAndProductDetailsByOrderId(id: ID!): Order
  }

  extend type Mutation {
    initiateOrder(items: [OrderItems!]!): Order
  }
`;

export const resolverOrder = {
  Query: {
    //
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
  },
  Order: {
    itemDetails: async (
      parent: { items: { productId: string; quantity: number }[] },
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
    initiateOrder: async (
      _: unknown,
      { items }: { items: { productId: string; quantity: number }[] },
      { id, role }: { id: string; role: RoleEnum }
    ) => {
      try {
        checkRole(role, [RoleEnum.User]);
        checkIdMongooseValid(id);

        const newOrder = await OrderModel.create({
          userId: id,
          items: items.map((a) => ({
            productId: a.productId,
            quantity: a.quantity,
          })),
        });

        return newOrder;
      } catch (error) {
        gqlGenericError(error as Error);
      }
    },
  },
};
