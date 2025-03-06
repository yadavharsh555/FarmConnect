import mongoose from "mongoose";
import Contract from "./models/contract.model.js";


const URI = process.env.MongoDBURI || "mongodb://localhost:27017/FarmConnect";

try {
    mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  }catch (error) {
    console.error("Error ", error);
};



let contractHistory = [
    {
        "Cname": "Corn",
        "Ctype": "Vegetable",
        "price": 1000,
        "quantity": 900,
        "date": new Date(),
        "role": "buyer"
    },
    {
        "Cname": "Wheat",
        "Ctype": "322",
        "price": 100,
        "quantity": 90,
        "date": new Date(),
        "role": "farmer"
    },
    {
        "Cname": "Keshar",
        "Ctype": "Pure",
        "price": 1000,
        "quantity": 60,
        "date": new Date() ,
        "role": "farmer"
    },
    {
        "Cname": "rice",
        "Ctype": "Basmati",
        "price": 10,
        "quantity": 9,
        "date": new Date(),
        "role": "buyer"
    },
    {
        "Cname": "Corn",
        "Ctype": "Vegetable",
        "price": 1000,
        "quantity": 900,
        "date": new Date(),
        "role": "buyer"
    },
    {
        "Cname": "Wheat",
        "Ctype": "322",
        "price": 100,
        "quantity": 90,
        "date": new Date(),
        "role": "farmer"
    },
    {
        "Cname": "Keshar",
        "Ctype": "Pure",
        "price": 1000,
        "quantity": 60,
        "date": new Date() ,
        "role": "farmer"
    },
    {
        "Cname": "rice",
        "Ctype": "Basmati",
        "price": 10,
        "quantity": 9,
        "date": new Date(),
        "role": "buyer"
    }
  ];
  
Contract.insertMany(contractHistory);
// contractHistory1.save();
  