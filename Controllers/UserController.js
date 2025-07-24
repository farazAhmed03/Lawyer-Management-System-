
const userModel = require('../Models/User');
const sendResponse = require('../Utils/Response');



// !Fetching All Users
const AllUsers = async (req, res) => {
    try {
        const allUsers = await userModel.find().select('-password').populate('profile');

        // Only admin can delete all users  
        // Code ... 

        // Check if any user found
        if (allUsers) {
            sendResponse(res, 200, true, "All Users", allUsers);
        }
        else {
            sendResponse(res, 400, false, "No Users Found");
        }

    } catch (err) {
        console.log(err);
        sendResponse(res, 500, false, "Internal Server Error");
    }
}

// !Fetch Single User (Lawyer / Client / Admin)
const singleUser = async (req, res) => {
    const { id } = req.params;

    try {
        if (!id || id === 'undefined') {
            return sendResponse(res, 400, false, "Invalid or missing User ID");
        }

        const user = await userModel.findById(id)
            .select('-password')
            .populate('profile');

        if (!user) {
            return sendResponse(res, 404, false, "User Not Found");
        }

        if (req.user.role === 'admin' || req.user.userId === id) {
            return sendResponse(res, 200, true, "User Found", user);
        }

        return sendResponse(res, 200, true, "User Found", {
            _id: user._id,
            username: user.username,
            email: user.email,
            specialization: user.specialization,
            barNumber: user.barNumber,
            image: user.image,
            profile: {
                about: user.profile?.about || "Not Provided",
                location: user.profile?.location || "Not Provided",
                gender: user.profile?.gender || "Not Provided",
                contactNumber: user.profile?.contactNumber || "Not Provided",
                dateOfBirth: user.profile?.dateOfBirth || "Not Provided"
            }
        });

    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, "Internal Server Error");
    }
};



// !Delete User
const deleteUser = async (req, res) => {
    const { id } = req.params;

    // Only admin can delete user 
    // Code ... 

    try {
        const user = await userModel.findByIdAndDelete(id).select('-password').populate('profile');
        if (user) {
            sendResponse(res, 200, true, "User Deleted Successfully");
        }
        else {
            return sendResponse(res, 400, false, "User Not Found");
        }

    } catch (error) {
        console.log(error);
        sendResponse(res, 500, false, "Internal Server Error");
    }
}

// !Update User
const updateUser = async (req, res) => {
    const { id } = req.body;

    // Only admin can update user
    // Code ...

    try {
        const user = await userModel.findByIdAndUpdate(id, req.body);
        if (user) {
            sendResponse(res, 200, true, "User Updated Successfully");
        }
        else {
            return sendResponse(res, 400, false, "User Not Found");
        }

    } catch (error) {
        console.log(error);
        sendResponse(res, 500, false, "Internal Server Error");
    }
}


//! Find me 
const isUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userId).select('-password');
        if (!user) {
            return sendResponse(res, 404, false, "User Not Found");
        }

        sendResponse(res, 200, true, "User Found", user);

    } catch (error) {
        console.log(error);
        sendResponse(res, 500, false, "Internal Server Error");
    }
}

//! Fetch All Clients 
const AllClients = async (req, res) => {
    try {
        const allClients = await userModel.find({ role: 'client' }).select('-password');
        if (req.user.role !== 'admin') {
            return sendResponse(res, 403, false, "Unauthorized");
        }

        if (!allClients || allClients.length === 0) {
            return sendResponse(res, 400, false, "No Clients Found");
        }
        sendResponse(res, 200, true, "All Clients", allClients);
    } catch (error) {
        console.log(error);
        sendResponse(res, 500, false, "Internal Server Error");
    }
}


//! Fetch All Lawyers 
const AllLawyers = async (req, res) => {
    try {
        const allLawyers = await userModel.find({ role: 'lawyer' }).select('-password');
        if (!allLawyers || allLawyers.length === 0) {
            return sendResponse(res, 400, false, "No Lawyers Found");
        }
        sendResponse(res, 200, true, "All Lawyers", allLawyers);
    } catch (error) {
        console.log(error);
        sendResponse(res, 500, false, "Internal Server Error");
    }
}



//! Search Lawyer 
const searchLawyer = async (req, res) => {
  try {
    const { search } = req.query;

    const filters = {
      role: "lawyer",
      $or: [
        { username: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ],
    };

    const lawyers = await userModel
      .find(filters)
      .select("-password")
      .populate("profile");

    if (!lawyers.length || lawyers.length === 0) {
      return sendResponse(res, 400, false, "No Lawyers Found");
    }

    sendResponse(res, 200, true, "Lawyers Found", lawyers);
    
  } catch (err) {
    console.log(err);
    sendResponse(res, 500, false, "Internal Server Error");
  }
};


// !Delete all user     
const deleteAllUser = async (req, res) => {
    try {
        await userModel.deleteMany({});
        sendResponse(res, 200, true, "All Users Deleted Successfully");
    } catch (error) {
        console.log(error);
        sendResponse(res, 500, false, "Internal Server Error");
    }
}



module.exports = { AllUsers, singleUser, deleteUser, updateUser, searchLawyer, isUser, AllClients, AllLawyers,  deleteAllUser };

