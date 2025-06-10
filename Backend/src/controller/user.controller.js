import { userService } from "../service/user.service.js";

export async function getUsers(req, res) {
  const users = await userService.getUsers();
  res.status(200).json({ status: "success", statusCode: 200, data: users });
}
export async function getSelf(req, res) {
  const userId = req.user._id;
  const user = await userService.getUser(userId);
  res.status(200).json({ status: "success", statusCode: 200, data: user });
}
export async function getUser(req, res) {
  const { userId } = req.params;
  const user = await userService.getUser(userId);
  res.status(200).json({ status: "success", statusCode: 200, data: user });
}
