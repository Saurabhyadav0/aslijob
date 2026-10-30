export type Language = "en" | "hi" | "mr" | "ta" | "te" | "kn" | "bn" | "gu";

export const SUPPORTED_LANGUAGES: Array<{ code: Language; name: string; nativeName: string }> = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
];

export const translations = {
  en: {
    title: "Got a job offer? Check it before you pay.",
    subtitle: "Paste the message, upload a screenshot or check a number/UPI. Get Safe / Suspicious / Scam in seconds.",
    bannerCount: "1,840 offers checked today",
    bannerAlert: "Alert: Telegram task scams asking for fee deposit",
    tabPaste: "Paste Message",
    tabUpload: "Upload Screenshot",
    tabDirect: "Check Number / UPI",
    tabVerify: "Verify Letter",
    placeholderPaste: "Paste a WhatsApp/Telegram job message, email, or offer text...",
    placeholderDirect: "Enter 10-digit mobile number (e.g. 9876543210) or UPI ID...",
    btnCheck: "Check this offer",
    btnChecking: "Checking signals...",
    btnUpload: "Select Image or PDF",
    btnShare: "Share Warning Card",
    btnReport: "Report this Scam",
    btnCheckAnother: "Check another offer",
    btnCopy1930: "Copy 1930 Complaint",
    btnCall1930: "Call 1930 Helpline",
    copied: "Copied to clipboard!",
    step1: "Extracting contact identifiers & salary claims...",
    step2: "Cross-referencing 2-hop fraud graph...",
    step3: "Validating against official employer registries...",
    step4: "Computing confidence & plain-language verdict...",
    verdictSafe: "Safe",
    verdictSuspicious: "Suspicious",
    verdictScam: "Scam",
    reasonsTitle: "Reasons & Red Flags",
    networkTitle: "Fraud Network Correlation",
    networkLinked: (reports: number, cities: number) =>
      `Connected to ${reports} scam report${reports === 1 ? "" : "s"} across ${cities} cit${cities === 1 ? "y" : "ies"}.`,
    reportTitle: "Report Scam to 1930 Portal",
    reportSubtitle: "Your report immediately flags this fraudster in the network and warns other job seekers.",
    reportTypeLabel: "Scam Type",
    amountLostLabel: "Money Lost (Rs, optional)",
    reportSubmit: "Submit Report & Generate 1930 Complaint",
    reportSuccess: "Report Recorded & Network Updated",
    letterVerifyTitle: "Verify Company Offer Letter",
    letterVerifySubtitle: "Enter the Offer Letter ID or scan QR code to check onchain Base Sepolia attestation.",
    letterPlaceholder: "e.g. TCS-2026-ENG-089",
    letterBtn: "Verify Letter",
    letterValid: "Verified by the company",
    letterInvalid: "Not issued by this company / Tampered",
    micBtn: "Voice Input",
    micListening: "Listening... speak now",
    micUnsupported: "Voice input is not supported in this browser.",
    speakVerdict: "Listen to Verdict",
    speaking: "Speaking...",
    stopSpeaking: "Stop Audio",
  },
  hi: {
    title: "नौकरी का ऑफर मिला? पैसे देने से पहले जांचें।",
    subtitle: "संदेश पेस्ट करें, स्क्रीनशॉट अपलोड करें या UPI ID जांचें। कुछ ही सेकंड में सुरक्षित / संदिग्ध / घोटाला जानें।",
    bannerCount: "आज 1,840 जॉब ऑफर की जांच की गई",
    bannerAlert: "अलर्ट: टेलीग्राम टास्क घोटाले में रजिस्ट्रेशन फीस मांगी जा रही है",
    tabPaste: "संदेश पेस्ट करें",
    tabUpload: "स्क्रीनशॉट अपलोड",
    tabDirect: "नंबर / UPI जांचें",
    tabVerify: "लेटर सत्यापित करें",
    placeholderPaste: "व्हाट्सएप/टेलीग्राम जॉब संदेश, ईमेल या ऑफर लेटर पेस्ट करें...",
    placeholderDirect: "10 अंकों का मोबाइल नंबर (जैसे 9876543210) या UPI ID दर्ज करें...",
    btnCheck: "इस ऑफर की जांच करें",
    btnChecking: "सिग्नल जांचे जा रहे हैं...",
    btnUpload: "छवि या PDF चुनें",
    btnShare: "चेतावनी कार्ड शेयर करें",
    btnReport: "इस घोटाले की रिपोर्ट करें",
    btnCheckAnother: "अन्य ऑफर की जांच करें",
    btnCopy1930: "1930 शिकायत कॉपी करें",
    btnCall1930: "1930 हेल्पलाइन पर कॉल करें",
    copied: "क्लिपबोर्ड पर कॉपी किया गया!",
    step1: "संपर्क पहचानकर्ता और वेतन दावों का विश्लेषण...",
    step2: "फ्रॉड नेटवर्क ग्राफ से मिलान किया जा रहा है...",
    step3: "आधिकारिक कंपनी रिकॉर्ड से सत्यापन...",
    step4: "विश्वास स्कोर और सरल निष्कर्ष निकाला जा रहा है...",
    verdictSafe: "सुरक्षित",
    verdictSuspicious: "संदिग्ध",
    verdictScam: "घोटाला",
    reasonsTitle: "कारण और खतरे के संकेत",
    networkTitle: "धोखाधड़ी नेटवर्क संबंध",
    networkLinked: (reports: number, cities: number) =>
      `${cities} शहरों में ${reports} धोखाधड़ी रिपोर्ट से जुड़ा हुआ है।`,
    reportTitle: "1930 पोर्टल पर घोटाले की शिकायत करें",
    reportSubtitle: "आपकी रिपोर्ट नेटवर्क में इस धोखेबाज को तुरंत चिह्नित करती है।",
    reportTypeLabel: "घोटाले का प्रकार",
    amountLostLabel: "गंवाई गई राशि (रु, ऐच्छिक)",
    reportSubmit: "रिपोर्ट सबमिट करें और 1930 शिकायत बनाएं",
    reportSuccess: "रिपोर्ट दर्ज की गई और नेटवर्क अपडेट हुआ",
    letterVerifyTitle: "कंपनी ऑफर लेटर सत्यापित करें",
    letterVerifySubtitle: "ऑफर लेटर ID दर्ज करें या ऑनचेन अटेस्टेशन देखने के लिए QR कोड स्कैन करें।",
    letterPlaceholder: "उदा. TCS-2026-ENG-089",
    letterBtn: "लेटर जांचें",
    letterValid: "कंपनी द्वारा सत्यापित",
    letterInvalid: "कंपनी द्वारा जारी नहीं किया गया / छेड़छाड़ की गई",
    micBtn: "आवाज से इनपुट दें",
    micListening: "सुन रहे हैं... बोलिए",
    micUnsupported: "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।",
    speakVerdict: "निष्कर्ष सुनें",
    speaking: "बोल रहे हैं...",
    stopSpeaking: "आवाज रोकें",
  },
  mr: {
    title: "नोकरीची ऑफर मिळाली? पैसे देण्यापूर्वी तपासा.",
    subtitle: "मेसेज पेस्ट करा, स्क्रीनशॉट अपलोड करा किंवा नंबर/UPI तपासा. काही सेकंदात सुरक्षित / संशयास्पद / फसवणूक ओळखा.",
    bannerCount: "आज 1,840 ऑफर्स तपासल्या गेल्या",
    bannerAlert: "अलर्ट: टेलिग्राम टास्क घोटाळ्यात फी मागितली जात आहे",
    tabPaste: "मेसेज पेस्ट करा",
    tabUpload: "स्क्रीनशॉट अपलोड",
    tabDirect: "नंबर / UPI तपासा",
    tabVerify: "लेटर तपासा",
    placeholderPaste: "व्हॉट्सॲप/टेलिग्राम जॉब मेसेज किंवा ईमेल पेस्ट करा...",
    placeholderDirect: "१० अंकी मोबाइल नंबर किंवा UPI ID प्रविष्ट करा...",
    btnCheck: "ऑफर तपासा",
    btnChecking: "तपासणी सुरू आहे...",
    btnUpload: "फोटो किंवा PDF निवडा",
    btnShare: "वॉर्निंग कार्ड शेअर करा",
    btnReport: "तक्रार नोंदवा",
    btnCheckAnother: "दुसरी ऑफर तपासा",
    btnCopy1930: "1930 तक्रार कॉपी करा",
    btnCall1930: "1930 हेल्पलाइनला कॉल करा",
    copied: "कॉपी केले!",
    step1: "संपर्क आणि पगार विश्लेषित करत आहोत...",
    step2: "फ्रॉड नेटवर्कशी पडताळणी करत आहोत...",
    step3: "अधिकृत कंपनी नोंदी तपासत आहोत...",
    step4: "अंतिम निष्कर्ष काढत आहोत...",
    verdictSafe: "सुरक्षित",
    verdictSuspicious: "संशयास्पद",
    verdictScam: "फसवणूक",
    reasonsTitle: "कारणे आणि धोक्याचे इशारे",
    networkTitle: "फसवणूक नेटवर्क संबंध",
    networkLinked: (reports: number, cities: number) =>
      `${cities} शहरांमधील ${reports} फसवणूक तक्रारींशी जोडलेले आहे.`,
    reportTitle: "1930 सायबर सेलकडे तक्रार करा",
    reportSubtitle: "तुमच्या तक्रारीमुळे इतर नोकरी शोधणारे सतर्क राहतील.",
    reportTypeLabel: "घोटाळ्याचा प्रकार",
    amountLostLabel: "गमावलेली रक्कम (रु, ऐच्छिक)",
    reportSubmit: "तक्रार नोंदवा आणि 1930 मजकूर मिळवा",
    reportSuccess: "नोंद झाली आणि नेटवर्क अपडेट झाले",
    letterVerifyTitle: "कंपनी ऑफर लेटर तपासा",
    letterVerifySubtitle: "ऑफर लेटर ID टाका किंवा QR कोड स्कॅन करा.",
    letterPlaceholder: "उदा. TCS-2026-ENG-089",
    letterBtn: "पडताळणी करा",
    letterValid: "कंपनीद्वारे प्रमाणित",
    letterInvalid: "कंपनीने जारी केलेले नाही / बदल केलेले",
    micBtn: "आवाजाने इनपुट द्या",
    micListening: "ऐकत आहोत... बोला",
    micUnsupported: "या ब्राउझरमध्ये व्हॉइस इनपुट समर्थित नाही.",
    speakVerdict: "निष्कर्ष ऐका",
    speaking: "बोलत आहोत...",
    stopSpeaking: "आवाज थांबवा",
  },
  ta: {
    title: "வேலை வாய்ப்பு வந்ததா? பணம் செலுத்தும் முன் சரிபார்க்கவும்.",
    subtitle: "செய்தியை ஒட்டவும், ஸ்கிரீன்ஷாட் பதிவேற்றவும் அல்லது UPI சரிபார்க்கவும். நொடிகளில் பாதுகாப்பானது / சந்தேகத்திற்கிடமானது / மோசடி என அறியவும்.",
    bannerCount: "இன்று 1,840 சலுகைகள் சரிபார்க்கப்பட்டன",
    bannerAlert: "எச்சரிக்கை: டெலிகிராம் பணி மோசடியில் முன்பணம் கோரப்படுகிறது",
    tabPaste: "செய்தி ஒட்டுக",
    tabUpload: "ஸ்கிரீன்ஷாட்",
    tabDirect: "எண் / UPI சரிபார்",
    tabVerify: "கடிதம் சரிபார்",
    placeholderPaste: "வாட்ஸ்அப்/டெலிகிராம் வேலை செய்தி அல்லது மின்னஞ்சலை ஒட்டவும்...",
    placeholderDirect: "10 இலக்க மொபைல் எண் அல்லது UPI ஐடியை உள்ளிடவும்...",
    btnCheck: "இச்சலுகையை சரிபார்க்கவும்",
    btnChecking: "சரிபார்க்கப்படுகிறது...",
    btnUpload: "படம் அல்லது PDF தேர்வு செய்க",
    btnShare: "எச்சரிக்கை அட்டையைப் பகிரவும்",
    btnReport: "இம்மோசடியைப் புகாரளிக்கவும்",
    btnCheckAnother: "மற்றொரு சலுகையை சரிபார்க்கவும்",
    btnCopy1930: "1930 புகாரை நகலெடுக்கவும்",
    btnCall1930: "1930 உதவி எண்ணை அழைக்கவும்",
    copied: "நகலெடுக்கப்பட்டது!",
    step1: "தொடர்பு அடையாளங்காட்டிகளை பிரித்தெடுக்கிறது...",
    step2: "மோசடி வரைபடத்துடன் ஒப்பிடுகிறது...",
    step3: "நிறுவன பதிவேடுகளுடன் சரிபார்க்கிறது...",
    step4: "இறுதி முடிவை கணக்கிடுகிறது...",
    verdictSafe: "பாதுகாப்பானது",
    verdictSuspicious: "சந்தேகத்திற்குரியது",
    verdictScam: "மோசடி",
    reasonsTitle: "காரணங்கள் மற்றும் எச்சரிக்கை அறிகுறிகள்",
    networkTitle: "மோசடி பிணைய தொடர்பு",
    networkLinked: (reports: number, cities: number) =>
      `${cities} நகரங்களில் ${reports} மோசடி புகார்களுடன் இணைக்கப்பட்டுள்ளது.`,
    reportTitle: "1930 இணையதளத்தில் புகார் அளிக்கவும்",
    reportSubtitle: "உங்கள் புகார் மற்ற வேலை தேடுபவர்களை எச்சரிக்கும்.",
    reportTypeLabel: "மோசடி வகை",
    amountLostLabel: "இழந்த பணம் (ரூ, விருப்பத்தேர்வு)",
    reportSubmit: "புகாரை சமர்ப்பித்து 1930 வரைவை பெறவும்",
    reportSuccess: "புகார் பதிவு செய்யப்பட்டு நெட்வொர்க் புதுப்பிக்கப்பட்டது",
    letterVerifyTitle: "நிறுவன வேலை வாய்ப்புக் கடிதத்தை சரிபார்க்கவும்",
    letterVerifySubtitle: "கடித ஐடியை உள்ளிடவும் அல்லது QR குறியீட்டை ஸ்கேன் செய்யவும்.",
    letterPlaceholder: "எ.கா. TCS-2026-ENG-089",
    letterBtn: "கடிதத்தை சரிபார்",
    letterValid: "நிறுவனத்தால் சரிபார்க்கப்பட்டது",
    letterInvalid: "நிறுவனத்தால் வழங்கப்படவில்லை / மாற்றப்பட்டது",
    micBtn: "குரல் உள்ளீடு",
    micListening: "கேட்கிறது... பேசுங்கள்",
    micUnsupported: "இந்த உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.",
    speakVerdict: "முடிவைக் கேளுங்கள்",
    speaking: "பேசுகிறது...",
    stopSpeaking: "ஆடியோவை நிறுத்துங்கள்",
  },
  te: {
    title: "ఉద్యోగ ఆఫర్ వచ్చిందా? డబ్బు చెల్లించే ముందు తనిఖీ చేయండి.",
    subtitle: "సందేశాన్ని అతికించండి, స్క్రీన్‌షాట్ అప్‌లోడ్ చేయండి లేదా UPI తనిఖీ చేయండి. క్షణాల్లో సురక్షితం / అనుమానాస్పదం / మోసం తెలుసుకోండి.",
    bannerCount: "ఈ రోజు 1,840 ఆఫర్‌లు తనిఖీ చేయబడ్డాయి",
    bannerAlert: "హెచ్చరిక: టెలిగ్రామ్ టాస్క్ మోసాలలో రిజిస్ట్రేషన్ ఫీజు డిమాండ్ చేస్తున్నారు",
    tabPaste: "సందేశం అతికించు",
    tabUpload: "స్క్రీన్‌షాట్",
    tabDirect: "నంబర్ / UPI తనిఖీ",
    tabVerify: "లెటర్ సరిచూడు",
    placeholderPaste: "వాట్సాప్/టెలిగ్రామ్ ఉద్యోగ సందేశం లేదా ఈమెయిల్‌ను అతికించండి...",
    placeholderDirect: "10 అంకెల మొబైల్ నంబర్ లేదా UPI IDని నమోదు చేయండి...",
    btnCheck: "ఆఫర్‌ను తనిఖీ చేయండి",
    btnChecking: "పరిశీలిస్తున్నాము...",
    btnUpload: "చిత్రం లేదా PDF ఎంచుకోండి",
    btnShare: "హెచ్చరిక కార్డు షేర్ చేయండి",
    btnReport: "మోసాన్ని నివేదించండి",
    btnCheckAnother: "మరొక ఆఫర్‌ను తనిఖీ చేయండి",
    btnCopy1930: "1930 ఫిర్యాదును కాపీ చేయండి",
    btnCall1930: "1930 హెల్ప్‌లైన్‌కు కాల్ చేయండి",
    copied: "కాపీ చేయబడింది!",
    step1: "సంప్రదింపు వివరాల విశ్లేషణ...",
    step2: "ఫ్రాడ్ నెట్‌వర్క్‌తో సరిపోల్చడం...",
    step3: "సంస్థ రికార్డులతో ధృవీకరణ...",
    step4: "తుది ఫలితాన్ని లెక్కిస్తున్నాము...",
    verdictSafe: "సురక్షితం",
    verdictSuspicious: "అనుమానాస్పదం",
    verdictScam: "మోసం",
    reasonsTitle: "కారణాలు మరియు ప్రమాద సూచికలు",
    networkTitle: "మోసపూరిత నెట్‌వర్క్ సంబంధం",
    networkLinked: (reports: number, cities: number) =>
      `${cities} నగరాల్లోని ${reports} మోసపూరిత రిపోర్ట్‌లతో అనుసంధానించబడింది.`,
    reportTitle: "1930 పోర్టల్‌లో ఫిర్యాదు చేయండి",
    reportSubtitle: "మీ రిపోర్ట్ ఇతర ఉద్యోగార్ధులను వెంటనే హెచ్చరిస్తుంది.",
    reportTypeLabel: "మోసం రకం",
    amountLostLabel: "నష్టపోయిన మొత్తం (రూ, ఐచ్ఛికం)",
    reportSubmit: "రిపోర్ట్ సమర్పించి 1930 ఫిర్యాదు పొందండి",
    reportSuccess: "రిపోర్ట్ రికార్డ్ చేయబడింది మరియు నెట్‌వర్క్ నవీకరించబడింది",
    letterVerifyTitle: "కంపెనీ ఆఫర్ లెటర్‌ను ధృవీకరించండి",
    letterVerifySubtitle: "లెటర్ ID నమోదు చేయండి లేదా QR కోడ్‌ను స్కాన్ చేయండి.",
    letterPlaceholder: "ఉదా. TCS-2026-ENG-089",
    letterBtn: "లెటర్‌ను తనిఖీ చేయండి",
    letterValid: "కంపెనీ ద్వారా ధృవీకరించబడింది",
    letterInvalid: "కంపెనీ ద్వారా జారీ చేయబడలేదు / మార్చబడింది",
    micBtn: "వాయిస్ ఇన్‌పుట్",
    micListening: "వింటున్నాము... మాట్లాడండి",
    micUnsupported: "ఈ బ్రౌజర్‌లో వాయిస్ ఇన్‌పుట్ సపోర్ట్ చేయదు.",
    speakVerdict: "తీర్పు వినండి",
    speaking: "మాట్లాడుతున్నాము...",
    stopSpeaking: "ఆడియో ఆపండి",
  },
  kn: {
    title: "ಉದ್ಯೋಗದ ಆಫರ್ ಬಂದಿದೆಯೇ? ಹಣ ಪಾವತಿಸುವ ಮುನ್ನ ಪರಿಶೀಲಿಸಿ.",
    subtitle: "ಸಂದೇಶವನ್ನು ಪೇಸ್ಟ್ ಮಾಡಿ, ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ UPI ಪರಿಶೀಲಿಸಿ. ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಸುರಕ್ಷಿತ / ಅನುಮಾನಾಸ್ಪದ / ವಂಚನೆ ತಿಳಿಯಿರಿ.",
    bannerCount: "ಇಂದು 1,840 ಉದ್ಯೋಗ ಆಫರ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    bannerAlert: "ಎಚ್ಚರಿಕೆ: ಟೆಲಿಗ್ರಾಂ ಟಾಸ್ಕ್ ಹಗರಣಗಳಲ್ಲಿ ಠೇವಣಿ ಶುಲ್ಕ ಕೇಳಲಾಗುತ್ತಿದೆ",
    tabPaste: "ಸಂದೇಶ ಪೇಸ್ಟ್ ಮಾಡಿ",
    tabUpload: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್",
    tabDirect: "ಸಂಖ್ಯೆ / UPI ಪರಿಶೀಲಿಸಿ",
    tabVerify: "ಲೆಟರ್ ಪರಿಶೀಲಿಸಿ",
    placeholderPaste: "ವಾಟ್ಸಾಪ್/ಟೆಲಿಗ್ರಾಂ ಸಂದೇಶ ಅಥವಾ ಇಮೇಲ್ ಪೇಸ್ಟ್ ಮಾಡಿ...",
    placeholderDirect: "10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ UPI ID ನಮೂದಿಸಿ...",
    btnCheck: "ಆಫರ್ ಪರಿಶೀಲಿಸಿ",
    btnChecking: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    btnUpload: "ಚಿತ್ರ ಅಥವಾ PDF ಆಯ್ಕೆಮಾಡಿ",
    btnShare: "ಎಚ್ಚರಿಕೆ ಕಾರ್ಡ್ ಹಂಚಿಕೊಳ್ಳಿ",
    btnReport: "ವಂಚನೆ ವರದಿ ಮಾಡಿ",
    btnCheckAnother: "ಇನ್ನೊಂದು ಆಫರ್ ಪರಿಶೀಲಿಸಿ",
    btnCopy1930: "1930 ದೂರು ನಕಲಿಸಿ",
    btnCall1930: "1930 ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ",
    copied: "ನಕಲಿಸಲಾಗಿದೆ!",
    step1: "ಸಂಪರ್ಕ ವಿವರಗಳ ಪರಿಶೀಲನೆ...",
    step2: "ವಂಚನೆ ಜಾಲದೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆ...",
    step3: "ಕಂಪನಿಯ ದಾಖಲೆಗಳೊಂದಿಗೆ ಪರಿಶೀಲನೆ...",
    step4: "ಅಂತಿಮ ಫಲಿತಾಂಶ ಲೆಕ್ಕಾಚಾರ...",
    verdictSafe: "ಸುರಕ್ಷಿತ",
    verdictSuspicious: "ಅನುಮಾನಾಸ್ಪದ",
    verdictScam: "ವಂಚನೆ",
    reasonsTitle: "ಕಾರಣಗಳು ಮತ್ತು ಅಪಾಯದ ಚಿಹ್ನೆಗಳು",
    networkTitle: "ವಂಚನೆ ನೆಟ್‌ವರ್ಕ್ ಸಂಬಂಧ",
    networkLinked: (reports: number, cities: number) =>
      `${cities} ನಗರಗಳಲ್ಲಿನ ${reports} ವಂಚನೆ ಪ್ರಕರಣಗಳಿಗೆ ಸಂಬಂಧಿಸಿದೆ.`,
    reportTitle: "1930 ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ದೂರು ನೀಡಿ",
    reportSubtitle: "ನಿಮ್ಮ ವರದಿಯು ಇತರ ಉದ್ಯೋಗಾಕಾಂಕ್ಷಿಗಳನ್ನು ಎಚ್ಚರಿಸುತ್ತದೆ.",
    reportTypeLabel: "ವಂಚನೆಯ ಪ್ರಕಾರ",
    amountLostLabel: "ಕಳೆದುಕೊಂಡ ಹಣ (ರೂ, ಐಚ್ಛಿಕ)",
    reportSubmit: "ವರದಿ ಸಲ್ಲಿಸಿ ಮತ್ತು 1930 ದೂರು ರಚಿಸಿ",
    reportSuccess: "ವರದಿ ದಾಖಲಾಗಿದೆ ಮತ್ತು ನೆಟ್‌ವರ್ಕ್ ನವೀಕರಿಸಲಾಗಿದೆ",
    letterVerifyTitle: "ಕಂಪನಿಯ ಆಫರ್ ಲೆಟರ್ ಪರಿಶೀಲಿಸಿ",
    letterVerifySubtitle: "ಲೆಟರ್ ID ನಮೂದಿಸಿ ಅಥವಾ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    letterPlaceholder: "ಉದಾ. TCS-2026-ENG-089",
    letterBtn: "ಲೆಟರ್ ಪರಿಶೀಲಿಸಿ",
    letterValid: "ಕಂಪನಿಯಿಂದ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ",
    letterInvalid: "ಕಂಪನಿಯಿಂದ ನೀಡಲಾಗಿಲ್ಲ / ತಿದ್ದಲಾಗಿದೆ",
    micBtn: "ಧ್ವನಿ ಇನ್‌ಪುಟ್",
    micListening: "ಆಲಿಸುತ್ತಿದೆ... ಮಾತನಾಡಿ",
    micUnsupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
    speakVerdict: "ತೀರ್ಪು ಆಲಿಸಿ",
    speaking: "ಮಾತನಾಡುತ್ತಿದೆ...",
    stopSpeaking: "ಆಡಿಯೋ ನಿಲ್ಲಿಸಿ",
  },
  bn: {
    title: "চাকরির প্রস্তাব পেয়েছেন? টাকা দেওয়ার আগে যাচাই করুন।",
    subtitle: "মেসেজ পেস্ট করুন, স্ক্রিনশট আপলোড করুন বা UPI যাচাই করুন। কয়েক সেকেন্ডেই নিরাপদ / সন্দেহজনক / প্রতারণা জানুন।",
    bannerCount: "আজ ১,৮৪০টি চাকরির প্রস্তাব যাচাই করা হয়েছে",
    bannerAlert: "সতর্কতা: টেলিগ্রাম টাস্ক প্রতারণায় রেজিস্ট্রেশন ফি চাওয়া হচ্ছে",
    tabPaste: "মেসেজ পেস্ট করুন",
    tabUpload: "স্ক্রিনশট আপলোড",
    tabDirect: "নম্বর / UPI যাচাই",
    tabVerify: "লেটার যাচাই",
    placeholderPaste: "হোয়াটসঅ্যাপ/টেলিগ্রাম চাকরির মেসেজ বা ইমেইল পেস্ট করুন...",
    placeholderDirect: "১০ সংখ্যার মোবাইল নম্বর বা UPI ID লিখুন...",
    btnCheck: "এই প্রস্তাব যাচাই করুন",
    btnChecking: "যাচাই করা হচ্ছে...",
    btnUpload: "ছবি বা PDF নির্বাচন করুন",
    btnShare: "সতর্কতা কার্ড শেয়ার করুন",
    btnReport: "প্রতারণার অভিযোগ করুন",
    btnCheckAnother: "অন্য প্রস্তাব যাচাই করুন",
    btnCopy1930: "১৯৩০ অভিযোগ কপি করুন",
    btnCall1930: "১৯৩০ হেল্পলাইনে কল করুন",
    copied: "কপি করা হয়েছে!",
    step1: "যোগাযোগ এবং বেতনের তথ্য বিশ্লেষণ...",
    step2: "প্রতারণা নেটওয়ার্কের সাথে মেলানো হচ্ছে...",
    step3: "অফিসিয়াল কোম্পানি রেকর্ডের সাথে যাচাই...",
    step4: "চূড়ান্ত সিদ্ধান্ত গণনা করা হচ্ছে...",
    verdictSafe: "নিরাপদ",
    verdictSuspicious: "সন্দেহজনক",
    verdictScam: "প্রতারণা",
    reasonsTitle: "কারণ এবং বিপদের সংকেত",
    networkTitle: "প্রতারণা নেটওয়ার্ক সংযোগ",
    networkLinked: (reports: number, cities: number) =>
      `${cities}টি শহরের ${reports}টি প্রতারণার রিপোর্টের সাথে সংযুক্ত।`,
    reportTitle: "১৯৩০ পোর্টালে প্রতারণার রিপোর্ট করুন",
    reportSubtitle: "আপনার রিপোর্ট অন্যান্য চাকরিপ্রার্থীদের অবিলম্বে সতর্ক করবে।",
    reportTypeLabel: "প্রতারণার ধরন",
    amountLostLabel: "হারানো অর্থ (টাকা, ঐচ্ছিক)",
    reportSubmit: "রিপোর্ট জমা দিন এবং ১৯৩০ অভিযোগ তৈরি করুন",
    reportSuccess: "রিপোর্ট নথিভুক্ত হয়েছে এবং নেটওয়ার্ক আপডেট হয়েছে",
    letterVerifyTitle: "কোম্পানি অফার লেটার যাচাই করুন",
    letterVerifySubtitle: "অফার লেটার আইডি লিখুন অথবা QR কোড স্ক্যান করুন।",
    letterPlaceholder: "যেমন TCS-2026-ENG-089",
    letterBtn: "লেটার যাচাই করুন",
    letterValid: "কোম্পানি দ্বারা যাচাইকৃত",
    letterInvalid: "কোম্পানি দ্বারা জারি করা হয়নি / বিকৃত",
    micBtn: "ভয়েস ইনপুট",
    micListening: "শুনছি... কথা বলুন",
    micUnsupported: "এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়।",
    speakVerdict: "রায় শুনুন",
    speaking: "বলছি...",
    stopSpeaking: "অডিও থামান",
  },
  gu: {
    title: "નોકરીની ઓફર મળી? પૈસા ચૂકવતા પહેલા ચકાસો.",
    subtitle: "મેસેજ પેસ્ટ કરો, સ્ક્રીનશોટ અપલોડ કરો અથવા UPI ચકાસો. સેકન્ડોમાં સુરક્ષિત / શંકાસ્પદ / છેતરપિંડી જાણો.",
    bannerCount: "આજે 1,840 જોબ ઓફર ચકાસવામાં આવી",
    bannerAlert: "ચેતવણી: ટેલિગ્રામ ટાસ્ક કૌભાંડમાં રજીસ્ટ્રેશન ફી માંગવામાં આવી રહી છે",
    tabPaste: "મેસેજ પેસ્ટ કરો",
    tabUpload: "સ્ક્રીનશોટ અપલોડ",
    tabDirect: "નંબર / UPI ચકાસો",
    tabVerify: "લેટર ચકાસો",
    placeholderPaste: "વોટ્સએપ/ટેલિગ્રામ જોબ મેસેજ અથવા ઇમેઇલ પેસ્ટ કરો...",
    placeholderDirect: "10 અંકનો મોબાઇલ નંબર અથવા UPI ID દાખલ કરો...",
    btnCheck: "આ ઑફર ચકાસો",
    btnChecking: "તપાસી રહ્યા છીએ...",
    btnUpload: "ઇમેજ અથવા PDF પસંદ કરો",
    btnShare: "ચેતવણી કાર્ડ શેર કરો",
    btnReport: "છેતરપિંડીની ફરિયાદ કરો",
    btnCheckAnother: "બીજી ઑફર ચકાસો",
    btnCopy1930: "1930 ફરિયાદ કૉપિ કરો",
    btnCall1930: "1930 હેલ્પલાઇન પર કૉલ કરો",
    copied: "કૉપિ થઈ ગયું!",
    step1: "સંપર્ક અને પગાર વિગતોનું વિશ્લેષણ...",
    step2: "ફ્રોડ નેટવર્ક સાથે સરખામણી...",
    step3: "સત્તાવાર કંપની રેકોર્ડ સાથે ચકાસણી...",
    step4: "અંતિમ નિર્ણય ગણતરી...",
    verdictSafe: "સુરક્ષિત",
    verdictSuspicious: "શંકાસ્પદ",
    verdictScam: "છેતરપિંડી",
    reasonsTitle: "કારણો અને જોખમી સંકેતો",
    networkTitle: "છેતરપિંડી નેટવર્ક જોડાણ",
    networkLinked: (reports: number, cities: number) =>
      `${cities} શહેરોમાં ${reports} છેતરપિંડી રિપોર્ટ્સ સાથે જોડાયેલું છે.`,
    reportTitle: "1930 પોર્ટલ પર છેતરપિંડીની ફરિયાદ કરો",
    reportSubtitle: "તમારી ફરિયાદ અન્ય નોકરી શોધનારાઓને તરત ચેતવણી આપશે.",
    reportTypeLabel: "છેતરપિંડીનો પ્રકાર",
    amountLostLabel: "ગુમાવેલી રકમ (રૂ., વૈકલ્પિક)",
    reportSubmit: "રિપોર્ટ સબમિટ કરો અને 1930 ફરિયાદ બનાવો",
    reportSuccess: "રિપોર્ટ નોંધાયો અને નેટવર્ક અપડેટ થયું",
    letterVerifyTitle: "કંપની ઓફર લેટર ચકાસો",
    letterVerifySubtitle: "લેટર ID દાખલ કરો અથવા QR કોડ સ્કેન કરો.",
    letterPlaceholder: "દા.ત. TCS-2026-ENG-089",
    letterBtn: "લેટર ચકાસો",
    letterValid: "કંપની દ્વારા ચકાસાયેલ",
    letterInvalid: "કંપની દ્વારા જારી કરવામાં આવેલ નથી / ફેરફાર કરેલ",
    micBtn: "વોઇસ ઇનપુટ",
    micListening: "સાંભળી રહ્યા છીએ... બોલો",
    micUnsupported: "આ બ્રાઉઝરમાં વૉઇસ ઇનપુટ સમર્થિત નથી.",
    speakVerdict: "નિર્ણય સાંભળો",
    speaking: "બોલી રહ્યા છીએ...",
    stopSpeaking: "ઓડિયો બંધ કરો",
  },
};

