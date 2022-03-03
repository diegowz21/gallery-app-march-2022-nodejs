const express = require("express");
const Photo = require("../models/Photo");
const { Router } = require.resolve("express");
const router = express.Router();
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARYNAME,
  api_key: process.env.CLOUDINARYAPIKEY,
  api_secret: process.env.CLOUDINARYAPISECRET,
});
const fs = require("fs-extra");

router.get("/", async (req, res) => {
  const photos = await Photo.find().lean();
  res.render("images", {photos});
});

router.get("/images/add", async (req, res) => {
  const photos = await Photo.find().lean();
  res.render("image_form", {photos});
});

router.post("/images/add", async (req, res) => {
  console.log(req.body);
  const { title, description } = req.body;
  const result = await cloudinary.v2.uploader.upload(req.file.path);
  const newPhoto = new Photo({
    title,
    description,
    imageURL: result.url,
    public_id: result.public_id,
  });
  await newPhoto.save();
  await fs.unlink(req.file.path);
  res.redirect("/");
});

router.get('/images/delete/:photo_id', async (req, res) => {
  const { photo_id } = req.params;
  const photo = await Photo.findByIdAndDelete(photo_id);
  const result = await cloudinary.v2.uploader.destroy(photo.public_id);
  console.log(result);
  res.redirect('/images/add');
})

module.exports = router;
