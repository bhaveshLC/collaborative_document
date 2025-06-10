import { authService } from "../service/auth.service.js";

async function Login(req, res) {
  const { email, password } = req.body;
  const token = await authService.userLogin(email, password);
  res.status(200).json({ status: "success", data: { token } });
}
async function Register(req, res) {
  const user = await authService.registerUser(req.body);
  res.status(200).json({ status: "success", data: { user } });
}
export const authController = {
  Login,
  Register,
};
