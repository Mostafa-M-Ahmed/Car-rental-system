import { MongoClient } from "mongodb";

const mongodbURI = "mongodb://localhost:27017";
const mongoClient = new MongoClient(mongodbURI);
const db_name = "CarRentalDB";

export const connectionDB = async () => {
    try {
        await mongoClient.connect();
        console.log("Connected to the database");
    } catch (error) {
        console.error("Error connecting to the database", error);
    }
}

export const db = mongoClient.db(db_name)