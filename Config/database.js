const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connected Successfully!");
    } catch (error) {
        console.log("Error while connecting to Database", error);
    }

}

module.exports = dbConnect;


// const dbDisconnect = async () => {
//     try {
//         await mongoose.disconnect();
//         console.log("Database Disconnected Successfully!");
//     } catch (error) {
//         console.log("Error while disconnecting to Database", error);
//     }
// }

