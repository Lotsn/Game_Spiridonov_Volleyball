var wqe = Object.entries(localStorage);
wqe = wqe
    .filter(obj => {
        try {
            const json = JSON.parse(obj[1]);
            if (json && json.countWon !== undefined) {
                return true;
            }
        } catch (err) {
            return false;
        }
    })
    .sort((a, b) => JSON.parse(b[1]).countWon - JSON.parse(a[1]).countWon)

for (let i = 1; i <= 5; i++) {
    var nicknameElement = document.getElementById(`Nick${i}`);
    var countElement = document.getElementById(`Count${i}`);
    nicknameElement.innerHTML = String(JSON.parse(wqe[i - 1][1]).Nickname);
    countElement.innerHTML = String(JSON.parse(wqe[i - 1][1]).countWon);
}
