const rankingsBody = $("#rankings");
const searchBar = $("#search-leaderboard");
const tableBody = $("#tableBody");
let allUsers;
const countDownDiv = $("#countDownClock");

let countDownClock = () => {
    let currentMonth = dayjs().month();
    let currentUnix = dayjs().unix();
    let monthEndUnix = dayjs().month(currentMonth + 1).startOf("month").unix();
    let timeUntilMonthEndUnix = monthEndUnix - currentUnix;
    let formattedTimeUntilMonthEnd = dayjs.duration(timeUntilMonthEndUnix, "seconds").format("DD:HH:mm:ss")
  
    // Update the content of the element with id "countdown-display" using jQuery
    $("#countDownClock").text(formattedTimeUntilMonthEnd);
  }
  
setInterval(countDownClock,1);


const loadAllUsers = async () => {
    await fetch("/leaders?showAll=true")
    .then((response) => 
        response.json()
    )
    .then((data) => {
        allUsers = data;
        console.log(allUsers);
    });

}


const filterRankings = async () => {

    await loadAllUsers();

    let searchTerm = searchBar.val().toLowerCase();

    if (!searchTerm) {
        let tableBodyRows = tableBody.children();
        for (let i = 0; i < tableBodyRows.length; i++) {
            for (let j = 0; j < 3; j ++) { //3 because there are three entries per row
                tableBodyRows.eq(i).children().eq(j).remove();
            }
            $(tableBodyRows[i]).remove();
            
        }
        for (let i = 0; i < 10; i++) {
            let newRow = $("<tr>").attr("onclick", "window.location.href='profile/" + allUsers[i].id + "';"); 


            let rankCell = $("<td>");

            let rankCellDiv = $("<div>");
            rankCellDiv.attr("id", "leadersRankDiv");

            let rankCellInnerDiv = $("<div>");
            rankCellInnerDiv.attr("id", "leadersRank");

            rankCellInnerDiv.text(allUsers[i].rank + "th");
            rankCellDiv.append(rankCellInnerDiv);
            rankCell.append(rankCellDiv);
            newRow.append(rankCell);

            let topThreeMedalsDiv = $("<div>");
            if ($(window).width() < 415) {
                topThreeMedalsDiv.addClass("placePositioning");
            }
            
            if (allUsers[i].rank === 1) {
                rankCell.text("");
                let topThreeMedals = $("<img>");
                let topThreeMedalsDiv = $("<div>");
                if ($(window).width() < 415) {
                    topThreeMedalsDiv.addClass("placePositioning");
                    
                }
                topThreeMedals.attr("src", "./images/1stPlace.png");
                topThreeMedals.attr("id", "placeImage");
                topThreeMedalsDiv.append(topThreeMedals);
                rankCell.append(topThreeMedalsDiv);
            }
            if (allUsers[i].rank === 2) {
                rankCell.text("");
                let topThreeMedals = $("<img>");
                let topThreeMedalsDiv = $("<div>");
                if ($(window).width() < 415) {
                    topThreeMedalsDiv.addClass("placePositioning");
                    
                }
                topThreeMedals.attr("src", "./images/2ndPlace.png");
                topThreeMedals.attr("id", "placeImage");
                topThreeMedalsDiv.append(topThreeMedals);
                rankCell.append(topThreeMedalsDiv);
            }
            if (allUsers[i].rank === 3) {
                rankCell.text("");
                let topThreeMedals = $("<img>");
                let topThreeMedalsDiv = $("<div>");
                if ($(window).width() < 415) {
                    topThreeMedalsDiv.addClass("placePositioning");
                    
                }
                topThreeMedals.attr("src", "./images/3rdPlace.png");
                topThreeMedals.attr("id", "placeImage");
                topThreeMedalsDiv.append(topThreeMedals);
                rankCell.append(topThreeMedalsDiv);
            }

            newRow.append(rankCell);

            let nameCell = $("<td>");
            nameCell.text(allUsers[i].username);
            newRow.append(nameCell);

            let stepCountCell = $("<td>");
            stepCountCell.attr("id", "leadersSteps");
            stepCountCell.text(allUsers[i].totalSteps.toLocaleString());

            let stepsImage = $("<img>");
            stepsImage.attr("src", "/images/footsteps.png");
            stepsImage.attr("id", "steps");
            stepCountCell.append(stepsImage);

            newRow.append(stepCountCell);

            tableBody.append(newRow);
        }
    }
    else {
        console.log(searchTerm);
        allUsers.forEach((user) => {
            let username = user.username.toLowerCase();
            user.username = username;
        })
        let matchingUsers = allUsers.filter((thisUser) => thisUser.username.indexOf(searchTerm) == 0);
        console.log(matchingUsers);
        //if it does equal 0, then the string matches so far and will be added
        displayResults(matchingUsers);
    }
}

const displayResults = (matchingUsers) => {
    //all of the table rows that belong to the body
    let tableBodyRows = tableBody.children();
    for (let i = 0; i < tableBodyRows.length; i++) {
        for (let j = 0; j < 3; j ++) { //3 because there are three entries per row
            tableBodyRows.eq(i).children().eq(j).remove();
        }
        $(tableBodyRows[i]).remove();
    }

    matchingUsers.forEach((user) => {
        console.log(user);
let newRow = $("<tr>").attr("onclick", "window.location.href='profile/" + user.id + "';");
let rankCell = $("<td>");

let lastTwoDigits = user.rank % 100; // Get the last two digits of the rank

if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    rankCell.text(user.rank + "th");
} else {
    let suffix;
    switch (lastTwoDigits % 10) {
        case 1:
            suffix = "st";
            break;
        case 2:
            suffix = "nd";
            break;
        case 3:
            suffix = "rd";
            break;
        default:
            suffix = "th";
            break;
    }

    let rankCellDiv = $("<div>");
    rankCellDiv.attr("id", "leadersRankDiv");

    let rankCellInnerDiv = $("<div>");
    rankCellInnerDiv.attr("id", "leadersRank");

    rankCellInnerDiv.text(user.rank + suffix);
    rankCellDiv.append(rankCellInnerDiv);
    rankCell.append(rankCellDiv);
}

newRow.append(rankCell);

        rankCell.addClass("rankNumber");

        newRow.append(rankCell);

        let nameCell = $("<td>");
        nameCell.text(user.username);
        newRow.append(nameCell);

        let stepCountCell = $("<td>");
        stepCountCell.attr("id", "leadersSteps");
        stepCountCell.text(user.totalSteps.toLocaleString());

        let stepsImage = $("<img>");
        stepsImage.attr("src", "/images/footsteps.png");
        stepsImage.attr("id", "steps");
        stepCountCell.append(stepsImage);

        newRow.append(stepCountCell);

        tableBody.append(newRow);
    }) 
}

searchBar.on("keyup", async () => {
    await filterRankings();
});

document.getElementById('bug').style.color = 'goldenrod';

let count = 0;
const countdown = $(".ladder-title");
let linebreak;

let mediaquery = () => {
    if ($(window).width() < 590) {
        if (count === 0) {
            linebreak = $("<div>").addClass("linebreak");
            countdown.after(linebreak);
            count = 1;
        }
    } else if (count === 1) {
        linebreak.remove();
        count = 0;
    }
}

setInterval(mediaquery, 10);
