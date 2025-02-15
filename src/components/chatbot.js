import { useState } from "react";
import { useNavigate } from "react-router-dom";
import stringSimilarity from "string-similarity";
import '../App.css';

const mlModels = {
  "Skin Cancer Diagnostic": ["skin cancer", "melanoma", "psoriasis"],
  "Skin Cancer": ["skin cancer", "melanoma", "psoriasis"],
  "Dementia Detection": ["dementia"],
  "Second Dementia Detection": ["dementia"]
};

const TileName = {
  "Skin Cancer Diagnostic": "Skincancerml",
  "Skin Cancer": "skin-cancer-upload",
  "Dementia Detection": "Dementia",
  "Second Dementia Detection": "dementiaDetection"
}

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([{text: "Hey there! Type a disease that you want to diagnose and I shall list all the available models!"}]);
  const navigate = useNavigate();


  const extractDiseaseKeywords = (input) => {
    const diseaseKeywords = new Set();
    for (const model in mlModels) {
      mlModels[model].forEach((disease) => {
        if (input.toLowerCase().includes(disease)) {
          diseaseKeywords.add(disease);
        }
      });
    }
    return Array.from(diseaseKeywords);
  };

  const findModelsForDisease = (input) => {
    const keywords = extractDiseaseKeywords(input);
    if (keywords.length === 0) return [];

    const matchingModels = [];
    for (const [model, diseases] of Object.entries(mlModels)) {
      if (diseases.some((disease) => keywords.includes(disease))) {
        matchingModels.push(model);
      }
    }
    return matchingModels;
  };


  const handleInput = async () => {
    const input = userInput.toLowerCase();
    const matchingModels = findModelsForDisease(input);

    const delay = (delayInms) => {
      return new Promise(resolve => setTimeout(resolve, delayInms));
    };

    if (mlModels[userInput]) {
      // If the input matches a model, navigate directly
      setChatHistory([...chatHistory, { text: userInput, side: "right"}, { text: `Navigating to ${userInput}...`, side: "left" }]);
      let del = await delay(2000)
      navigate(`/${TileName[userInput]}`);
    } else if (matchingModels.length > 0) {
      // If matching models are found, suggest them
      setChatHistory([
        ...chatHistory,
        { text: userInput, side: "right" } , {text: `Models related to your search: ${matchingModels.join(", ")}`, side: "left" },
      ]);
    } else {
      setChatHistory([...chatHistory, { text: userInput, side: "right" }, { text: "No related models found. Try again!", side: "left" }]);
    }
    setUserInput("");
  };


  return (
    <div className="chat-parent">
      <h2 className="">AI Diagnosis Chatbot</h2>
      <div className="chat-container">
        {chatHistory.map((entry) => (
            <div className={entry.side === "right" ? "userBox" : "botBox"}>
              <strong>{entry.side === "right" ? "You: " : "Assistant: "}</strong> {entry.text}
            </div>
        ))}
      </div>
      <br></br>
      <div className="input-box">
        <input
          type="text"
          className="custom-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about a disease..."
        />
        <div style={{paddingLeft: "5px"}}></div>
        <button
          className="custom-button"
          onClick={handleInput}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;