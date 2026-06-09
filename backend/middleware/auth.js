import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    console.log("verifyToken called");
    try{

        const authHeader = req.headers.authorization;
        console.log("Authorization: ", authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: "Access denied, no token provided" });
        }
        
        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            return res.status(401).json({success: false, message: "Access denied, no token"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token: ", decoded);
        req.user = decoded;
        next(); 
    }catch(error){
        return res.status(500).json({message: "Server error"});
    }
};