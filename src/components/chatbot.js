import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import stringSimilarity from "string-similarity";
import './chatbotstyles.css';

const mlModels = {
  "Skin Cancer Diagnostic": ["skin cancer", "melanoma", "psoriasis", "skin"],
  "Skin Cancer": ["skin cancer", "melanoma", "psoriasis", "skin"],
  "Dementia Detection": ["dementia"],
  "Second Dementia Detection": ["dementia"],
  "Chronic Kidney": ["kidney", "renal", "ckd", "dialysis", "nephritis", "proteinuria", "kidney failure"],
  "Kidney Stone Diagnosis": ["kidney stone", "renal stone", "nephrolithiasis", "urolithiasis", "calcium oxalate", "uric acid stone", "bladder stone"],
  "Chronic Kidney Disease Diagnosis": ["kidney", "renal", "ckd", "dialysis", "nephritis", "proteinuria", "kidney failure"],
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
  "Cervical Cancer Prediction": ["cervical", "cervix", "dysplasia", "vaginal bleeding"],
  "Breast Disease Diagnosis": ["breast", "malignant", "benign", "mammogram", "biopsy", "lump", "mastectomy", "metastasis", "breast tissue"],
  "Breast Cancer Diagnosis": ["breast", "malignant", "benign", "mammogram", "biopsy", "lump", "mastectomy", "metastasis", "breast tissue"],
  "Breast Cancer Prediction": ["breast", "malignant", "benign", "mammogram", "biopsy", "lump", "mastectomy", "metastasis", "breast tissue"]
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
  const [chatHistory, setChatHistory] = useState([]);
  const navigate = useNavigate();
  const [promptResponse, setPromptResponse] = useState("");
  const [available, setAvailable] = useState([]);


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
      setChatHistory([...chatHistory, { text: userInput, side: "right" }, { text: `Navigating to ${userInput}...`, side: "left" }]);
      let del = await delay(2000)
      navigate(`/${TileName[userInput]}`);
    } else if (matchingModels.length > 0) {
      setUserInput("");
      // If matching models are found, suggest them
      setChatHistory([...chatHistory, { text: userInput, side: "right" }])
      const data = await getLLMResponse()
      setChatHistory([
        ...chatHistory,
        { text: userInput, side: "right" },
        { text: `${data} \n If you have the required information, these models could help you:`, options: matchingModels, side: "left" },
      ]);

    } else {
      setChatHistory([...chatHistory, { text: userInput, side: "right" }, { text: "No related models found. Try again!", side: "left" }]);
      setUserInput("");
    }
    //setPromptResponse("")
  };

  const getLLMResponse = async () => {

    const payload = {
      model: "llava",  // Change if using a different model
      prompt: `Suggest 5 types of medical data (just brief names please) used in popular ML models to diagnose ${userInput} also please do not give detailed info, just within 500 characters. Return a list of strings for the types with point numbers prepended`,
      stream: false,
    };

    try {
      const response = await fetch("http://127.0.0.1:11500/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error:", error);
      setPromptResponse("Error processing the image.");
    }

  }

  const getMedicalData = async (recordType) => {

    const delay = (delayInms) => {
      return new Promise(resolve => setTimeout(resolve, delayInms));
    };

    const payload = { patientId: 132, recordType: recordType }
    try {
      const response = await fetch("https://e-react-node-backend-22ed6864d5f3.herokuapp.com/imageRetrieveByPatientId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error");
      }

      const data = await response.json();
      if (data.success.length > 0) {
        console.log(data)
        return recordType.replace(/[^a-zA-Z0-9]/g, " ")
      }
    } catch (error) {
      console.error("Error:", error);
    }


  }

  const getAvailableMedicalData = async () => {

    const recordTypes = ["X-Ray_Skin", "X-Ray_Lung", "X-Ray_Feet", "X-Ray_Chest", "MRI_Spine",
      "MRI_Brain", "CT-Scan_Chest", "CT-Scan_Brain", "CT-Scan_Abdomen"]

    const results = await Promise.all(recordTypes.map(async (record) => await getMedicalData(record)));

    const filteredResults = results.filter((r) => (r !== undefined))
    console.log(results)
    console.log(filteredResults)
    setAvailable(filteredResults);
    setChatHistory([{ text: "Hey there! Type a disease that you want to diagnose and I shall list all the available models!" }])

  }

  const handleImageUpload = (event) => {
    return new Promise((resolve, reject) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const fullUrl = reader.result; // Full Data URL
        const base64 = reader.result.split(",")[1]; // Extract Base64 part
        resolve({ base64, fullUrl });
      };
  
      reader.onerror = (error) => reject(error);
      
      reader.readAsDataURL(file);
    });

  };

  const handleImageSubmit = async (event) => {
    
    const {base64, fullUrl} = await handleImageUpload(event)

    const payload = {
      model: "llava",  // Change if using a different model
      prompt: "What body part is this?",
      images: [base64], // Base64 image
      stream: false,
    };

    try {
      console.log(base64);
      setChatHistory([...chatHistory, {image: fullUrl, side: "right"}])
      const res = await fetch("http://127.0.0.1:11500/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log(data.response); 
      const suggestedModels = findModelsForDisease(data.response);
      setChatHistory([
        ...chatHistory,
        {image: fullUrl, side: "right"},
        { text: "Based on the image, these are the models that could help diagnose your patient: ", options: suggestedModels, side: "left" },
      ]);

    } catch (error) {
      console.error("Error:", error);
  
    }
  };



  useEffect(() => {

    getAvailableMedicalData()

  }, [])


  return available.length > 0 && (
    <div className="chat-parent">
      <h2 className="">AI Diagnosis Chatbot</h2>
      <div className="chat-container">
        {chatHistory.map((entry) => (
          <div className={entry.side === "right" ? "userBox" : "botBox"}>
            {entry.image && <img src={entry.image} alt="Uploaded Preview" style={{ width: "200px", marginTop: "10px" }} />}
            {entry.text && entry.side === "left" ? (<div>
              <strong>{entry.side === "right" ? "You: " : "Assistant: "}</strong> {"Some data you may require:"}
              <p style={{ whiteSpace: "pre-line" }}>{entry.text}</p>
              {entry.options ? entry.options.map((option) =>
              (<div><button style={{ padding: "10px" }} className="custom-button" onClick={() => navigate(`/${TileName[option]}`)}>{option}</button>
                <div style={{ padding: "5px" }}></div>
              </div>)) : <div />}
              <p>Only this patient data is currently available:</p>
              {available.map((a) => (<button style={{ padding: "10px" }} className="custom-button">{a}</button>))}
              <p>You can also upload the patient medical images and I can suggest models based on that</p>
            </div>) : <div> <strong>{entry.side === "right" ? "You: " : "Assistant: "}</strong> {entry.text} </div>}
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
        <div style={{ paddingLeft: "5px" }}></div>
        <button
          className="custom-button"
          onClick={handleInput}
        >
          Send
        </button>
      </div>
      <br></br>
      <input type="file" accept="image/*" onChange={(e) => handleImageSubmit(e)} />
    </div>
  );
}

export default Chatbot;