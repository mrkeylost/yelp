const cities = require("./cities");
const { descriptors, places } = require("./helper");
const Campgrounds = require("../models/campground");
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/YelpCampDB")
  .then(() => console.log("Connection Open"))
  .catch((e) => console.log(e));

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
  await Campgrounds.deleteMany({});

  for (let i = 0; i < 50; i++) {
    let newCamp = new Campgrounds({
      author: "69d5000241c31d86600ebcd2",
      title: `${sample(descriptors)} ${sample(places)}`,
      price: Math.floor(Math.random() * 20) + 10,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi vel omnis ipsam animi accusantium. Sit reprehenderit, aliquam qui eos voluptates molestiae. Aliquam alias provident at nobis, qui corrupti repudiandae quas.",
      location: `${sample(cities).city}, ${sample(cities).province}`,
      geometry: {
        type: "Point",
        coordinates: [sample(cities).longitude, sample(cities).latitude],
      },
      images: [
        {
          url: "https://res.cloudinary.com/divqhgf1j/image/upload/v1775641224/YelpCamp/ckr98mcesyxv0oifyrng.jpg",
          fileName: "YelpCamp/ckr98mcesyxv0oifyrng",
        },
        {
          url: "https://res.cloudinary.com/divqhgf1j/image/upload/v1775641225/YelpCamp/rri2hasihcfbwms7qw7w.jpg",
          fileName: "YelpCamp/rri2hasihcfbwms7qw7w",
        },
      ],
    });

    await newCamp.save();
  }
};

seedDB().then(() => mongoose.connection.close());
