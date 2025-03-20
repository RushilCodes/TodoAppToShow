// server/routes/todos.ts
import redis from "./redis.js";

// Sample function to set a todo
export const saveTodo = async (id: string, data: string) => {
  await redis.set(`todo:${id}`, data);
};

// Sample function to get a todo
export const getTodo = async (id: string) => {
  return await redis.get(`todo:${id}`);
};


console.log(await getTodo("0"))