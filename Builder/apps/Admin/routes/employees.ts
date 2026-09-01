import express from 'express';
// import db from '../db/db.js';
import db from "@repo/db";

const router = express.Router();

router.post('/admin/v1/create-role', async (req, res) => {
    const {roleName, roleDescription} = req.body;

    try {
        const queryText = 'INSERT INTO roles (roleName, roleDescription) VALUES ($1, $2) RETURNING *';
        const result = await db.query(queryText, [roleName, roleDescription]);
        res.json(result.rows[0]); // pg returns rows as a flat array of objects
        console.log(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
})

// add role to the employee
router.post('/admin/v1/add-roles', async (req, res) => {
    const {userId, roleName} = req.body;

    try {

        // validating the inputs
        if (!roleName || !userId) {
            return res.status(400).json({ error: 'userId and roleName are required.' });
        }

        // checking the role table whether role is created or not
        const checkRole = await db.query('SELECT * FROM roles WHERE roleName = $1', [roleName]);
        
        if(checkRole.rows.length === 0){
            return res.status(400).json({ error: 'Role does not exist.' });
        }

        // checking the user_roles table whether user has this role already or not
        const checkUserRole = await db.query('SELECT * FROM user_roles WHERE user_id = $1 AND role = $2', [userId, roleName]);
        if (checkUserRole.rows.length > 0) {
            return res.status(400).json({ error: 'User already has this role.' });
        }

        // assigning the role to the user
        const queryText = 'INSERT INTO user_roles (user_id, role) VALUES ($1, $2) RETURNING *';
        const result = await db.query(queryText, [userId, roleName]);
        res.json(result.rows[0]); // pg returns rows as a flat array of objects
        console.log(result)
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
})

router.post('/admin/v1/employees', async (req, res) => {
    const {username, email, password} = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'username, email and password are required.' });
    }

    const checkAlreadyExist = await db.query('SELECT * FROM employees WHERE username = $1 OR email = $2', [username, email]);
    if (checkAlreadyExist.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists.' });
    }

    try {
        const queryText = 'INSERT INTO employees (username, email, password) VALUES ($1, $2, $3) RETURNING *';
        const result = await db.query(queryText, [username, email, password]);
        res.json(result.rows[0]); // pg returns rows as a flat array of objects
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
})


// router.post('/admin/submissions', async(req, res) => {
//     try {
//         const {form_id, data} = req.body;

//         const formCheck = await db.query('SELECT config FROM forms WHERE id=$1', [form_id]);
//         if (formCheck.rows.length === 0) {
//             return res.status(404).json({ error: 'Cannot submit: Form layout does not exist.' });
//         }
//         const formConfig = formCheck.rows[0]?.config;
//         const userScript = formConfig.script;

//         // 2. Pass the data and user script into our Sandbox Engine
//         let processedData;
//         try {
//             processedData = runUserScript(userScript, data);
//         } catch (sandboxError) {
//             // If the user's JS code crashes, return a clean 400 bad request error
//             const message = sandboxError instanceof Error ? sandboxError.message : String(sandboxError);

//             return res.status(400).json({ 
//                 error: "Your custom form script failed to execute.", 
//                 details: message
//             });
//         }

//         // 3. Insert the PROCESSED data into the database
//         const newSubmission = await db.query(
//             "INSERT INTO form_submissions (form_id, data) VALUES ($1, $2) RETURNING *",
//             [form_id, JSON.stringify(processedData)]
//         );

//         res.status(201).json({ success: true, data: newSubmission.rows[0] });
//     } catch (error:any) {
//         console.error(error.message);
//         res.status(500).send('Server Error, check server logs');
//     }
// })


export default router;
