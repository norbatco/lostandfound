const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// GitHub credentials (replace with your actual token)
const GITHUB_API_URL = 'https://api.github.com/repos/your-username/lost-and-found-reports/contents/reports/';
const GITHUB_TOKEN = 'your_personal_access_token';  // Generate a GitHub Personal Access Token

// Function to upload data to GitHub
async function uploadReportToGitHub(reportData) {
    const filePath = `reports/${Date.now()}_report.json`;  // Create unique filename based on timestamp

    // Convert report data to base64
    const fileContent = Buffer.from(JSON.stringify(reportData)).toString('base64');

    try {
        const response = await axios.put(
            `${GITHUB_API_URL}${filePath}`,
            {
                message: 'Add new report',
                content: fileContent,
            },
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );
        console.log('Report uploaded successfully:', response.data);
    } catch (error) {
        console.error('Error uploading report:', error);
    }
}

// Route to handle form submission from frontend
app.post('/submit-report', (req, res) => {
    const { itemName, description, category } = req.body;
    const reportData = {
        itemName,
        description,
        category,
        timestamp: new Date(),
    };

    // Upload report data to GitHub
    uploadReportToGitHub(reportData);

    res.json({ message: 'Report submitted successfully' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
