import { ObjectId } from "mongodb"
import { Car } from "../../../DB/Models/car.model.js"




// ============================ Add a car ======================================================
export const addCar = async (req, res, next) => {
    const { name, model, rental_status } = req.body
    const userId = req.user.id;

    // hard requirements
    if (!name || !model || !rental_status) {
        return res.json({ message: 'All fields are required' })
    }

    // add a check for rental_status content (available/rented)
    if (rental_status !== "available" && rental_status !== "rented") {
        return res.json({ error: "rental_status accepts two values only: 'available' or 'rented'" })
    }

    const newCar = await Car.insertOne({ userId, name, model, rental_status })
    res.json({ message: 'Car added successfully', newCar })
}




// ============================ Get specific car =================================================
export const getCar = async (req, res, next) => {
    try {
        const { _id } = req.params;
        const car = await Car.findOne({ _id: new ObjectId(_id) });

        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        res.json({ data: car });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ============================ Get all cars =====================================================
export const getAllCars = async (req, res, next) => {
    try {
        const cars = await Car.find().toArray();
        res.json({ message: "Total number of registered cars " + cars.length, data: cars })
    } catch (error) {
        res.json({ message: "Error in listing cars", error })
    }
}


// =============================== Update a Car ===================================================
export const updateCar = async (req, res, next) => {
    try {
        const { _id } = req.params;
        const { name, model, rental_status } = req.body;
        const userId = req.user.id;

        const isCarExist = await Car.findOne({ _id: new ObjectId(_id) })
        if (!isCarExist) {
            return res.json({ error: "This car doesnt exist"})
        }
        if (userId !== isCarExist.userId) {
            return res.json({ message: "You are only allowed to update your own cars"})
        }


        // add a check for rental_status content (available/rented)
        if (rental_status != "available" && rental_status != "rented" && rental_status !== undefined && rental_status !== null) {
            return res.json({ error: "rental_status accepts two values only: 'available' or 'rented'" })
        }


        // Check if the new value is provided and not null
        const updateFields = {};
        if (name !== null && name !== undefined) {
            updateFields.name = name;
        }
        if (model !== null && model !== undefined) {
            updateFields.model = model;
        }
        if (rental_status !== null && rental_status !== undefined) {
            updateFields.rental_status = rental_status;
        }


        // update Car
        const updatedCar = await Car.updateOne(
            { _id: new ObjectId(_id) },
            { $set: updateFields }
        );
        res.json({ message: "Car updated successfully", data: updatedCar })
    } catch (error) {
        res.json({ message: "Error in deleting Car" })
    }
}


// ======================================== Delete a Car =========================================
export const deleteCar = async (req, res, next) => {
    try {
        const { _id } = req.params;
        const userId = req.user.id;

        const isCarExist = await Car.findOne({ _id: new ObjectId(_id) })
        if (!isCarExist) {
            return res.json({ error: "This car doesnt exist"})
        }
        if (userId !== isCarExist.userId) {
            return res.json({ message: "You are only allowed to delete your own cars"})
        }

        // delete Car
        const deletedCar = await Car.deleteOne({ _id: new ObjectId(_id) });
        res.json({ message: "Car deleted successfully", data: deletedCar })
    } catch (error) {
        res.json({ message: "Error in deleting Car" })
    }
}

// ================================================================================================
// ====================================== Special endpoints =======================================
// ================================================================================================


// ================================ Get cars with a specific model ================================
export const getAllCarsWithModels = async (req, res, next) => {
    try {
        const models = req.query.model;
        const filteredCars = await Car.find().toArray();
        const filter = filteredCars.filter(car => models.includes(car.model));
        res.json({ message: "Filtered cars based on models " + filter.length, data: filter });

    } catch (error) {
        res.json({ message: "Error in listing cars", error })
    }
}



// ========================== Get (available) cars with a specific model ==========================
export const getAvModel = async (req, res, next) => {
    try {
        const { model } = req.query;

        if (!model) {
            return res.status(400).json({ message: "Model parameter is required" });
        }

        const cars = await Car.find({ $and: [{ model }, { rental_status: "available" }] }).toArray();

        res.json({ message: "Total number of available cars with such model is " + cars.length, data: cars })
    } catch (error) {
        res.json({ message: "Error in listing cars", error })
    }
}



// ========================== Get Cars that are Either rented or of a Specific Model ================
export const getRentedModel = async (req, res, next) => {
    try {
        const { model } = req.query;

        if (!model) {
            return res.status(400).json({ message: "Model parameter is required" });
        }

        const cars = await Car.find({ $or: [{ model }, { rental_status: "rented" }] }).toArray();

        res.json({ data: cars })
    } catch (error) {
        res.json({ message: "Error in listing cars", error })
    }
}



// ========== Get Available Cars of Specific Models or Rented Cars of a Specific Model =============
export const getFilteredCars = async (req, res, next) => {
    try {
        const { model } = req.query;
        const { rental_status } = req.query;

        if (!model) {
            return res.status(400).json({ message: "Model parameter is required" });
        }

        const cars = await Car.find({ $and: [{ model }, { rental_status }] }).toArray();

        res.json({ data: cars })
    } catch (error) {
        res.json({ message: "Error in listing cars", error })
    }
}
