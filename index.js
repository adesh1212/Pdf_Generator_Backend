const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');

const fs = require('fs')
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());

// Set up Multer for handling image uploads
const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage: storage });


// API endpoint for merging uploaded images into a PDF
app.post('/merge-images', upload.array('images'), async (req, res) => {
    const pdfDoc = await PDFDocument.create();
    try {
        req.files.forEach(async (file, index) => {
            try {
                // console.log(file);
                let image;
                if(file.mimetype === 'image/png' ){
                    image = await pdfDoc.embedPng(file.buffer);
                }
                else if(file.mimetype === 'image/jpeg'){
                    image = await pdfDoc.embedJpg(file.buffer);
                }

                const { width, height } = image.scale(0.5);
                const page = pdfDoc.addPage();

                page.drawImage(image, {
                    x: 50,
                    y: page.getHeight()/2,
                    width: page.getWidth()<=width ? width/2 : width,
                    height: page.getWidth()<=width ? height/2 : height,
                });
            } catch (error) {
                console.error(error);
            }

        });

        // Serialize the PDF to bytes
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync("./output.pdf", pdfBytes);

        // Send the merged PDF as a response
        // res.setHeader('Content-Type', 'application/pdf');
        // res.status(200).sendFile(`${__dirname}/output.pdf`);

        res.download(`${__dirname}/output.pdf`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error merging images into PDF');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
