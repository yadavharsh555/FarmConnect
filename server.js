import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import User from "./models/user.model.js";
import Contract from "./models/contract.model.js";
import AcceptedContract from "./models/acceptedContract.js";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "./config/passportConfig.js";
import methodOverride from "method-override";

const app = express();

const PORT = process.env.PORT || 8080; // Use the correct environment variable
const URI = process.env.MongoDBURI || "mongodb://localhost:27017/FarmConnect2";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "yourSecretKey",
    resave: false, // Set to false for performance if you don't modify session data
    saveUninitialized: false, // Only save session if something is stored in it
    cookie: {
      secure: false, // Set to true if you're using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // Session expiry (1 day in this case)
    },
  })
);
// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

try {
  mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Error connecting to MongoDB: ", error);
}

// Sample contract history (you can remove this if it's not needed)
let contractHistory = [
  {
    Cname: "Corn",
    Ctype: "Vegetable",
    price: 1000,
    quantity: 900,
    date: "20-2-2020",
    role: "buyer",
    state: "Punjab",
    city: "Ludhiana",
  },
  {
    Cname: "Wheat",
    Ctype: "322",
    price: 100,
    quantity: 90,
    date: "20/12/2024",
    role: "farmer",
    state: "Uttar Pradesh",
    city: "Kanpur",
  },
  {
    Cname: "Keshar",
    Ctype: "Pure",
    price: 1000,
    quantity: 60,
    date: "10/9/2022",
    role: "farmer",
    state: "Jammu and Kashmir",
    city: "Srinagar",
  },
];
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next(); // Proceed if the user is authenticated
  } else {
    res.redirect("/login"); // Redirect to login page if not authenticated
  }
}

// Define routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/contracts", (req, res) => {
  res.render("contracts.ejs");
});
app.get("/contmang", (req, res) => {
  res.render("contmang.ejs");
});
app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/payment", (req, res) => {
  res.render("payment.ejs");
});
app.get("/viewContract", (req, res) => {
  res.render("viewContract.ejs", { contractHistory });
});
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    // Clear session on logout
    if (err) {
      console.error("Error during logout:", err);
    }
    res.redirect("/"); // Redirect to homepage
  });
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});
app.get("/contractHistory", isAuthenticated, async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.session.userId) {
      console.log("User not authenticated. Redirecting to login.");
      return res.redirect("/login"); // Redirect to login if user is not authenticated
    }

    // Fetch the user data based on the logged-in user ID
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.log("User not found in the database");
      return res.status(404).send("User not found");
    }

    // Fetch all contract history and populate user data
    const contractHistory = await Contract.find().populate("userId");

    // Log user and contract history for debugging
    console.log("User:", user);
    console.log("Contract History:", contractHistory);

    // Render the contracts to the view with user data
    res.render("contractHistory", { ContractHistory: contractHistory, user });
  } catch (err) {
    console.error("Error fetching contract history:", err);
    res.status(500).send("Error fetching contract history.");
  }
});

