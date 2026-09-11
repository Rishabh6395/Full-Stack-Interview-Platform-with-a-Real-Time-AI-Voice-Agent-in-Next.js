import jwt from 'jsonwebtoken';

import { error } from 'node:console';

const authenticate = (req: any, res: any, next: any) => {
    try {
        const token = req.headers['authorization']?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: "No auth token provided" });
        }

        const decoded: any = jwt.verify(token, 'rishabhsecrettoken-ondevonly' as string);
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (err: any) {
        console.log(process.env.JWT_SECRET)
        console.error(err)
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
};

export { authenticate, requireAdmin };