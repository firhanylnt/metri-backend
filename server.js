require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Configure Nodemailer Transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

app.post("/autocomplete", async(req, res) => {
    try {
        const { npk } = req.body;
        const user = await prisma.existingUser.findFirstOrThrow({
            where: { npk: Number(npk) }
        });

        console.log(user)

        res.json({
            success: true,
            data: user,
        })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
    
})

// Insert User and Send Email
app.post("/users", async (req, res) => {
  const { fullname, email, npk, cabang } = req.body;

  try {
    // Insert user into the database
    const newUser = await prisma.user.create({
      data: { fullname, email, npk, cabang },
    });

    // Send email notification
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: "Welcome to Our System",
    //   text: `Hello ${fullname},\n\nYour account has been created successfully!\n\nNPK: ${npk}\nCabang: ${cabang}`,
    // });

    res.json({ success: true, message: "User created and email sent", user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
