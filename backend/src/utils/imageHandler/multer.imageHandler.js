import multer from "multer";

// multer setup for file upload and file storage
const storage = multer.diskStorage({
  destination: function (_, _file, cb) {
    cb(null, "./public/avatars");
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

// file filter to allow only png/jpeg file types
const fileFilter = (_, file, cb) => {
  // allowed mime types
  const allowedMimeTypes = ["image/jpeg", "image/png"];

  // check if the file type is allowed
  if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG and PNG files are allowed!"), false);
};

// middleware for file upload
export const uploadImageLocally = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 1,
  },
  fileFilter: fileFilter,
});
