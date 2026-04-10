import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { guidedChatRouter } from "./guided-chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/guided-chat", guidedChatRouter);

export default router;
