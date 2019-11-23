const inquirer = require('inquirer');
const fs = require('fs');
const axios = require('axios');
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
//default bg color
let bgColor = 'blue';
let numStars=0;

function promptUser() {
    const answers = inquirer.prompt(questions);
    return answers;
}

function getGithubStars(answers){
    //create API call url
    const queryURL = `https://api.github.com/users/${answers.userName}/starred`;
    //call GitHub API for stars
    axios
    .get(queryURL)
    .then((res, answers) => {
        console.log("GitHub stars received...");
        numStars = res.data.length;
        return answers;
    })
    .catch(err=>{
        console.log("Error getting stars from GitHub: ", err.code);
    });    
}

function getGithubData(answers){
    //create API call url
    let queryURL = `https://api.github.com/users/${answers.userName}`;
    //call GitHub API
    return axios
        .get(queryURL)
        .then(res => {
            console.log("GitHub data received...");
            return res.data;
        })
        .catch(err=>{
            console.log("Error getting data from GitHub: ", err.code);
        });
    }

function generatePageHTML(obj){
    //store input as 'data' for template eval
    const data = obj;
    //read template from file
    let htmlTemplate = fs.readFileSync('template.html', 'utf-8');
    //evaluate template literal
    htmlTemplate = eval("`"+htmlTemplate+"`");
    //return html
    return htmlTemplate;
}

function savePDF(html){
    console.log("Creating and saving PDF...");
    pdf
    //generate pdf
    .create(html, pdfOptions)
    //save pdf to file
    .toFile("./profile.pdf", (err, res) => {
      //error  
      if (err) return console.log(err);
      //success
      console.log(res.filename); 
      console.log("Successfully saved profile.pdf");
    });
}

//prompt for user input and process it
promptUser()
    .then( answers => {
        //set global bgColor variable to user input if not blank
        if (answers.userColor!=""){
            bgColor = answers.userColor;
        }
        //pass answers on to next function to get GitHub data
        return answers;
    })
    // get GitHub user data
    .then(getGithubData)
    //generate page HTML
    .then(generatePageHTML)
    //convert html to PDF
    .then(savePDF)
    //catch & log error
    .catch( err => {
        console.log("Caught: ", err);
    });

