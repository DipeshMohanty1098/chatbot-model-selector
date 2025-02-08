import { useState } from "react";
import { useNavigate } from "react-router-dom";
import stringSimilarity from "string-similarity";

const mlModels = {
  "Skin Cancer Diagnostic": ["skin cancer", "melanoma", "psoriasis"],
  "Skin Cancer": ["skin cancer", "melanoma", "psoriasis"],
  "Dementia Detection": ["dementia"],
  "Second Dementia Detection": ["dementia"]
};

const TileName = {
    "Skin Cancer Diagnostic": "Skincancerml",
    "Skin Cancer" : "skin-cancer-upload",
    "Dementia Detection" : "Dementia",
    "Second Dementia Detection" : "dementiaDetection"  
}

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
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
        setChatHistory([...chatHistory, { user: userInput, bot: `Navigating to ${userInput}...` }]);
        let del = await delay(2000)
        navigate(`/${TileName[userInput]}`);
    } else if (matchingModels.length > 0) {
        // If matching models are found, suggest them
        setChatHistory([
        ...chatHistory,
        { user: userInput, bot: `Models related to your search: ${matchingModels.join(", ")}` },
        ]);
    } else {
        setChatHistory([...chatHistory, { user: userInput, bot: "No related models found. Try again!" }]);
    }
    setUserInput("");
    };

    return (
        <div className="p-4 border rounded shadow-lg max-w-md mx-auto">
          <h2 className="text-lg font-bold mb-2">Chatbot</h2>
          <div className="mb-2 h-40 overflow-y-auto border p-2">
            {chatHistory.map((entry, index) => (
              <div key={index}>
                <p><strong>You:</strong> {entry.user}</p>
                <p><strong>Bot:</strong> {entry.bot}</p>
              </div>
            ))}
          </div>
          <input
            type="text"
            className="border p-2 w-full"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask me about disease detection models..."
          />
          <button className="mt-2 bg-blue-500 text-white p-2 rounded w-full" onClick={handleInput}>
            Submit
          </button>
        </div>
      );
    }

export default Chatbot;