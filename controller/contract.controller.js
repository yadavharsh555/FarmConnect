import Contract from "../models/contract.model.js";

export const getContract=async(req,res) => {
    try {
        const contract = await Contract.find();
        res.status(200).json(contract); 
    } catch (error) {
        console.error("Error: ",error);
        res.status(500).json({error});
    }
}