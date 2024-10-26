const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/questionnaire', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define Schema
const QuestionnaireSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    answers: {
        type: Object,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const Questionnaire = mongoose.model('Questionnaire', QuestionnaireSchema);

// API endpoint to handle form submission
app.post('/api/submit', async (req, res) => {
    try {
        const { email, answers } = req.body;

        // Check if a submission already exists for this email
        const existingSubmission = await Questionnaire.findOne({ email });

        if (existingSubmission) {
            // Update existing submission
            await Questionnaire.findOneAndUpdate(
                { email },
                { answers, submittedAt: new Date() },
                { new: true }
            );
            res.json({ message: 'Questionnaire updated successfully' });
        } else {
            // Create new submission
            const newSubmission = new Questionnaire({
                email,
                answers
            });
            await newSubmission.save();
            res.json({ message: 'Questionnaire submitted successfully' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});