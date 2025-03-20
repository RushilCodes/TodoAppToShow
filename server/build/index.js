// server/routes/todos.ts
import redis from "./redis.js";
// Sample function to set a todo
export const saveTodo = async (id, data) => {
    await redis.set(`todo:${id}`, data);
};
// Sample function to get a todo
export const getTodo = async (id) => {
    return await redis.get(`todo:${id}`);
};
console.log(await getTodo("0"));
