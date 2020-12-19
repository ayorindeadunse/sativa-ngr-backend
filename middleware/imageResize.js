const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const outputFolder = "public/assets";

module.exports = async (req, res, next) => {
  const images = [];
  const resizePromises = req.files.map(async (file) => {
    // set image resize dimensions
    await sharp(file.path)
      .resize(2000)
      .jpeg({ quality: 50 })
      .toFile(path.resolve(outputFolder, file.filename + "_full.jpg"));

    // set image resize dimensions for the thumbnail
    await sharp(file.path)
      .resize(100)
      .jpeg({ quality: 30 })
      .toFile(path.resolve(outputFolder, file.filename + "_thumb.jpg"));

    // delete filename path
    fs.unlinkSync(file.path);

    // add image to the array
    images.push(file.filename);
  });

  // resolve all promises wrt to the image resizing function
  await Promise.all([...resizePromises]);

  req.images = images;
  next();
};
