const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        await mongoose.connect('mongodb+srv://farazkhancs05:farazhacker03042002@lms.zfdbvbp.mongodb.net/LMS?retryWrites=true&w=majority);
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

