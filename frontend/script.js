let API_KEY = " ";
 
/* ─── OPEN & CLOSE POPUPS ─────────────────── */
function openTool(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}
 
function closeTool(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}
 
// Close on backdrop click
document.querySelectorAll('.tool-popup').forEach(popup => {
  popup.addEventListener('click', function(e) {
    if (e.target === this) closeTool(this.id);
  });
});
 
/* ─── GEMINI API CALL ─────────────────────── */
async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates[0].content.parts[0].text;
}
 
/* ─── TOAST ───────────────────────────────── */
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
 
/* ─── SUMMARIZER ──────────────────────────── */
async function runSummarizer(event) {
  const textarea = document.getElementById('summarizer-input');
  const input = textarea.value;
  if (!input.trim()) { showToast("⚠️ Please paste some notes first!"); return; }
 
  const btn = event.target;
  btn.innerText = 'Summarizing...';
  btn.disabled = true;
 
  try {
    const result = await callGemini(`Summarize this clearly for a student:\n${input}`);
    textarea.value = result;
    showToast("✨ Summary Ready!");
  } catch (err) {
    showToast("❌ Error: " + err.message);
  }
 
  btn.innerText = '✨ Summarize Notes';
  btn.disabled = false;
}
 
function copySummary() {
  const text = document.getElementById('summarizer-input').value;
  if (!text) { showToast("⚠️ Nothing to copy!"); return; }
  navigator.clipboard.writeText(text);
  showToast("📋 Summary Copied!");
}
 
function downloadSummaryPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = document.getElementById('summarizer-input').value;
  if (!text) { showToast("⚠️ Nothing to download!"); return; }
  const lines = doc.splitTextToSize(text, 180);
  doc.setFontSize(12);
  doc.text(lines, 15, 20);
  doc.save("StudyMate-Summary.pdf");
  showToast("⬇ PDF Downloaded!");
}
 
/* ─── PDF UPLOAD ──────────────────────────── */
document.getElementById('pdf-upload').addEventListener('change', async function(e) {
  const file = e.target.files[0];
  if (!file) return;
  showToast("📄 Reading PDF...");
  const fileReader = new FileReader();
  fileReader.onload = async function() {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(" ") + "\n\n";
    }
    document.getElementById('summarizer-input').value = fullText;
    showToast("✅ PDF Loaded Successfully!");
  };
  fileReader.readAsArrayBuffer(file);
});
 
/* ─── QUIZ ────────────────────────────────── */
async function runQuiz(event) {
  const topic = document.getElementById('quiz-topic').value;
  const count = document.getElementById('quiz-count').value;
  const difficulty = document.getElementById('quiz-difficulty').value;
  if (!topic.trim()) { showToast("⚠️ Please enter a topic!"); return; }
 
  const btn = event.target;
  btn.innerText = 'Generating...';
  btn.disabled = true;
 
  try {
    const result = await callGemini(
      `Create ${count} ${difficulty} level MCQs on "${topic}". Format each as:\nQ1. [Question]\nA) ...\nB) ...\nC) ...\nD) ...\n✅ Answer: [Letter]`
    );
    const quizBox = document.getElementById('quiz-result');
    quizBox.className = 'result-box visible';
    quizBox.style.display = 'block';
    quizBox.innerText = result;
    showToast("🎯 Quiz Generated!");
  } catch (err) {
    showToast("❌ Error: " + err.message);
  }
 
  btn.innerText = '🚀 Generate Quiz';
  btn.disabled = false;
}
 
/* ─── EXPLAINER ───────────────────────────── */
async function runExplainer(event) {
  const topic = document.getElementById('explainer-input').value;
  const language = document.getElementById('language-select').value;
  if (!topic.trim()) { showToast("⚠️ Please enter a topic!"); return; }
 
  const btn = event.target;
  btn.innerText = 'Explaining...';
  btn.disabled = true;
 
  try {
    const result = await callGemini(
      `Explain "${topic}" simply for a student in ${language}. Use simple analogies and examples.`
    );
    const explainBox = document.getElementById('explainer-result');
    explainBox.className = 'result-box visible';
    explainBox.style.display = 'block';
    explainBox.innerText = result;
    showToast("🧠 Explanation Ready!");
  } catch (err) {
    showToast("❌ Error: " + err.message);
  }
 
  btn.innerText = '🧠 Explain Topic';
  btn.disabled = false;
}
 
function copyExplanation() {
  const text = document.getElementById('explainer-result').innerText;
  if (!text) { showToast("⚠️ Nothing to copy!"); return; }
  navigator.clipboard.writeText(text);
  showToast("📋 Explanation Copied!");
}
 
/* ─── IMAGE SLIDER ────────────────────────── */
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;
 
function changeSlide() {
  slides[currentSlide].classList.remove('active-slide');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active-slide');
}
 
setInterval(changeSlide, 3000);
 