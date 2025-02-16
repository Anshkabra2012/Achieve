// Scroll to Section
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  }
  
  // Typewriter Effect
  const typewriter = new Typewriter(document.querySelector('#typewriter'), { loop: true, delay: 70 });
  typewriter.typeString('Your AI Goal Planner')
    .pauseFor(1200)
    .deleteAll()
    .typeString('Turn Dreams Into Plans')
    .pauseFor(1200)
    .deleteAll()
    .typeString('Achieve Your Ambitions')
    .pauseFor(1200)
    .start();
  
  // API & Planner Functionality
  const API_URL = 'https://gpt-4o-mini.ai.esb.is-a.dev/v1/chat/completions';
  const API_KEY = 'gpt-4o-mini';
  
  async function callChatAPI(messages) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    };
    const body = { model: 'gpt-4o-mini', messages, stream: false };
    const response = await fetch(API_URL, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }
  
  async function generateDetailedPlan(userInput) {
    const messages = [
      { role: "system", content: "You are an AI planner. Given the following goal, generate a detailed plan with actionable steps." },
      { role: "user", content: userInput }
    ];
    return await callChatAPI(messages);
  }
  
  async function shortenPlan(detailedPlan) {
    const messages = [
      { role: "system", content: "You are an AI planner. Given the following detailed plan, shorten it to a concise version with clear, actionable steps." },
      { role: "user", content: detailedPlan }
    ];
    return await callChatAPI(messages);
  }
  
  // Generate Plan Logic
  document.getElementById('generate-btn').addEventListener('click', async () => {
    const goalInput = document.getElementById('goal-input').value.trim();
    const planBox = document.getElementById('plan-box');
    const downloadBtn = document.getElementById('download-btn');
    
    if (!goalInput) {
      alert("Please enter a goal.");
      return;
    }
    
    planBox.style.display = 'block';
    planBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating concise plan...';
    downloadBtn.style.display = 'none';
    
    try {
      const detailedPlan = await generateDetailedPlan(goalInput);
      const shortPlan = await shortenPlan(detailedPlan);
      planBox.textContent = "Final Plan:\n" + shortPlan;
      downloadBtn.style.display = 'inline-block';
    } catch (error) {
      planBox.textContent = "An error occurred: " + error.message;
    }
  });
  
  // Extra Feature: Voice Input using Web Speech API (if available)
  const voiceBtn = document.getElementById('voice-btn');
  if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    voiceBtn.addEventListener('click', () => {
      recognition.start();
    });
    
    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      const goalInput = document.getElementById('goal-input');
      goalInput.value += " " + transcript;
    };
    
    recognition.onerror = function(event) {
      alert("Voice recognition error: " + event.error);
    };
  } else {
    voiceBtn.style.display = 'none';
  }
  
  // Extra Feature: Image-Based Inspiration and Analysis
  const imageInput = document.getElementById('image-input');
  const imagePreview = document.getElementById('image-preview');
  if (imageInput) {
    imageInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Inspiration Image" style="max-width:100%; margin-top:10px; border-radius:8px;"><p style="font-size:0.9rem; margin-top:5px;">Image analyzed: This image is inspiring!</p>`;
        }
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Extra Feature: Focus Mode Toggle
  const focusToggle = document.getElementById('focus-toggle');
  focusToggle.addEventListener('click', () => {
    document.body.classList.toggle('focus-mode');
  });
  
  // Download PDF – Extract text for a cleaner layout
  async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    const planBox = document.getElementById("plan-box");
    const planText = planBox.textContent.replace("Final Plan:\n", "").trim();
  
    // Add a header with an icon
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Achieve - Your AI Goal Planner', 40, 40);
  
    // Split the plan text for readability
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 40;
    const marginRight = 40;
    const usableWidth = pageWidth - marginLeft - marginRight;
    const lines = doc.splitTextToSize(planText, usableWidth);
    
    let currentY = 70;
    lines.forEach(line => {
      doc.text(line, marginLeft, currentY);
      currentY += 16;
    });
    
    doc.save("goal_plan.pdf");
  }
  