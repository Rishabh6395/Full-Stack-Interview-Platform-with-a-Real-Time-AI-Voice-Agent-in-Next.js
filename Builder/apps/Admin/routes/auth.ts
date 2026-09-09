import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '@repo/db';

const router = express.Router();

router.post('/admin/v1/auth/login', async (req, res) => {
    try {
        const { emailaddress, password } = req.body;

        const result = await db.query("SELECT * FROM users WHERE email = $1", [emailaddress]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user:any = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        res.json({ success: true, token: token, user: { id: user.id, email: user.email} });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send("Server Error, check server logs");
    }
});

router.post('/admin/v1/auth/register', async (req, res) => {
    try {
        const { emailaddress, password_hash, name } = req.body;

        const existing = await db.query("SELECT id FROM users WHERE emailaddress = $1", [emailaddress]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password_hash, 10);

        const newUser = await db.query(
            "INSERT INTO users (name, emailaddress, password_hash) VALUES ($1, $2, $3) RETURNING id, name, emailaddress",
            [name, emailaddress, hashedPassword]
        );

        res.status(201).json({ success: true, data: newUser.rows[0] });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send("Server Error, check server logs");
    }
});

export default router;