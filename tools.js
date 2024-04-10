// SCHEMAS
export const weatherToolSchema = {
  name: "get_weather",
  description: "Get the weather based on a city name",
  input_schema: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "The name of a city for which to fetch the weather",
      },
    },
    required: ["city"],
  },
};

export const getOrderStatusSchema = {
  name: "get_order_status",
  description: "Get the status of an order based on an order ID",
  input_schema: {
    type: "object",
    properties: {
      order_id: {
        type: "number",
        description: "The Order ID for which to fetch the status",
      },
    },
    required: ["order_id"],
  },
};

// HANDLERS
const weatherToolHandler = (input) => {
  console.log("weatherToolHandler: ", input);
  return "68 degrees";
};

const getOrderStatus = (input) => {
  const orders = [
    {
      id: 1,
      status: "shipped",
    },
    {
      id: 2,
      status: "pending",
    },
  ];

  const order = orders.find((order) => order.id === input.order_id);

  if (!order) return "Order not found";

  return `Order ${order.id} is ${order.status}`;
};

export const toolHandler = async (tool, input) => {
  console.log("toolHandler: ", tool, input);
  switch (tool) {
    case "get_weather":
      return weatherToolHandler(input);
    case "get_order_status":
      return getOrderStatus(input);
    default:
      return null;
  }
};
