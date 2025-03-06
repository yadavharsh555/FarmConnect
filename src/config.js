// import mongoose from "mongoose";
// const connect = mongoose.connect("mongodb://localhost:27017/FramConnect");

// connect.then(() => {
//     console.log("Connected to MongoDB");

// })
//     .catch(() => {
//         console.log("connection error");

//     });
// const LoginSchema = new mongoose.Schema({
//     // Cropname:String,
//     // Croptype:String,
//     // price:Number,
//     // Qprice:Number,
//     // DileviryDate:String,
//     name: {
//         type: String,
//         required: true

//     },
//     email: {
//         type: String,
//         required: true

//     },
//     role: {
//         type: String,
//         enum: ['farmer', 'buyer'],
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     }

// });

// const collection = new mongoose.model("Users", LoginSchema);

// export default collection;