app.get("/api/contracts", isAuthenticated, async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query parameters

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch contracts associated with the user ID
    const contracts = await Contract.find({ userId }); // Adjust the field name if needed

    if (contracts.length === 0) {
      return res
        .status(404)
        .json({ message: "No contracts found for this user" });
    }

    // Send the contracts back as JSON
    res.status(200).json(contracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/contracts/my-contracts", isAuthenticated, async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const contracts = await Contract.find({ userId: req.session.userId });
    res.status(200).json(contracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/my-contracts", isAuthenticated, async (req, res) => {
  try {
    // Check if the user is logged in
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    // Fetch contracts associated with the logged-in user
    const contracts = await Contract.find({
      userId: req.session.userId,
    }).populate("userId");

    // Render the contracts to the view
    res.render("myContracts", { contracts }); // Adjust the view name accordingly
  } catch (err) {
    console.error("Error fetching my contracts:", err);
    res.status(500).send("Error fetching contracts.");
  }
});

app.get("/accepted-contracts", isAuthenticated, async (req, res) => {
  try {
    // Ensure that the userId is available in the session
    const userId = req.session.userId;
    if (!userId) {
      return res.status(400).send("User not authenticated");
    }

    // Debugging: log the userId to verify it's correctly fetched
    console.log("User ID from session:", userId);

    // Fetch accepted contracts where the user is either the buyer or farmer
    const acceptedContracts = await AcceptedContract.find({
      status: "Accepted", // Only accepted contracts
      $or: [{ buyerId: userId }, { farmerId: userId }] // Check if the user is either the buyer or the farmer
    })
      .populate("buyerId", "name email") // Populate buyer details (name, email)
      .populate("farmerId", "name email"); // Populate farmer details (name, email)

    // Debugging: log the fetched contracts to verify they exist
    console.log("Fetched Accepted Contracts for User:", acceptedContracts);

    // If no accepted contracts are found, return a message or empty array
    if (acceptedContracts.length === 0) {
      return res.render("acceptedContracts", { acceptedContracts: [], message: "No accepted contracts found." });
    }

    // Render the accepted contracts page with the fetched data
    res.render("acceptedContracts", { acceptedContracts: acceptedContracts });

  } catch (err) {
    // Log the specific error for better debugging
    console.error("Error fetching accepted contracts:", err.message);
    res.status(500).send("Internal Server Error");
  }
});



// Remove this block
app.get("/contracts", isAuthenticated, (req, res) => {
  // Assuming you have user data available in req.user from session or authentication middleware
  const user = req.user; // Ensure you have the user object here

  Contract.find({}, (err, contracts) => {
    if (err) {
      return res.status(500).send("Error retrieving contracts");
    }

    // Pass the contracts and the user to the EJS template
    res.render("contractHistory", { ContractHistory: contracts, user });
  });
});

app.get("/:id/edit", async (req, res) => {
  let { id } = req.params;
  const user = await User.findById(id);
  res.render("EditProfile.ejs", { user });
});
// In your Express server file
// app.get("/accepted-contracts", isAuthenticated, (req, res) => {
//   // Fetch accepted contracts from the database
//   Contract.find({ status: "accepted" })
//     .then((acceptedContracts) => {
//       res.render("acceptedContracts", { acceptedContracts }); // Adjust as needed
//     })
//     .catch((err) => {
//       console.error(err);
//       res.status(500).send("Internal Server Error");
//     });
// });

app.get("/contracts/:id/details", isAuthenticated, async (req, res) => {
  try {
    const contractId = req.params.id;

    const contract = await Contract.findById(contractId)
      .populate("buyerId", "name email number role")
      .populate("farmerId", "name email number role");

    if (!contract) {
      return res.status(404).send("Contract not found.");
    }

    res.render("contractDetails", { contract });
  } catch (error) {
    console.error("Error fetching contract details:", error);
    res.status(500).send("Error fetching contract details.");
  }
});

app.post("/contracts/:contractId/accept", isAuthenticated, async (req, res) => {
  try {
    const { contractId } = req.params;

    // Logic to accept the contract (e.g., update the database)
    const contract = await Contract.findByIdAndUpdate(contractId, {
      accepted: true, // Assuming you have an `accepted` field in your contract schema
    });

    if (!contract) {
      return res.status(404).json({ message: "Contract not found." });
    }

    // Optionally, retrieve the accepted contract details after update
    const acceptedContract = await Contract.findById(contractId);

    // Redirect to the accepted contracts page
    res.redirect(`/acceptedContracts/${acceptedContract._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});
app.post("/api/contracts/:id/accept", isAuthenticated, async (req, res) => {
  const contractId = req.params.id; // Get contract ID from URL parameters

  try {
    // Access user information from req.user or req.session
    const userId = req.user ? req.user._id : req.session.userId;
    console.log("Session User ID:", userId);

    // Check if userId is defined
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Fetch the user from the database to access the role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("Fetched User:", user);

    // Check if the user has a role defined
    const userRole = user.role; // Accessing user role directly from the fetched user
    if (!userRole) {
      return res.status(400).json({ message: "User role is undefined." });
    }

    // Find the contract by ID
    const contract = await Contract.findById(contractId)
      .populate("buyerId")
      .populate("farmerId");

    if (!contract) {
      return res.status(404).json({ message: "Contract not found." });
    }

    // Check if the contract is already accepted
    if (contract.status === "Accepted") {
      return res.status(400).json({ message: "This contract has already been accepted." });
    }

    // Extract contract role
    const contractRole = contract.role; // Assuming this is populated in the contract

    // Ensure that buyers accept Farmer contracts and vice versa
    if (
      (userRole.toLowerCase() === "buyer" && contractRole.toLowerCase() !== "farmer") ||
      (userRole.toLowerCase() === "farmer" && contractRole.toLowerCase() !== "buyer")
    ) {
      return res.status(403).json({ message: "You are not authorized to accept this contract." });
    }

    // Check if buyerId and farmerId are defined and valid before using equals()
    if (
      (contract.buyerId && contract.buyerId.equals(userId)) ||
      (contract.farmerId && contract.farmerId.equals(userId))
    ) {
      return res.status(403).json({ message: "You cannot accept your own contract." });
    }

    // Update contract status to 'Accepted'
    contract.status = "Accepted";
    await contract.save();

    // Create a new accepted contract record
    const acceptedContract = new AcceptedContract({
      userId: userId,
      Cname: contract.Cname, // Assuming these fields are part of the Contract schema
      Ctype: contract.Ctype,
      price: contract.price,
      quantity: contract.quantity,
      date: Date.now(),
    });

    await acceptedContract.save(); // Save the accepted contract to the database

    // Return the updated contract information
    res.status(200).json({
      message: "Contract accepted successfully.",
      contract: {
        ...contract.toObject(),
        buyer: contract.buyerId, // Populated buyer details
        farmer: contract.farmerId, // Populated farmer details
      },
    });
  } catch (error) {
    console.error("Error accepting contract:", error);
    res.status(500).json({
      message: "An error occurred while accepting the contract.",
      error: error.message,
    });
  }
});






// app.post("/acceptContract", isAuthenticated, async (req, res) => {
//   const { contractId } = req.body; // Assuming you pass contractId in the request body

//   try {
//     // // Check if the user is logged in
//     // if (!req.session.userId) {
//     //   return res.status(401).json({ message: "Unauthorized. Please log in." });
//     // }

//     // Fetch the contract by ID
//     const contract = await Contract.findById(contractId)
//       .populate("buyerId") // If you want to fetch buyer details
//       .populate("farmerId"); // If you want to fetch farmer details
//     if (!contract) {
//       return res.status(404).json({ message: "Contract not found." });
//     }

//     // Fetch the user who is accepting the contract
//     const user = await User.findById(req.session.userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Check roles (use consistent casing)
//     if (
//       (user.role === "Farmer" && contract.role === "Buyer") ||
//       (user.role === "Buyer" && contract.role === "Farmer")
//     ) {
//       // Update contract status (e.g., accepted)
//       contract.status = "Accepted"; // Assuming you have a status field
//       await contract.save();

//       return res.status(200).json({
//         message: "Contract accepted successfully.",
//         contract: contract.toObject(), // Return the updated contract details if needed
//       });
//     } else {
//       return res.status(403).json({
//         message: "You are not authorized to accept this contract.",
//       });
//     }
//   } catch (error) {
//     console.error("Error accepting contract:", error);
//     return res.status(500).json({
//       message: "Failed to accept the contract. Please try again later.",
//       error: error.message, // Optionally include error details
//     });
//   }
// });


app.post("/login", async (req, res) => {
  const { emailOrNumber, password } = req.body;

  try {
    // Find user by either email or number
    const user = await User.findOne({
      $or: [{ email: emailOrNumber }, { number: emailOrNumber }],
    });

    // Check if user exists and password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.userId = user._id; // Set session user ID

      // Save the session after setting user ID
      req.session.save(async (err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).send("Error logging in.");
        }

        console.log("User logged in:", user); // Log user object

        // Fetch contracts associated with the logged-in user
        const contracts = await Contract.find({ userId: user._id }); // Fetch contracts for the logged-in user

        // Assuming you have logic to determine accepted contracts
        const acceptedContracts = contracts.filter(
          (contract) => contract.status === "Accepted"
        );

        // Render the view with user data and contracts
        return res.render("indexAfter", { user, contracts, acceptedContracts });
      });
    } else {
      return res.status(400).send("Invalid credentials");
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send("Error logging in.");
  }
});

// After successful signup
app.post("/signup", async (req, res) => {
  let { name, email, role, password, number, state, city, pinCode } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !role ||
    !number ||
    !state ||
    !city ||
    !pinCode
  ) {
    return res.status(400).send("All fields are required");
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Set the profile picture based on the role
    const profilePic =
      role === "farmer"
        ? "/images/farmer-default.png" // Path to farmer's default profile picture
        : "/images/buyer-default.png"; // Path to buyer's default profile picture

    let newSignup = new User({
      name: name,
      email: email,
      role: role,
      password: hashedPassword,
      number: number,
      state: state,
      city: city,
      pinCode: pinCode,
      profilePic: profilePic, // Add profilePic field
    });

    await newSignup.save();
    console.log("Signup data was saved");

    // Fetch contracts for the new user (if needed)
    const contracts = await Contract.find({ userId: newSignup._id }); // Fetch contracts for the new user

    // Assuming you have logic to determine accepted contracts
    const acceptedContracts = contracts.filter(
      (contract) => contract.status === "Accepted"
    );
    res.render("indexAfter", { user: newSignup, contracts, acceptedContracts }); // Pass the new user object and contracts to the view
  } catch (error) {
    console.error("Error during signup: ", error);
    res.status(500).send("Error signing up.");
  }
});

app.post("/contractHistory", async (req, res) => {
  try {

    // Check if the user is logged in using session
    if (!req.session.userId) {
      console.log("User is not authenticated");
      return res.redirect("/login");
    }

    // Fetch the user data based on the logged-in user ID
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.log("User not found in the database");
      return res.status(404).send("User not found");
    }

    // Log the user ID to debug
    console.log("User ID:", user._id);

    // Extract contract details from the request body
    let { Cname, Ctype, price, quantity, date } = req.body;

    // Ensure all required fields are provided
    if (!Cname || !Ctype || !price || !quantity || !date) {
      console.log("Missing contract details");
      return res.status(400).send("All contract fields are required");
    }

    // Convert date string to Date object if necessary
    const formattedDate = new Date(date); // Ensure the date is a valid Date object

    // Create a new contract with the user's role, state, and city
    let newContract = new Contract({
      Cname: Cname,
      Ctype: Ctype,
      price: price,
      quantity: quantity,
      date: formattedDate, // Use the formatted date
      role: user.role,
      state: user.state,
      city: user.city,
      userId: user._id, // Store the user's ID with the contract
    });

    // Save the new contract to the database
    await newContract.save();
    console.log("Contract was saved successfully");


    res.redirect("/contractHistory"); // Redirect to contract history page
  } catch (err) {
    console.error("Error saving contract:", err);
    res.status(500).send("Error saving contract.");
  }
});
// app.put("/:id", async (req, res) => {
//   let { id } = req.params;
//   let Newuser = await User.findByIdAndUpdate(id, {...req.body.user});
//   Newuser.save();
//   // res.redirect("/login");
//   res.send("Profile updated successfully");
// });
app.put("/:id", async (req, res) => {
  let { id } = req.params;

  try {
    // Update the user with the provided data
    await User.findByIdAndUpdate(id, { ...req.body.user }, { new: true });

    // Redirect to login page after successful update
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    // Handle error and redirect to login page in case of failure
    res.redirect("/login");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
