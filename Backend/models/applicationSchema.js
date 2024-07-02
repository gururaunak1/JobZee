import mongoose from "mongoose";
import validator from "validator";

// this is for, USER who is willing to get job, can post application with resume,
// this is for, USER who is posting jobs application on the portal.
const applicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your Name!"],
        minLength: [3, "Name must contain at least 3 Characters!"],
        maxLength: [30, "Name cannot exceed 30 Characters!"],
    },
    email: {
        type: String,
        required: [true, "Please enter your Email!"],
        validate: [validator.isEmail, "Please provide a valid Email!"],
    },
    coverLetter: {
        type: String,
        required: [true, "Please provide a cover letter!"],
    },
    phone: {
        type: Number,
        required: [true, "Please enter your Phone Number!"],
    },
    address: {
        type: String,
        required: [true, "Please enter your Address!"],
    },
    resume: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    applicantID: {
        // who is applying this application.
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // and only Job Seeker can apply the application.
        // enum is used for that only Job Seeker can apply this.
        role: {
            type: String,
            enum: ["Job Seeker"],
            required: true,
        },
    },
    // ye isliye taki employer sare application dekh sake uss job pr jo usne post ki h.
    // go see on applicationSchema, employerGetAllApplications function.
    employerID: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["Employer"],
            required: true,
        },
    },
});

export const Application = mongoose.model("Application", applicationSchema);