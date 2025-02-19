require("dotenv").config();
const express = require("express");
const axios = require('axios');
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

app.post("/existing", async (req, res) => {
    try {

        const { npk } = req.body;
        const user = await prisma.existingUser.findFirst({
            where: { npk: Number(npk) }
        })

        res.json({
            success: true,
            data: user,
        })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

})

app.get("/total", async(req, res) => {
    try {
        const registered = await prisma.user.count();
        const confirm = await prisma.user.count({where: {status: true}});

        res.json({
            success: true,
            data: {
                registered: registered,
                confirm: confirm,
            },
        })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

app.post("/confirmation", async (req, res) => {
    try {

        const { npk } = req.body;

        const user = await prisma.user.findFirst({
            where: { npk: npk }
        })

        await prisma.user.update({
            where: {
                npk: npk
            },
            data: {
                status: true,
            }
        })

        await transporter.sendMail({
            from: `"Annual Conference 2025" <noreply@mifac2025.id>`,
            to: user.email,
            subject: "Berhasil Registrasi Ulang!",
            replyTo: "no-reply@mifac2025.id",
            html: `
          <div style="background-color: black; padding: 20px; text-align: center; color: white; font-family: Arial, sans-serif;">
            <div style="margin-bottom: 20px;">
              <img src="https://www.mifac2025.id/images/logo-header.jpg" alt="Logo" style="max-width: 200px;">
            </div>
            
            <h2 style="color: white; font-size: 24px;">Hi ${user.fullname},</h2>
            <p style="color: white; font-size: 16px;">Terima kasih telah melakukan registrasi ulang</p>
            <p style="color: white; font-size: 16px;">Silahkan tunjukan email konfirmasi ini dipintu masuk</p>

            <p style="color: white; font-size: 14px;">Demikian informasi yang dapat kami sampaikan. Terima kasih atas perhatiannya.</p>
            <br>
            <p style="color: white; font-size: 14px;">Salam Mayfiners,</p>
            <p style="color: white; font-size: 14px;font-style: italic;"><b>Perform, Comply, Accountable</b></p>
            <p style="color: white; font-size: 14px;">Panitia Annual Conference 2025</p>
      
            <hr style="border-color: white; margin: 20px 0;">
      
            <p style="color: gray; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `,
        });

        res.json({
            success: true,
        })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

})

app.get("/testi", async (req, res) => {
    try {

        const testi = await prisma.testimoni.findMany(
            { orderBy: { id: 'desc' } }
        )

        res.json({
            success: true,
            data: testi,
        })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

})

app.get("/register-user", async (req, res) => {
    try {

        const testi = await prisma.user.findMany(
            {
                orderBy: { id: 'desc' }
            }
        )

        res.json({
            success: true,
            data: testi,
        })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }

})


app.post("/users", async (req, res) => {

    try {

        const { fullname, email, npk, birthdate, phone_number, cabang, bookingCode, testimoni } = req.body;
        const getExisting = await prisma.existingUser.findFirst({
            where: { npk: Number(npk) }
        });

        const dateObj = new Date(birthdate);

        const formattedDate = `${String(dateObj.getDate())}/${String(dateObj.getMonth() + 1)}/${dateObj.getFullYear()}`;
        
        if(!getExisting) {
            return res.json({ success: false, error: 'NPK not found' });
        }

        const checkBirthdate = await prisma.existingUser.findFirst({
            where: { birthday: formattedDate }
        });

        if(!checkBirthdate){
            return res.json({ success: false, error: 'Tanggal lahir tidak cocok' });
        }

        const getUser = await prisma.user.findFirst({
            where: {
                npk: npk,
            }
        })

        if(getUser) {
            return res.json({ success: false, error: 'Already registered' });
        }

        const newUser = await prisma.user.create({
            data: { fullname, email, npk, birthdate, phone_number, cabang, bookingCode },
        });

        const insertTesti = await prisma.testimoni.create({
            data: {
                fullname: fullname,
                departemen: getExisting ? getExisting.departemen : 'testing',
                testimoni: testimoni,
            }
        })

        await transporter.sendMail({
            from: `"Annual Conference 2025" <noreply@mifac2025.id>`,
            to: getExisting.email,
            subject: "Welcome to Maybank Finance Annual Conference 2025!",
            replyTo: "no-reply@mifac2025.id",
            html: `
          <div style="background-color: black; padding: 20px; text-align: center; color: white; font-family: Arial, sans-serif;">
            <div style="margin-bottom: 20px;">
              <img src="https://www.mifac2025.id/images/logo-header.jpg" alt="Logo" style="max-width: 200px;">
            </div>
            
            <h2 style="color: white; font-size: 24px;">Halo ${fullname},</h2>
            <p style="color: white; font-size: 16px;">Terima kasih telah melakukan registrasi untuk <b>Maybank Finance Annual Conference 2025</b>.</p>
            <p style="color: white; font-size: 16px;">Berikut adalah nomor registrasi Anda:</p>
      
            <div style="margin: 20px auto; padding: 15px; background-color: yellow; color: black; font-size: 24px; font-weight: bold; display: inline-block; border-radius: 8px;">
              ${bookingCode}
            </div>

            <p>Mohon <b>simpan dan tunjukkan nomor registrasi</b> ini saat melakukan registrasi ulang di lokasi acara.</p>

            <p>Informasi lebih lanjut, silakan hubungi panitia di 082118307385.</p>
      
            <p style="color: white; font-size: 14px;">Demikian informasi yang dapat kami sampaikan. Terima kasih atas perhatiannya.</p>
            <br>
            <p style="color: white; font-size: 14px;">Salam Mayfiners,</p>
            <p style="color: white; font-size: 14px;font-style: italic;"><b>Perform, Comply, Accountable</b></p>
            <p style="color: white; font-size: 14px;">Panitia Annual Conference 2025</p>
      
            <hr style="border-color: white; margin: 20px 0;">
      
            <p style="color: gray; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `,
        });

        const headers = {
            Accept: 'application/json',
            APIKey: '476F76380BD0991521AAF054AB92BD73'
        };
        var data = {
            destination: getExisting.phone_number,
            message: `Halo ${getExisting.fullname},\n\nTerima kasih telah melakukan registrasi untuk *Maybank Finance Annual Conference 2025*.\n\nBerikut adalah nomor registrasi Anda:\n*${bookingCode}*\n\nMohon *simpan dan tunjukkan nomor registrasi* ini saat melakukan registrasi ulang di lokasi acara.\n\nInformasi lebih lanjut, silakan hubungi panitia di\n082118307385.\n\nDemikian informasi yang dapat kami sampaikan. Terima kasih atas perhatiannya.\n\nSalam Mayfiners,\n*_Perform, Comply, Accountable_*\nPanitia Annual Conference 2025`,
            include_unsubscribe: false,
        }
        const url = 'https://api.nusasms.com/nusasms_api/1.0/whatsapp/message'

        axios.post(url, data, { headers })
            .then(response => {
                console.log(response.data)
            })
            .catch(error => {
                if (error.response) {
                    console.error(error.response.data)
                } else if (error.request) {
                    console.error(error.request)
                } else {
                    console.error(error.message);
                }
            });

        res.json({ success: true, message: "User created and email sent" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/resend", async (req, res) => {

    try {

        const { npk } = req.body;

        const getExisting = await prisma.existingUser.findFirst({
            where: { npk: Number(npk) }
        });

        const getUser = await prisma.user.findFirst({
            where: {
                npk: npk,
            }
        })


        await transporter.sendMail({
            from: `"Annual Conference 2025" <noreply@mifac2025.id>`,
            to: getExisting.email,
            subject: "Welcome to Maybank Finance Annual Conference 2025!",
            replyTo: "no-reply@mifac2025.id",
            html: `
          <div style="background-color: black; padding: 20px; text-align: center; color: white; font-family: Arial, sans-serif;">
            <div style="margin-bottom: 20px;">
              <img src="https://www.mifac2025.id/images/logo-header.jpg" alt="Logo" style="max-width: 200px;">
            </div>
            
            <h2 style="color: white; font-size: 24px;">Halo ${getExisting.fullname},</h2>
            <p style="color: white; font-size: 16px;">Terima kasih telah melakukan registrasi untuk <b>Maybank Finance Annual Conference 2025</b>.</p>
            <p style="color: white; font-size: 16px;">Berikut adalah nomor registrasi Anda:</p>
      
            <div style="margin: 20px auto; padding: 15px; background-color: yellow; color: black; font-size: 24px; font-weight: bold; display: inline-block; border-radius: 8px;">
              ${getUser.bookingCode}
            </div>

            <p>Mohon <b>simpan dan tunjukkan nomor registrasi</b> ini saat melakukan registrasi ulang di lokasi acara.</p>
            <p>Informasi lebih lanjut, silakan hubungi panitia di 082118307385.</p>
      
            <p style="color: white; font-size: 14px;">Demikian informasi yang dapat kami sampaikan. Terima kasih atas perhatiannya.</p>
            <br>
            <p style="color: white; font-size: 14px;">Salam Mayfiners,</p>
            <p style="color: white; font-size: 14px;font-style: italic;"><b>Perform, Comply, Accountable</b></p>
            <p style="color: white; font-size: 14px;">Panitia Annual Conference 2025</p>
      
            <hr style="border-color: white; margin: 20px 0;">
      
            <p style="color: gray; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        `,
        });

        const headers = {
            Accept: 'application/json',
            APIKey: '476F76380BD0991521AAF054AB92BD73'
        };
        var data = {
            destination: getExisting.phone_number,
            message: `Halo ${getExisting.fullname},\n\nTerima kasih telah melakukan registrasi untuk *Maybank Finance Annual Conference 2025*.\n\nBerikut adalah nomor registrasi Anda:\n*${getUser.bookingCode}*\n\nMohon *simpan dan tunjukkan nomor registrasi* ini saat melakukan registrasi ulang di lokasi acara.\n\nInformasi lebih lanjut, silakan hubungi panitia di\n082118307385.\n\nDemikian informasi yang dapat kami sampaikan. Terima kasih atas perhatiannya.\n\nSalam Mayfiners,\n*_Perform, Comply, Accountable_*\nPanitia Annual Conference 2025`,
            include_unsubscribe: false,
        }
        const url = 'https://api.nusasms.com/nusasms_api/1.0/whatsapp/message'

        axios.post(url, data, { headers })
            .then(response => {
                console.log(response.data)
            })
            .catch(error => {
                if (error.response) {
                    console.error(error.response.data)
                } else if (error.request) {
                    console.error(error.request)
                } else {
                    console.error(error.message);
                }
            });

        res.json({ success: true, message: "User created and email sent" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
