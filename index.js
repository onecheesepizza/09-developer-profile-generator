const inquirer = require('inquirer');
const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer');
const pdf = require('html-pdf');
const pdfOptions = { 
    format: 'Letter',
    orientation: 'portrait', 
    border: '0'
};
const questions = [{
    type: 'input',
    name: 'userName',
    message: "What is your GitHub username?"
  },
  {
    type: 'input',
    name: 'userColor',
    message: "What is your favorite color?"
  }
];

function promptUser() {
    const answers = inquirer.prompt(questions);
    return answers;
}

function getGithubStars(answers){
    //create API call url
    const queryURL = `https://api.github.com/users/${answers.userName}/starred`;
    //call GitHub API for stars
    return axios
    .get(queryURL)
    .then((res, answers) => {
        console.log("GitHub stars received...");
        return res.data;
    })
    .catch(err=>{
        console.log("Error getting stars from GitHub: ", err.code);
    });    
}

function getGithubProfile(answers){
    //create API call url
    let queryURL = `https://api.github.com/users/${answers.userName}`;
    //call GitHub API
    return axios
        .get(queryURL)
        .then(res => {
            console.log("GitHub data received...");
            console.log(res);
            return res.data;
        })
        .catch(err=>{
            console.log("Error getting data from GitHub: ", err.code);
        });
}  

function generatePageHTML(gitHubProfile, gitHubStars, answers){
    //read template from file
    let htmlTemplate = fs.readFileSync('template.html', 'utf-8');
    //evaluate template literal
    htmlTemplate = eval("`"+htmlTemplate+"`");
    //return html
    return htmlTemplate;
}

async function savePDF(html){
    console.log("Creating and saving PDF...");
    //set up puppeteer to view html and save pdf
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //generate page
    await page.setContent(html);
    //save pdf
    await page.pdf({ path: 'profile.pdf', format: 'A4', printBackground: true, scale: 1.5});
    //close puppeteer
    await browser.close()
    //handle errors
    .catch(err => {
        return console.log(err);
    });
    //success log
    console.log("Successfully saved profile.pdf");   
}
//main app
async function mainApp(){
    //prompt user
    const answers = await promptUser();
    //set answer defaults if no input received
    if (answers.userColor===''){
        answers.userColor="blue";
    }
    if (answers.userName===''){
        answers.userName="onecheesepizza";
    }
    //get GitHub profile data
    const gitHubProfile = await getGithubProfile(answers);
    //get GitHub star data
    const gitHubStarsRes = await getGithubStars(answers);
    const gitHubStars = gitHubStarsRes.length;
    //generate page HTML
    const profileHTML = await generatePageHTML(gitHubProfile, gitHubStars, answers);
    //generate and save PDF to disk
    savePDF(profileHTML);
}

mainApp();