import UserModel from "@/models/UserModel";
import OrderModel from "@/models/OrderModel";
import ProductModel from "@/models/ProductModel";
import {
  selectRandomItemFromArray,
  selectRandomNItemsFromArray,
} from "@/utils/array";
import { faker } from "@faker-js/faker";
import seedingScriptConnectDB from ".";
import { OrderStatusEnum } from "@/utils/enums";
import { getRandomDate } from "@/utils/date";

seedingScriptConnectDB();

async function orderSeedingScript() {
  try {
    // get all Users
    const allUsers = await UserModel.find().select([
      "id",
      "country",
      "state",
      "city",
      "zipCode",
      "fistname",
      "lastname",
      "email",
    ]);
    const allUserIds = allUsers.map((a) => a._id.toString());

    const allProducts = await ProductModel.find().select([
      "id",
      "price",
      "discount",
    ]);

    const newOrders = allUsers.reduce((acc: unknown[], user) => {
      // current user
      const numOrders = faker.number.int({ min: 6, max: 22, multipleOf: 1 });
      const userAddress = faker.location.streetAddress();
      const userPhone = faker.phone.number();

      const ordersForCurrentUser = Array.from({ length: numOrders }, () => {
        // each order for the current user
        const randomDate = getRandomDate(new Date("2023-01-01"), new Date());
        const randomNProducts = selectRandomNItemsFromArray(
          allProducts,
          faker.number.int({ min: 1, max: 8, multipleOf: 1 })
        );

        return {
          userId: user.id,
          createdAt: randomDate,
          updatedAt: randomDate,
          items: randomNProducts.map((product) => ({
            productId: product.id,
            quantity: faker.number.int({ min: 1, max: 5, multipleOf: 1 }),
            priceSnapshot: product.price,
            discountSnapshot: product.discount,
          })),
          shippingCountry: user.country,
          shippingState: user.state,
          shippingCity: user.city,
          shippingPostCode: user.zipCode,
          shippingAddress: userAddress,
          contactFirstname: user.firstname,
          contactLastname: user.lastname,
          contactEmail: user.email,
          contactPhone: userPhone,
          status: selectRandomItemFromArray(Object.values(OrderStatusEnum)),
        };
      });

      return acc.concat(ordersForCurrentUser);
    }, []);

    // insert data
    console.log(newOrders[2]);
    await OrderModel.insertMany(newOrders);
    console.log("Order data are successfully inserted!");
  } catch (err) {
    console.error("Error while seeding data:", err);
  }
}

orderSeedingScript();
