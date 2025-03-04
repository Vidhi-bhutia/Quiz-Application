let timer;
let timeLeft;
let currentRound = 0;
let totalScore = 0;
let rounds = [];

async function loadQuestionsFromXML() {
    try {
        const response = await fetch("questions.xml");
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        const roundElements = xmlDoc.getElementsByTagName("round");

        for (let i = 0; i < roundElements.length; i++) {
            let round = roundElements[i];
            let roundData = {
                title: round.getAttribute("title"),
                time: parseInt(round.getAttribute("time")),
                maxScore: parseInt(round.getAttribute("maxScore")),
                questions: []
            };

            let questionElements = round.getElementsByTagName("question");

            for (let j = 0; j < questionElements.length; j++) {
                let question = questionElements[j];
                let questionText = question.getElementsByTagName("text")[0].textContent;
                let options = Array.from(question.getElementsByTagName("option")).map(opt => opt.textContent);
                let answer = question.getElementsByTagName("answer")[0].textContent;
                let image = question.getElementsByTagName("image").length > 0 ? question.getElementsByTagName("image")[0].textContent : null;

                roundData.questions.push({ question: questionText, options, answer, image });
            }

            rounds.push(roundData);
        }
    } catch (error) {
        console.error("Error loading XML:", error);
    }
}

async function startQuiz() {
    await loadQuestionsFromXML();
    document.getElementById("login-section").style.display = "none";
    document.getElementById("quiz-section").style.display = "block";
    startRound();
}

function validateEmail() {
    const emailInput = document.getElementById("email").value;
    if (emailInput.endsWith("@vit.ac.in")) {
        startQuiz();
    } else {
        alert("Please enter a valid VIT email ID.");
    }
}

function startRound() {
    if (currentRound >= rounds.length) {
        displayResult();
        return;
    }

    const round = rounds[currentRound];
    document.getElementById("round-title").textContent = round.title;
    document.getElementById("max-score").textContent = round.maxScore;

    let questionContainer = document.getElementById("questions");
    questionContainer.innerHTML = "";

    round.questions.forEach((q, index) => {
        let div = document.createElement("div");
        div.classList.add("col-12");
        div.innerHTML = `<div class='card'><p><strong>${index + 1}. ${q.question}</strong></p>` +
            (q.image ? `<img src='${q.image}' class='logo-img' alt='Logo Image'><br>` : "") +
            q.options.map(opt => `<label class='d-block'><input type='radio' name='q${index}' value='${opt}'> ${opt}</label>`).join('') +
            `</div>`;
        questionContainer.appendChild(div);
    });

    startTimer(round.time, document.getElementById("timer"));
}

function startTimer(duration, display) {
    timeLeft = duration;
    function updateTimer() {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        display.textContent = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitQuiz();
        }
        timeLeft--;
    }
    updateTimer();
    timer = setInterval(updateTimer, 1000);
}

function submitQuiz(event) {
    if (event) event.preventDefault();
    clearInterval(timer);

    let score = 0;
    const answers = rounds[currentRound].questions.map(q => q.answer);

    answers.forEach((ans, index) => {
        const selected = document.querySelector(`input[name='q${index}']:checked`);
        if (selected && selected.value === ans) {
            score += rounds[currentRound].maxScore / rounds[currentRound].questions.length;
        }
    });

    totalScore += score;
    currentRound++;

    if (currentRound < rounds.length) {
        startRound();
    } else {
        displayResult();
    }
}

function displayResult() {
    document.getElementById("quiz-section").style.display = "none";
    document.getElementById("result-section").style.display = "block";
    document.getElementById("final-score").textContent = totalScore.toFixed(2);

    let resultText;
    let resultColor;

    if (totalScore >= 9.5) {
        resultText = "🎉 Congrats! You are admitted to VIT Vellore Campus 🎉";
        resultColor = "green";
    } else if (totalScore >= 7.5) {
        resultText = "🎉 Congrats! You are admitted to VIT Chennai Campus 🎉";
        resultColor = "blue";
    } else if (totalScore >= 6.5) {
        resultText = "🎉 Congrats! You are admitted to VIT Amravati Campus 🎉";
        resultColor = "purple";
    } else {
        resultText = "❌ Better luck next time! You are not selected ❌";
        resultColor = "red";
    }

    let admissionResult = document.getElementById("admission-result");
    admissionResult.textContent = resultText;
    admissionResult.style.color = resultColor;
    admissionResult.style.fontSize = "2rem";
    admissionResult.style.fontWeight = "bold";
    admissionResult.style.textAlign = "center";
}

