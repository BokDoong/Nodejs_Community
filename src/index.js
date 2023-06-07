import express from 'express';
import cors from "cors";
import helmet from "helmet";
import { Controllers } from './models';
import { swaggerDocs, options } from './swagger';
import swaggerUi from "swagger-ui-express"
import database from "./database";
import { jwtAuth } from "./middleware/jwtAuth";

(async () => {

  //익스프레스 앱 실행
  const app = express();
  //데이터베이스 연결
  await database.$connect();

  //미들웨어
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({extended: true, limit: "700mb"}));
  app.use(jwtAuth);

  //url과 api 매핑
  Controllers.forEach((controller) => {
    app.use(controller.path, controller.router);
  });

  //스웨거 등록
  app.get("/swagger.json", (req, res) => {
    res.status(200).json(swaggerDocs);
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined, options));

  // req:요청, res:응답
  app.get("/", (req,res) => {
    res.send("Nodejs 강의 재밌어요!")
  });

  app.use((err, req, res, next) => {
    console.log(err);
    
    res
      .status(err.status || 500)
      .json({ message: err.message || "서버에서 에러가 발생하였습니다." });
  });

  app.listen(8080, () => {
    console.log("서버가 시작되었습니다.");
  });

})();
