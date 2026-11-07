import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error("Only JPEG, PNG, and WebP images are allowed")
            );
        }

        cb(null, true);
    }
});

export const uploadProductImages = (req, res, next) => {
    upload.array("images", 5)(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                message: error.message || "Image upload failed"
            });
        }

        next();
    });
};