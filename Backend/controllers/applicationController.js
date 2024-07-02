import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

// this will only run when user is authrized (thats y we able to get the user)
// go see in applicationRoutes there is (isAuthenticated) as a middleware.
export const postApplication = catchAsyncErrors(async (req, res, next) => {
    const { role } = req.user;
    // becoz only Job Seeker can only upload and resume and post its application.
    if (role === "Employer") {
        return next(
            new ErrorHandler("Employer not allowed to access this resource.", 400)
        );
    }
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Resume File Required!", 400));
    }

    // .files is use for any files
    const { resume } = req.files;

    // we are dont using pdf filed bcoz Cloudinary don't user PDF files
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];

    // mimetype gives the extension of the files
    if (!allowedFormats.includes(resume.mimetype)) {
        return next(
            new ErrorHandler("Invalid file type. Please upload a PNG file.", 400)
        );
    }

    // uploading, and console log to see what are other values are coming
    const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
            "Cloudinary Error:",
            cloudinaryResponse.error || "Unknown Cloudinary error"
        );
        return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
    }

    // if file upload is successfull
    // match this with applicationSchema
    const { name, email, coverLetter, phone, address, jobId } = req.body;

    // who is applying
    const applicantID = {
        user: req.user._id,
        role: "Job Seeker",
    };

    // to see if job exist or not
    if (!jobId) {
        return next(new ErrorHandler("Job not found!", 404));
    }

    // this is for the emoloyer ID
    const jobDetails = await Job.findById(jobId);
    if (!jobDetails) {
        return next(new ErrorHandler("Job not found!", 404));
    }

    // kyuki emoloyer is job post kr sakta h tho jobId se job dhund kr usmain postedBy se employerID nikal li.
    const employerID = {
        user: jobDetails.postedBy,
        role: "Employer",
    };

    if (
        !name ||
        !email ||
        !coverLetter ||
        !phone ||
        !address ||
        !applicantID ||
        !employerID ||
        !resume
    ) {
        return next(new ErrorHandler("Please fill all fields.", 400));
    }

    const application = await Application.create({
        name,
        email,
        coverLetter,
        phone,
        address,
        applicantID,
        employerID,
        resume: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });
    res.status(200).json({
        success: true,
        message: "Application Submitted!",
        application,
    });
});

// go see applicationSchema
export const employerGetAllApplications = catchAsyncErrors(
    async (req, res, next) => {
        const { role } = req.user;
        if (role === "Job Seeker") {
            return next(
                new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
            );
        }
        const { _id } = req.user;
        // finding all application related to the Employer_user
        const applications = await Application.find({ "employerID.user": _id });
        res.status(200).json({
            success: true,
            applications,
        });
    }
);

export const jobseekerGetAllApplications = catchAsyncErrors(
    async (req, res, next) => {
        const { role } = req.user;
        if (role === "Employer") {
            return next(
                new ErrorHandler("Employer not allowed to access this resource.", 400)
            );
        }
        const { _id } = req.user;
        const applications = await Application.find({ "applicantID.user": _id });
        res.status(200).json({
            success: true,
            applications,
        });
    }
);


// Job seeker can delete the application he has applyed, but the employer cant delete it.
export const jobseekerDeleteApplication = catchAsyncErrors(
    async (req, res, next) => {
        const { role } = req.user;
        if (role === "Employer") {
            return next(
                new ErrorHandler("Employer not allowed to access this resource.", 400)
            );
        }
        const { id } = req.params;
        const application = await Application.findById(id);
        if (!application) {
            return next(new ErrorHandler("Application not found!", 404));
        }
        await application.deleteOne();
        res.status(200).json({
            success: true,
            message: "Application Deleted!",
        });
    }
);