const quizData = [
  {
    question: "Webページの「構造や骨組み」を定義する言語はどれ？",
    options: ["HTML", "CSS", "JavaScript"],
    answer: 0,
    explanation: "HTMLはWebページの構造を記述するための言語です。"
  },
  {
    question: "Webページの「見た目やデザイン」を設定する言語はどれ？",
    options: ["HTML", "CSS", "JavaScript"],
    answer: 1,
    explanation: "CSSは色、配置、フォントなどのスタイルを定義します。"
  },
  {
    question: "Webページに「動的な動きや処理」を追加する言語はどれ？",
    options: ["HTML", "CSS", "JavaScript"],
    answer: 2,
    explanation: "JavaScriptを使用することで、クリック時の処理やデータのやり取りなどの動きを実装できます。"
  },
  {
    question: "プログラムの変更履歴を記録・管理するための分散型バージョン管理システムはどれ？",
    options: ["GitHub", "Git", "Cloudflare"],
    answer: 1,
    explanation: "Gitはローカルやリモートでコードの変更履歴を管理するツール本体です。"
  },
  {
    question: "Gitで管理しているコードをクラウド上で保存・共有できるプラットフォームはどれ？",
    options: ["GitHub", "VS Code", "Cloudflare Pages"],
    answer: 0,
    explanation: "GitHubはGitリポジトリをオンラインでホスティング・管理するサービスです。"
  },
  {
    question: "GitHubと連携して、静的Webサイトを高速に世界へ配信できるホスティングサービスはどれ？",
    options: ["Cloudflare Pages", "Docker", "Node.js"],
    answer: 0,
    explanation: "Cloudflare PagesはGitHubリポジトリから自動でWebサイトをデプロイ・公開できます。"
  },
  {
    question: "HTMLファイル内で外部CSSファイルを読み込む際に使うタグはどれ？",
    options: ["<script>", "<style>", "<link>"],
    answer: 2,
    explanation: "<link rel=\"stylesheet\" href=\"style.css\"> のようにして読み込みます。"
  },
  {
    question: "HTMLファイル内で外部JavaScriptファイルを読み込む際に使うタグはどれ？",
    options: ["<script>", "<js>", "<link>"],
    answer: 0,
    explanation: "<script src=\"script.js\"></script> のように指定します。"
  },
  {
    question: "ブラウザ上でエラー確認や変数の値チェック（console.logなど）を行うためのツールはどれ？",
    options: ["デベロッパーツール（開発者ツール）", "ターミナル", "Cloudflare Dashboard"],
    answer: 0,
    explanation: "ブラウザでF12キーや右クリック「検証」から開けるデベロッパーツールを使います。"
  },
  {
    question: "Webサイトのトップページとしてブラウザが自動的に参照する標準的なファイル名はどれ？",
    options: ["main.html", "index.html", "home.html"],
    answer: 1,
    explanation: "Webサーバーはデフォルトで `index.html` を一番最初に読み込みます。"
  }
];

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const explanationEl = document.getElementById("explanation");
const nextBtn = document.getElementById("next-btn");
const progressEl = document.getElementById("progress");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const scoreEl = document.getElementById("score");

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

nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    loadQuiz();
  } else {
    showResult();
  }
});

function showResult() {
  quizScreen.style.display = "none";
  resultScreen.style.display = "block";
  scoreEl.textContent = `10問中 ${score} 問正解でした！`;
}

loadQuiz();