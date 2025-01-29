import {Router} from "express"

import {healthcheck} from "../controllers/healthCheckController.js"

const router=Router();

router.route("/test").get(healthcheck) // it means that after that v1 healthcheck if i give this url then this checkcup is proceeded 

export default router