import { ObjectId } from "mongodb"
import { User } from '../../../DB/Models/user.model.js';
import { Car } from "../../../DB/Models/car.model.js"
import { Rental } from "../../../DB/Models/rental.model.js"



// ============================ create rental ===============================
export const addRental = async (req, res, next) => {
    const { userId, carId, rentalDate, returnDate } = req.body

    // hard requirements
    if (!userId || !carId || !rentalDate || !returnDate) {
        return res.json({ message: 'All fields are required' })
    }

    // check userID exist
    const isUserExist = await User.findOne({ _id: new ObjectId(userId) });
    if (!isUserExist) {
        return res.json({ error: "This user does not exist", message: 'Please enter a valid user id' })
    }

    // check carID exist
    const isCarExist = await Car.findOne({ _id: new ObjectId(carId) });
    if (!isCarExist) {
        return res.json({ error: 'This car does not exist', message: 'Please enter a valid car id' })
    }

    // check if car is available
    if (isCarExist.rental_status === "rented") {
        return res.json({ error: 'This car is already rented', message: 'Please enter an available car' })
    }

    // create a new Rental
    const newRental = await Rental.insertOne({
        userId,
        carId,
        rentalDate,
        returnDate
    });

    // if rental created successfully, change car's rental_status to rented
    const updatedCarStatus = await Car.updateOne(
        { _id: new ObjectId(isCarExist._id) },
        { $set: { "rental_status": "rented" } }
    );
    res.json({ message: 'Rental created successfully', data: newRental })
}


// ========================== Get a specific rental ==============================
export const getRental = async (req, res, next) => {
    try {
        const { _id } = req.params;
        const rental = await Rental.findOne({ _id: new ObjectId(_id) });

        if (!rental) {
            return res.status(404).json({ error: 'rental not found' });
        }

        const rentalUser = await User.findOne(
            { _id: new ObjectId(rental.userId) },
            { projection: { password: 0 } }
        );
        const rentalCar = await Car.findOne({ _id: new ObjectId(rental.carId) });

        //  just to preview all as one object
        const rentalFields = {};
        rentalFields.userId = rentalUser;
        rentalFields.carId = rentalCar;
        rentalFields.rentalDate = rental.rentalDate;
        rentalFields.returnDate = rental.returnDate;

        res.json({ data: rentalFields });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ============================== Get all rentals ==============================
export const getAllRentals = async (req, res, next) => {
    try {
        const rentals = await Rental.find().toArray();

        async function updateRentalsWithCarInfo(rentals) {
            for (const rental of rentals) {
                const carInfo = await Car.findOne({ _id: new ObjectId(rental.carId) });
                rental.carId = carInfo;
            }
        }

        async function updateRentalsWithUserInfo(rentals) {
            for (const rental of rentals) {
                const userInfo = await User.findOne(
                    { _id: new ObjectId(rental.userId) },
                    { projection: { password: 0 } }
                );
                rental.userId = userInfo;
            }
        }

        await updateRentalsWithCarInfo(rentals);
        await updateRentalsWithUserInfo(rentals);


        res.json({ message: "Total number of rentals created is " + rentals.length, data: rentals });


    } catch (error) {
        res.json({ message: "Error in listing rentals", error })
    }
};


// =============================== Update a rental ===============================
export const updateRental = async (req, res, next) => {
    try {
        const { _id } = req.params;
        const { userId, carId, rentalDate, returnDate } = req.body;


        // Check if the new value is provided and not null
        const updateFields = {};
        if (userId !== null && userId !== undefined) {
            updateFields.userId = userId;
        }
        if (carId !== null && carId !== undefined) {
            updateFields.carId = carId;
        }
        if (rentalDate !== null && rentalDate !== undefined) {
            updateFields.rentalDate = rentalDate;
        }
        if (returnDate !== null && returnDate !== undefined) {
            updateFields.returnDate = returnDate;
        }

        // update rental
        const updatedRental = await Rental.updateOne(
            { _id: new ObjectId(_id) },
            { $set: updateFields }
        );
        res.json({ message: "rental updated successfully", data: updatedRental })
    } catch (error) {
        res.json({ message: "Error in deleting rental" })
    }
}


// =============================== Delete a rental ===============================
export const deleteRental = async (req, res, next) => {
    try {
        const { _id } = req.params;

        const rental = await Rental.findOne({ _id: new ObjectId(_id) })

        // delete rental
        const deletedRental = await Rental.deleteOne({ _id: new ObjectId(_id) });

        // after deleting rental, car's rental_status must change to "available"
        const updatedCarStatus = await Car.updateOne(
            { _id: new ObjectId(rental.carId) },
            { $set: { "rental_status": "available" } }
        );
        res.json({ message: "Rental deleted successfully and rented car status changed to 'available'" , data: deletedRental  })
    } catch (error) {
        res.json({ message: "Error in deleting rental" })
    }
}