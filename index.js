import express from 'express'
import userRouter from "./src/Modules/User/user.routes.js";
import carRouter from "./src/Modules/Car/car.routes.js";
import rentalRouter from "./src/Modules/Rental/rental.routes.js";
import { connectionDB,} from "./DB/connection.js";
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use('/user', userRouter);
app.use('/car', carRouter);
app.use('/rental', rentalRouter)


connectionDB();


app.get('/', (req, res) => res.send('Car Rental System'))
app.listen(port, () => console.log(`Car rental system listening on port ${port}!`))