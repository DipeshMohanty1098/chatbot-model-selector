import { useState } from "react";
import { useNavigate } from "react-router-dom";
import stringSimilarity from "string-similarity";
import '../App.css';

const mlModels = {
  "Skin Cancer Diagnostic": ["skin cancer", "melanoma", "psoriasis"],
  "Skin Cancer": ["skin cancer", "melanoma", "psoriasis"],
  "Dementia Detection": ["dementia"],
  "Second Dementia Detection": ["dementia"],
  "Chronic Kidney": ["kidney", "renal", "ckd", "dialysis", "nephritis", "proteinuria", "kidney failure"],
  "Kidney Stone Diagnosis": ["kidney stone", "renal stone", "nephrolithiasis", "urolithiasis", "calcium oxalate", "uric acid stone", "bladder stone"],
  "Chronic Kidney Disease Diagnosis":["kidney", "renal", "ckd", "dialysis", "nephritis", "proteinuria", "kidney failure"],
  "Kidney Failure Predication": ["kidney", "renal", "ckd", "dialysis", "nephritis", "proteinuria", "kidney failure"],
  "Thyroid Disease Detection": ["thyroid", "hypothyroidism", "hyperthyroidism", "goiter", "hashimoto", "graves", "hormone imbalance"],
  "Thyroid Prediction": ["thyroid", "hypothyroidism", "hyperthyroidism", "goiter", "hashimoto", "graves", "hormone imbalance"],
  "Liver Disease Diagnosis": ["liver", "hepatic", "cirrhosis", "jaundice", "fatty liver", "hepatitis"],
  "Alzheimer's Disease Risk Assessment": ["brain", "memory", "dementia", "cognitive", "alzheimers", "neurodegenerative"],
  "Pulmonary Disease Detection": ["lung", "pulmonary", "respiratory"],
  "Insomnia Prediction": ["insomnia", "sleep disorder", "sleeplessness", "sleep deprivation", "sleep apnea", "restless sleep", "difficulty sleeping", "chronic insomnia"],
  "Second Brain Stroke Prediction": ["brain", "tumor", "cerebrovascular", "ischemia", "TIA", "hemorrhage", "clot", "aneurysm", "neurovascular", "artery blockage", "hypertension", "atrial fibrillation", "blood pressure", "neurological symptoms"],
  "Brain Stroke Prediction": ["brain", "tumor", "cerebrovascular", "ischemia", "TIA", "hemorrhage", "clot", "aneurysm", "neurovascular", "artery blockage", "hypertension", "atrial fibrillation", "blood pressure", "neurological symptoms"],
  "Brain Anomalies": ["brain", "tumor", "cerebrovascular", "ischemia", "TIA", "hemorrhage", "clot", "aneurysm", "neurovascular", "artery blockage", "hypertension", "atrial fibrillation", "blood pressure", "neurological symptoms"],
  "Heart Failure Prediction": ["heart", "shortness of breath", "edema", "chest pain", "coronary artery disease", "cardiomyopathy", "arrhythmia", "irregular heartbeat"],
  "Heart Stroke": ["heart", "shortness of breath", "edema", "chest pain", "coronary artery disease", "cardiomyopathy", "arrhythmia", "irregular heartbeat"],
  "Heart Diagnostic": ["heart", "shortness of breath", "edema", "chest pain", "coronary artery disease", "cardiomyopathy", "arrhythmia", "irregular heartbeat"],
  "Heart Disease(Arrhythmia)": ["heart", "shortness of breath", "edema", "chest pain", "coronary artery disease", "cardiomyopathy", "arrhythmia", "irregular heartbeat"],
  "Heart Disease(CAD) Predication": ["heart", "shortness of breath", "edema", "chest pain", "coronary artery disease", "cardiomyopathy", "arrhythmia", "irregular heartbeat"],
  "Heart Anomalies": ["heart", "shortness of breath", "edema", "chest pain", "coronary artery disease", "cardiomyopathy", "arrhythmia", "irregular heartbeat"],
  "Cervical Cancer Prediction": ["cervical","cervix", "dysplasia", "vaginal bleeding"],
  "Breast Disease Diagnosis": ["breast",  "malignant", "benign", "mammogram", "biopsy", "lump", "mastectomy", "metastasis", "breast tissue"],
  "Breast Cancer Diagnosis": ["breast",  "malignant", "benign", "mammogram", "biopsy", "lump", "mastectomy", "metastasis", "breast tissue"],
  "Breast Cancer Prediction": ["breast",  "malignant", "benign", "mammogram", "biopsy", "lump", "mastectomy", "metastasis", "breast tissue"]
};

const TileName = {
  "Skin Cancer Diagnostic": "Skincancerml",
  "Skin Cancer": "skin-cancer-upload",
  "Dementia Detection": "Dementia",
  "Second Dementia Detection": "dementiaDetection",
  "Chronic Kidney": "chronicKidney",
  "Kidney Stone Diagnosis": "kidneystoneml",
  "Chronic Kidney Disease Diagnosis": "chronickidneyml",
  "Kidney Failure Predication": "KidneyFailure",
  "Thyroid Disease Detection": "thyroidDiseaseml",
  "Thyroid Prediction": "thyroidPrediction",
  "Liver Disease Diagnosis": "liverdiseaseML",
  "Alzheimer's Disease Risk Assessment": "alzheimer",
  "Pulmonary Disease Detection": "pulmonaryDiseaseML",
  "Insomnia Predication": "insomnia",
  "Second Brain Stroke Prediction": "BrainStrokePred",
  "Brain Stroke Prediction": "brainstroke",
  "Brain Anomalies": "brainAnomalies",
  "Heart Failure Prediction": "heartfailure",
  "Heart Stroke": "heartstroke",
  "Heart Diagnostic": "Heartdiseaseml",
  "Heart Disease(Arrhythmia)": "heart-disease",
  "Heart Disease(CAD) Predication": "heartDisease",
  "Heart Anomalies": "heartAnomalies",
  "Cervical Cancer Prediction": "cervical-cancer-prediction",
  "Breast Disease Diagnosis": "BreastDisease",
  "Breast Cancer Diagnosis": "breastcancerml",
  "Breast Cancer Prediction": "breastcancerpredictionml"

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