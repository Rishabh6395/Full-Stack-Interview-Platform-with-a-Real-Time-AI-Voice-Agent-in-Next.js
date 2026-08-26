
import express from 'express';
import db from '../db/db.js';
import runUserScript from '../utils/sandbox.js'

const router = express.Router();

router.post('/api/forms', async(req, res) =>{
    try{
        const {title, config} = req.body;

        const newForm = await db.query(
            "INSERT INTO forms (title, config) VALUES ($1, $2) RETURNING *",
            [title, JSON.stringify(config)]
        )
        res.status(201).json({ success: true, data: newForm.rows[0] });
    }
    catch(err:any){
        console.error(err.message);
        res.status(500).send("Server Error, check server logs");
    }
})

router.get('/api/forms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const form = await db.query("SELECT * FROM forms WHERE id = $1", [id]);

        if (form.rows.length === 0) {
            return res.status(404).json({ message: "Form not found" });
        }

        res.json(form.rows[0]);
    } catch (err:any) {
        console.error(err.message);
        res.status(500).send("Server Error, check server logs");
    }
});


router.post('/api/submissions', async(req, res) => {
    try {
        const {form_id, data} = req.body;

        const formCheck = await db.query('SELECT config FROM forms WHERE id=$1', [form_id]);
        if (formCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Cannot submit: Form layout does not exist.' });
        }
        const formConfig = formCheck.rows[0]?.config;
        const userScript = formConfig.script;

        // 2. Pass the data and user script into our Sandbox Engine
        let processedData;
        try {
            processedData = runUserScript(userScript, data);
        } catch (sandboxError) {
            // If the user's JS code crashes, return a clean 400 bad request error
            const message = sandboxError instanceof Error ? sandboxError.message : String(sandboxError);

            return res.status(400).json({ 
                error: "Your custom form script failed to execute.", 
                details: message
            });
        }

        // 3. Insert the PROCESSED data into the database
        const newSubmission = await db.query(
            "INSERT INTO form_submissions (form_id, data) VALUES ($1, $2) RETURNING *",
            [form_id, JSON.stringify(processedData)]
        );

        res.status(201).json({ success: true, data: newSubmission.rows[0] });
    } catch (error:any) {
        console.error(error.message);
        res.status(500).send('Server Error, check server logs');
    }
})

router.get('/api/submissions/:formId', async(req, res)=>{
    try {
        console.log(req.params);
        const {formId} = req.params;

        const submissions = await db.query('SELECT * FROM form_submissions WHERE form_id = $1 ORDER BY submitted_at DESC', [formId]);
        console.log(submissions)

        res.json({ success: true, results: submissions.rows.length, data: submissions.rows });
    } catch (error:any) {
        console.error(error.message);
        res.status(500).send('Server Error, check server logs');
    }
})

export default router;
