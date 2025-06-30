    const axios = require('axios');
    const cheerio =  require('cheerio');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const express = require('express');
    const port =  3000;

    const app = express();

    app.use(cors());
    app.use(bodyParser.urlencoded({extended:true}));
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

            section.find(".question-pnl").each((_, questionBlock) => {
                const block = $(questionBlock);
                const correctOptionText = block.find(".rightAns").first().text().trim();
                const correctOptionNumber = correctOptionText.match(/^(\d+)/)?.[1];
                const metaTable = block.find(".menu-tbl");
                const chosenOption = metaTable.find("td:contains('Chosen Option :')").next().text().trim();
                const status = metaTable.find("td:contains('Status :')").next().text().trim();

                if (status.toLowerCase() === "answered") {
                    attempted++;
                    if (correctOptionNumber === chosenOption) correct++;
                    else wrong++;
                } else {
                notAttempted++;
                }
            });

        });
        result.push({
            section: sectionName,
            attempted,
            notAttempted,
            correct,
            wrong,
            totalMarks: correct * 2
        });

            console.log(result);
            

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

    app.listen(port , ()=>{
        console.log(`Server is running at http://localhost:${port}`);
        
    })