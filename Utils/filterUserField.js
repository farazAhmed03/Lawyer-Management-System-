
const filterUserFields = (user) => {
    if (!user) return null;

    // Convert Mongoose document to plain JS object
    const userObj = user.toObject ? user.toObject() : user;

    // Destructure unwanted fields
    const {
        password,
        __v,
        _id,
        deletionScheduledAt,
        lastLogin,
        createdAt,
        updatedAt,
        ...rest
    } = userObj;

    // Return only remaining useful fields
    return rest;
};

module.exports = filterUserFields;
