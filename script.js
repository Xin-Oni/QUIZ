const API_URL = "https://quiz-app-api.xin0428.workers.dev"; // 作成した Workers の URL

let allQuizData = []; 
let quizData = [];    
let currentQuestion = 0;
let score = 0;
let currentUser = null; 

let timerId = null;
const TIME_LIMIT = 10;
let timeLeft = TIME_LIMIT;

// DOM要素
const authScreen = document.getElementById("auth-screen");
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const explanationEl = document.getElementById("explanation");
const nextBtn = document.getElementById("next-btn");
const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const timerEl = document.getElementById("timer");
const authMessage = document.getElementById("auth-message");
const userWelcome = document.getElementById("user-welcome");

// 新規会員登録処理（Workers API へ POST リクエスト）
async function handleRegister() {
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;

  try {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
      alert("登録が完了しました！ログインしてください。");
      authMessage.textContent = "";
    } else {
      authMessage.textContent = data.error;
    }
  } catch (err) {
    authMessage.textContent = "通信エラーが発生しました";
  }
}

// ログイン処理（Workers API へ POST リクエスト）
async function handleLogin() {
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;

  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
      currentUser = data.user;
      userWelcome.textContent = `ログイン中: ${currentUser.email}`;
      authScreen.style.display = "none";
      startScreen.style.display = "block";
    } else {
      authMessage.textContent = data.error;
    }
  } catch (err) {
    authMessage.textContent = "通信エラーが発生しました";
  }
}

// 初回データ取得
async function fetchQuizData() {
  try {
    const response = await fetch("quiz-data.json");
    if (!response.ok) throw new Error("データの取得に失敗しました");
    allQuizData = await response.json();
  } catch (error) {
    console.error("エラー:", error);
  }
}

function startQuiz(selectedCategory) {
  let filteredData = (selectedCategory === "all") 
    ? allQuizData 
    : allQuizData.filter(q => q.category === selectedCategory);

  if (filteredData.length === 0) {
    alert("該当するカテゴリの問題がありません。");
    return;
  }

  quizData = getRandomQuestions(filteredData, Math.min(filteredData.length, 5));
  startScreen.style.display = "none";
  quizScreen.style.display = "block";

  currentQuestion = 0;
  score = 0;
  loadQuiz();
}

function getRandomQuestions(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_LIMIT;
  timerEl.textContent = `残り時間: ${timeLeft}秒`;

  timerId = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `残り時間: ${timeLeft}秒`;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      handleTimeOut();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
}

function loadQuiz() {
  const current = quizData[currentQuestion];
  progressEl.textContent = `問題 ${currentQuestion + 1} / ${quizData.length}`;
  questionEl.textContent = current.question;
  optionsEl.innerHTML = "";
  explanationEl.style.display = "none";
  nextBtn.style.display = "none";

  current.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.classList.add("option-btn");
    button.textContent = option;
    button.addEventListener("click", () => selectOption(index));
    optionsEl.appendChild(button);
  });

  startTimer();
}

function selectOption(selectedIndex) {
  stopTimer();
  const current = quizData[currentQuestion];
  const buttons = optionsEl.querySelectorAll(".option-btn");

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === current.answer) button.classList.add("correct");
    if (index === selectedIndex && index !== current.answer) button.classList.add("wrong");
  });

  if (selectedIndex === current.answer) score++;

  explanationEl.textContent = current.explanation;
  explanationEl.style.display = "block";
  nextBtn.style.display = "block";
}

function handleTimeOut() {
  const current = quizData[currentQuestion];
  const buttons = optionsEl.querySelectorAll(".option-btn");

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === current.answer) button.classList.add("correct");
  });

  explanationEl.textContent = `⏰ タイムオーバー！ ${current.explanation}`;
  explanationEl.style.display = "block";
  nextBtn.style.display = "block";
}

nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    loadQuiz();
  } else {
    showResult();
  }
});

function showResult() {
  stopTimer();
  quizScreen.style.display = "none";
  resultScreen.style.display = "block";
  scoreEl.textContent = `${quizData.length}問中 ${score} 問正解でした！`;

  const savedHighScore = localStorage.getItem("quizHighScore") || 0;

  if (score > Number(savedHighScore)) {
    localStorage.setItem("quizHighScore", score);
    highScoreEl.textContent = `🎉 最高記録更新！ 最高スコア: ${score} / ${quizData.length}`;
  } else {
    highScoreEl.textContent = `最高スコア: ${savedHighScore} / ${quizData.length}`;
  }
}

fetchQuizData();
