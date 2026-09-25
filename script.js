let allQuizData = []; // 全20問を保持する配列
let quizData = [];    // ランダム選出された5問を保持する配列
let currentQuestion = 0;
let score = 0;

// DOM要素の取得
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const explanationEl = document.getElementById("explanation");
const nextBtn = document.getElementById("next-btn");
const progressEl = document.getElementById("progress");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");

// JSONファイルから問題データを取得し、ランダムに5問抽出する関数
async function fetchQuizData() {
  try {
    const response = await fetch("quiz-data.json");
    if (!response.ok) {
      throw new Error("データの取得に失敗しました");
    }
    allQuizData = await response.json();

    // 配列をシャッフルして先頭5問を抽出
    quizData = getRandomQuestions(allQuizData, 5);

    loadQuiz();
  } catch (error) {
    console.error("エラー:", error);
    questionEl.textContent = "問題データの読み込みに失敗しました。";
  }
}

// 配列をシャッフルして指定した個数を取得するユーティリティ関数
function getRandomQuestions(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 1問分の問題・選択肢を表示
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
}

// 選択肢をクリックした際の正誤判定処理
function selectOption(selectedIndex) {
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

// 「次の問題へ」ボタンのイベント
nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    loadQuiz();
  } else {
    showResult();
  }
});

// 結果画面の表示
function showResult() {
  quizScreen.style.display = "none";
  resultScreen.style.display = "block";
  scoreEl.textContent = `${quizData.length}問中 ${score} 問正解でした！`;

  // 1. 保存されている最高スコアを取得（まだ無ければ 0 とする）
  const savedHighScore = localStorage.getItem("quizHighScore") || 0;

  // 2. 今回のスコアが最高スコアを超えていたら更新して保存
  if (score > Number(savedHighScore)) {
    localStorage.setItem("quizHighScore", score);
    highScoreEl.textContent = `🎉 最高記録更新！ 最高スコア: ${score} / ${quizData.length}`;
  } else {
    highScoreEl.textContent = `最高スコア: ${savedHighScore} / ${quizData.length}`;
  }
}

// アプリの初期化実行
fetchQuizData();