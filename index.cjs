    const axios = require('axios');
    const cheerio =  require('cheerio');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const express = require('express');
    const fs = require('fs');
    const path = require('path');
    const port =  3000;

    const app = express();

    app.use(cors());
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(express.json());
    app.use(express.static(__dirname));

    app.post('/scrapper' , async (req,res)=>{
        const {inputUrl} = req.body;
        
        if(!inputUrl){
            return res.status(400).json({error:'URL Not Found'});
        }
        const cleanedUrl = inputUrl.trim();

        try {
            const response = await axios.get(cleanedUrl);
            const html = response.data;
            const $ = cheerio.load(html);

            const name = $('td:contains("Candidate Name")').next().text().trim();
            const roll = $('td:contains("Roll Number")').next().text().trim();
            const venue = $('td:contains("Venue Name")').next().text().trim();
            const examDate = $('td:contains("Exam Date")').next().text().trim();
            const examTime = $('td:contains("Exam Time")').next().text().trim();
            const subject = $('td:contains("Subject")').next().text().trim();

            const sections = [];
            const result = [];

            $(".grp-cntnr").each((sectionIndex, sectionEl) => {
            const section = $(sectionEl);
            const sectionName = `Section ${sectionIndex + 1}`;

            let attempted = 0, notAttempted = 0, correct = 0, wrong = 0;

        });

        result.push({
            section: sectionName,
            attempted,
            notAttempted,
            correct,
            wrong,
            totalMarks: correct * 2
        });

        res.json({
            name,
            roll,
            venue,
            examDate,
            examTime,
            subject,
            marks: result
            });

        } catch (error) {
            console.error(`Error Occured while Scrapping ${error.message}`);    
            return res.status(500).json({ error: 'Failed to fetch or parse the HTML' });
        }
    })


        app.get('/download', (req, res) => {
            const csvContent = `Name,Roll,Venue,Date,Time,Subject\n${name},${roll},${venue},${examDate},${examTime},${subject}`;
            const filePath = path.join(__dirname, 'data.csv');

            fs.writeFile(filePath, csvContent, (err) => {
                if (err) {
                    console.error("Error writing CSV file:", err);
                    return res.status(500).send('Failed to generate CSV');
                }
                res.download(filePath, 'result.csv', (err) => {
                    if (err) console.error("Download error:", err);
                });
            });
        });

    app.listen(port , ()=>{
        console.log(`Server is running at http://localhost:${port}`);
        
    })