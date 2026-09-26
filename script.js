let allQuizData = []; 
let quizData = [];    
let currentQuestion = 0;
let score = 0;

let timerId = null;
const TIME_LIMIT = 10;
let timeLeft = TIME_LIMIT;

// DOM要素
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

// 初回に全データを取得
async function fetchQuizData() {
  try {
    const response = await fetch("quiz-data.json");
    if (!response.ok) {
      throw new Error("データの取得に失敗しました");
    }
    allQuizData = await response.json();
  } catch (error) {
    console.error("エラー:", error);
    alert("問題データの読み込みに失敗しました。");
  }
}

// カテゴリ選択後にクイズを開始する関数
function startQuiz(selectedCategory) {
  let filteredData = [];

  if (selectedCategory === "all") {
    filteredData = allQuizData;
  } else {
    // 【重要】選ばれたカテゴリに一致する問題だけを抽出
    filteredData = allQuizData.filter(q => q.category === selectedCategory);
  }

  if (filteredData.length === 0) {
    alert("該当するカテゴリの問題がありません。");
    return;
  }

  // シャッフルして抽出（最大3問または5問）
  quizData = getRandomQuestions(filteredData, Math.min(filteredData.length, 5));
  
  // 画面の切り替え
  startScreen.style.display = "none";
  quizScreen.style.display = "block";

  // 変数の初期化と最初の問題読み込み
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
    if (index === current.answer) {
      button.classList.add("correct");
    }
    if (index === selectedIndex && index !== current.answer) {
      button.classList.add("wrong");
    }
  });

  if (selectedIndex === current.answer) {
    score++;
  }

  explanationEl.textContent = current.explanation;
  explanationEl.style.display = "block";
  nextBtn.style.display = "block";
}

function handleTimeOut() {
  const current = quizData[currentQuestion];
  const buttons = optionsEl.querySelectorAll(".option-btn");

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === current.answer) {
      button.classList.add("correct");
    }
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

// アプリの起動時にデータだけ先読み
fetchQuizData();