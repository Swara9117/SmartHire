import jwt from "jsonwebtoken";
 export const verifyToken = async (req, resp, next) => {
    try {
        const bearerHeader = req.header("Authorization");
        console.log("Authorization Header:", bearerHeader); 
        if (!bearerHeader) {
            return resp.status(403).json({ message: "Access Denied" });
        }
        else {
            const bearer = bearerHeader.split(" ");
            // to extract token

            const token = bearer[1];
            const ifVerified=jwt.verify(token,process.env.JWT_SECRET);
            console.log(ifVerified);
            console.log("Token Verified Successfully!");
            req.user=ifVerified;
            console.log(req.user);
            next();
        }
    }
    catch(error){
        console.log("error in verifying token!", error);
        resp.status(500).json({error:error.message});
    }
};