/**
 * Maps product language code to BCP 47 speech synthesis & recognition locale.
 */
export function getSpeechLanguage(lang: Language): string {
  switch (lang) {
    case "hi":
      return "hi-IN";
    case "mr":
      return "mr-IN";
    case "ta":
      return "ta-IN";
    case "te":
      return "te-IN";
    case "kn":
      return "kn-IN";
    case "bn":
      return "bn-IN";
    case "gu":
      return "gu-IN";
    default:
      return "en-IN";
  }
}

/**
 * Formats a clear, natural sentence for speech synthesis in the selected language.
 */
export function formatSpokenVerdict(
  verdict: "safe" | "suspicious" | "scam",
  confidence: number,
  firstReason?: string,
  lang: Language = "en",
): string {
  const pct = Math.round(confidence * 100);

  if (lang === "hi") {
    switch (verdict) {
      case "scam":
        return `सावधान! यह नौकरी निश्चित रूप से एक घोटाला है। इसका विश्वास स्तर ${pct} प्रतिशत है। मुख्य कारण: ${
          firstReason ?? "धोखाधड़ी के संकेत पाए गए हैं।"
        } कृपया कोई भी पैसा न दें।`;
      case "suspicious":
        return `चेतावनी! यह जॉब ऑफर संदिग्ध है। इसका विश्वास स्तर ${pct} प्रतिशत है। मुख्य कारण: ${
          firstReason ?? "संदेहास्पद मांग की गई है।"
        } कंपनी से सीधे पुष्टि किए बिना कोई भुगतान न करें।`;
      default:
        return `यह जॉब ऑफर फिलहाल सुरक्षित प्रतीत होता है। कोई स्पष्ट लाल झंडे नहीं मिले, लेकिन हमेशा सतर्क रहें।`;
    }
  }

  if (lang === "mr") {
    switch (verdict) {
      case "scam":
        return `सावधान! ही नोकरी पूर्णपणे फसवणूक आहे. विश्वासार्हता ${pct} टक्के आहे. मुख्य कारण: ${
          firstReason ?? "फसवणुकीचे संकेत आढळले आहेत."
        } कृपया कोणतेही पैसे देऊ नका.`;
      case "suspicious":
        return `इशारा! ही नोकरी संशयास्पद आहे. विश्वासार्हता ${pct} टक्के आहे. मुख्य कारण: ${
          firstReason ?? "संशयास्पद मागणी आढळली आहे."
        } कंपनीशी थेट संपर्क साधल्याशिवाय पैसे देऊ नका.`;
      default:
        return `ही ऑफर सुरक्षित दिसत आहे. कोणतेही स्पष्ट धोक्याचे संकेत आढळले नाहीत. सावध रहा.`;
    }
  }

  if (lang === "ta") {
    switch (verdict) {
      case "scam":
        return `எச்சரிக்கை! இந்த வேலை வாய்ப்பு ஒரு உறுதிப்படுத்தப்பட்ட மோசடி. நம்பிக்கை நிலை ${pct} சதவீதம். காரணம்: ${
          firstReason ?? "மோசடி கட்டண கோரிக்கை கண்டறியப்பட்டது."
        } எக்காரணம் கொண்டும் பணம் அனுப்ப வேண்டாம்.`;
      case "suspicious":
        return `கவனம்! இந்த வேலை வாய்ப்பு சந்தேகத்திற்குரியது. நம்பிக்கை நிலை ${pct} சதவீதம். காரணம்: ${
          firstReason ?? "சரிபார்க்கப்படாத கோரிக்கைகள் உள்ளன."
        } நிறுவனத்துடன் நேரடியாக சரிபார்க்கவும்.`;
      default:
        return `இந்த வேலை வாய்ப்பு பாதுகாப்பாக உள்ளது. உடனடி ஆபத்து அறிகுறிகள் இல்லை.`;
    }
  }

  if (lang === "te") {
    switch (verdict) {
      case "scam":
        return `హెచ్చరిక! ఈ ఉద్యోగ ఆఫర్ నిర్ధారించబడిన మోసం. విశ్వసనీయత ${pct} శాతం. కారణం: ${
          firstReason ?? "మోసపూరిత ఫీజు డిమాండ్ కనుగొనబడింది."
        } ఎటువంటి డబ్బు చెల్లించవద్దు.`;
      case "suspicious":
        return `శ్రద్ధ! ఈ ఆఫర్ అనుమానాస్పదంగా ఉంది. విశ్వసనీయత ${pct} శాతం. కారణం: ${
          firstReason ?? "అనుమానాస్పద డిమాండ్లు ఉన్నాయి."
        } కంపెనీతో నేరుగా ధృవీకరించుకోండి.`;
      default:
        return `ఈ ఉద్యోగ ఆఫర్ సురક્ષితంగా కనిపిస్తోంది. ఎటువంటి తక్షణ ప్రమాద సంకేతాలు లేవు.`;
    }
  }

  if (lang === "kn") {
    switch (verdict) {
      case "scam":
        return `ಎಚ್ಚರಿಕೆ! ಈ ಉದ್ಯೋಗದ ಆಫರ್ ಖಚಿತ ವಂಚನೆಯಾಗಿದೆ. ವಿಶ್ವಾಸಾರ್ಹತೆ ${pct} ಪ್ರತಿಶತ. ಕಾರಣ: ${
          firstReason ?? "ವಂಚನೆಯ ಶುಲ್ಕದ ಬೇಡಿಕೆ ಕಂಡುಬಂದಿದೆ."
        } ಯಾವುದೇ ಹಣ ಪಾವತಿಸಬೇಡಿ.`;
      case "suspicious":
        return `ಗಮನಿಸಿ! ಈ ಉದ್ಯೋಗ ಆಫರ್ ಅನುಮಾನಾಸ್ಪದವಾಗಿದೆ. ವಿಶ್ವಾಸಾರ್ಹತೆ ${pct} ಪ್ರತಿಶತ. ಕಂಪನಿಯೊಂದಿಗೆ ನೇರವಾಗಿ ಪರಿಶೀಲಿಸಿ.`;
      default:
        return `ಈ ಉದ್ಯೋಗದ ಆಫರ್ ಸುರಕ್ಷಿತವಾಗಿದೆ. ಯಾವುದೇ ತಕ್ಷಣದ ಅಪಾಯದ ಚಿಹ್ನೆಗಳಿಲ್ಲ.`;
    }
  }

  if (lang === "bn") {
    switch (verdict) {
      case "scam":
        return `সাবধান! এই চাকরির প্রস্তাব নিশ্চিতভাবে একটি প্রতারণা। আত্মবিশ্বাস মাত্রা ${pct} শতাংশ। কারণ: ${
          firstReason ?? "প্রতারণামূলক ফি চাওয়ার প্রমাণ মিলেছে।"
        } কোনো টাকা পাঠাবেন না।`;
      case "suspicious":
        return `সতর্ক থাকুন! এই প্রস্তাবটি সন্দেহজনক। আত্মবিশ্বাস মাত্রা ${pct} শতাংশ। কোম্পানির সাথে সরাসরি যাচাই করুন।`;
      default:
        return `এই চাকরির প্রস্তাবটি আপাতত নিরাপদ বলে মনে হচ্ছে। কোনো ঝুঁকি পাওয়া যায়নি।`;
    }
  }

  if (lang === "gu") {
    switch (verdict) {
      case "scam":
        return `સાવધાન! આ નોકરીની ઓફર પુષ્ટિ થયેલ છેતરપિંડી છે. વિશ્વાસ સ્તર ${pct} ટકા છે. કારણ: ${
          firstReason ?? "છેતરપિંડી ફીની માંગણી મળી છે."
        } કોઈ પૈસા ચૂકવશો નહીં.`;
      case "suspicious":
        return `ધ્યાન આપો! આ ઓફર શંકાસ્પદ છે. વિશ્વાસ સ્તર ${pct} ટકા છે. કંપની સાથે સીધી ચકાસણી કરો.`;
      default:
        return `આ નોકરીની ઓફર સુરક્ષિત જણાય છે. કોઈ તાત્કાલિક જોખમી સંકેતો નથી.`;
    }
  }

  // English (default)
  switch (verdict) {
    case "scam":
      return `Warning! This job offer is a confirmed scam with ${pct} percent confidence. Reason: ${
        firstReason ?? "fraudulent fee demand detected."
      } Do not send any money.`;
    case "suspicious":
      return `Attention! This job offer is suspicious with ${pct} percent confidence. Reason: ${
        firstReason ?? "unverified claims detected."
      } Verify with the company directly before you pay anything.`;
    default:
      return `This job offer appears safe. No immediate red flags were detected, but always stay cautious.`;
  }
}
