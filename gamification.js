document.addEventListener("DOMContentLoaded", function(){
    let APIKEY = "67875f7d9e18b182ee6941f0";  //    678fbb8a58174779225315d5 67972e07f9d2bb46c9181e32
    let leaderboard = "https://tryuse-a494.restdb.io/rest/leaderboard";
    let userProfileUrl = "https://tryuse-a494.restdb.io/rest/user-profile";  //   https://fedassg2-66ea.restdb.io/rest/user-profile https://experiment-d5c7.restdb.io/rest/user-profile 

    let userID = sessionStorage.getItem("userID");
    let userName = sessionStorage.getItem("userName");

    let hiddenCoinIndex = Math.floor(Math.random() * 6);
    let attempts = 0;
    let coinsEarned = 0;

    let header = {
        "Content-Type": "application/json",
        "x-apikey": APIKEY,
        "Cache-Control": "no-cache"
    }

    let GETsettings = {
        method: "GET",
        headers: header
    }

    document.querySelectorAll(".box").forEach((box, index) => {
        box.addEventListener("click", () => checkBox(index));
    });
    document.querySelector('.restart-btn').addEventListener('click', resetGame);

    displayScoreboard();

    function checkBox(index) {
        if (attempts >= 2) return;
        
        let boxes = document.querySelectorAll('.box');
        if (index === hiddenCoinIndex) {
            boxes[index].textContent = '💰';
            coinsEarned = Math.floor(Math.random() * (10-3+1)) + 3; // Earn random coins between 3 and 10
            boxes[index].classList.add('opened', 'correct');
            document.getElementById('message').textContent = 'Congratulations! You found the coin!';
            attempts = 2; // End game immediately

            console.log(`${coinsEarned} coins earned!`);
            saveScore(coinsEarned);
            console.log(userID)
        } else {
            boxes[index].textContent = '❌';
            boxes[index].classList.add('opened', 'wrong');
            attempts++;
            if (attempts === 2) {
                document.getElementById('message').textContent = 'Game Over! Try Again.';
            }
        }
    }

    function resetGame() {
        hiddenCoinIndex = Math.floor(Math.random() * 6);
        attempts = 0;
        let boxes = document.querySelectorAll('.box');
        boxes.forEach(box => {
            box.textContent = '?';
            box.classList.remove('opened', 'correct', 'wrong');
        });
        document.getElementById('message').textContent = '';
    }

    function saveScore(coins){
        if (!userID) return;
        console.log("You won coins!")
        let userScoreUrl = `${leaderboard}?q={"user-id":"${userID}"}`;
        
        fetch(userScoreUrl, GETsettings)
          .then(response => response.json())
          .then(data => {
            if(data.length > 0){
                // User exists, update the score
                let existingScore = data[0];
                let updatedScore = existingScore["user-score"] + coins;
                console.log(updatedScore);
                let PUTsettings = {
                    method: "PUT",
                    headers: header,
                    body: JSON.stringify({"user-score": updatedScore})
                }
                fetch(`${leaderboard}/${existingScore._id}`, PUTsettings)
                  .then(() =>{
                    updateUserProfile(updatedScore);
                    displayScoreboard();
                  } );
                  
            }
            else{
                // New user
                let newUser = {
                    "user-id": userID,
                    "user-name": userName,
                    "user-score": coins
                }
                console.log(coins);
                let POSTsettings = {
                    method: "PUT",
                    headers: header,
                    body: JSON.stringify(newUser)
                }
                fetch(leaderboard, POSTsettings)
                  .then(() => {
                    updateUserProfile(coins);
                    displayScoreboard();
                  })
            }
          })
    }
    function updateUserProfile(totalCoins){
        fetch(`${userProfileUrl}?q={"user-id":"${userID}"}`, GETsettings)
          .then(response => response.json())
          .then(data => {
            let userProfile = data[0];
            let PUTsettings = {
                method: "PUT",
                headers: header,
                body: JSON.stringify({"user-coins": totalCoins})
            }
            fetch(`${userProfileUrl}/${userProfile._id}`, PUTsettings)
              .then(() => console.log(`Total coins for ${userProfile["user-username"]} is ${totalCoins}`))
          })
        
    }

    function displayScoreboard(){
        fetch(leaderboard, GETsettings)
          .then(response => response.json())
          .then(data => {
            let scoreboard = document.getElementById("scoreboard")
            scoreboard.innerHTML = "";
            data.sort((a,b) => b["user-score"] - a["user-score"])
            data.forEach((player, index) => {
                let row = 
                `<tr class="player-info">
                 <td class="no-column">${index + 1}</td>
                 <td>${player["user-name"]}</td>
                 <td>${player["user-score"]}</td>
                 </tr>`;
                 scoreboard.innerHTML += row;
            })
          })
    }
})
