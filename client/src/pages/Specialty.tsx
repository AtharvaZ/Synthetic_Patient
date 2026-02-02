import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Heart, Brain, Activity, Pill, Thermometer, 
  ArrowLeft, ArrowRight, CheckCircle, AlertCircle,
  Stethoscope, Target, Zap
} from "lucide-react";
import { motion } from "framer-motion";

const specialtyData: Record<string, {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: any;
  description: string;
  stats: { diseases: number; symptoms: number; cases: number };
  diseases: { name: string; description: string }[];
  flowSteps: { title: string; items: string[] }[];
}> = {
  cardiology: {
    name: "Cardiology",
    color: "text-red-400",
    bgColor: "bg-red-500",
    borderColor: "border-red-500/20",
    icon: Heart,
    description: "Learn to diagnose cardiovascular diseases through symptom analysis. From myocardial infarction to heart failure, master the art of cardiac diagnosis.",
    stats: { diseases: 12, symptoms: 45, cases: 30 },
    diseases: [
      { name: "Myocardial Infarction", description: "Heart attack caused by blocked coronary arteries. Learn classic symptoms like chest pain radiating to the arm." },
      { name: "Heart Failure", description: "Chronic condition where the heart can't pump effectively. Recognize dyspnea, edema, and fatigue patterns." },
      { name: "Atrial Fibrillation", description: "Irregular heart rhythm. Learn to identify palpitations, dizziness, and irregular pulse findings." },
      { name: "Angina Pectoris", description: "Chest pain from reduced blood flow. Differentiate stable vs unstable angina presentations." },
      { name: "Hypertension", description: "High blood pressure and its complications. Understand headaches, vision changes, and organ damage signs." },
      { name: "Pericarditis", description: "Inflammation of the heart lining. Recognize sharp chest pain that worsens with breathing." },
    ],
    flowSteps: [
      { title: "Identify Symptoms", items: ["Chest pain location", "Pain radiation", "Associated symptoms", "Timing & triggers"] },
      { title: "Differentiate", items: ["Acute vs chronic", "Cardiac vs non-cardiac", "Risk factors", "Red flags"] },
    ]
  },
  neurology: {
    name: "Neurology",
    color: "text-purple-400",
    bgColor: "bg-purple-500",
    borderColor: "border-purple-500/20",
    icon: Brain,
    description: "Master neurological conditions from headaches to stroke. Learn to interpret symptoms affecting the brain, spine, and nervous system.",
    stats: { diseases: 15, symptoms: 60, cases: 35 },
    diseases: [
      { name: "Migraine", description: "Severe throbbing headache with aura, photophobia, and nausea. Learn trigger identification." },
      { name: "Stroke (CVA)", description: "Sudden neurological deficit from brain blood supply interruption. FAST recognition is crucial." },
      { name: "Epilepsy", description: "Recurrent seizure disorder. Identify different seizure types and their presentations." },
      { name: "Parkinson's Disease", description: "Progressive movement disorder. Recognize tremor, rigidity, and bradykinesia." },
      { name: "Multiple Sclerosis", description: "Autoimmune demyelinating disease. Understand relapsing-remitting patterns." },
      { name: "Meningitis", description: "Infection of brain membranes. Classic triad of fever, headache, and neck stiffness." },
    ],
    flowSteps: [
      { title: "Assess Symptoms", items: ["Headache characteristics", "Motor function", "Sensory changes", "Cognitive status"] },
      { title: "Localize Lesion", items: ["Central vs peripheral", "Focal vs diffuse", "Acute vs chronic", "Progressive vs static"] },
    ]
  },
  pulmonology: {
    name: "Pulmonology",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500",
    borderColor: "border-cyan-500/20",
    icon: Activity,
    description: "Explore respiratory conditions from pneumonia to COPD. Learn to interpret breathing patterns, lung sounds, and respiratory symptoms.",
    stats: { diseases: 10, symptoms: 35, cases: 28 },
    diseases: [
      { name: "Pneumonia", description: "Lung infection with cough, fever, and difficulty breathing. Identify bacterial vs viral patterns." },
      { name: "COPD", description: "Chronic obstructive pulmonary disease. Recognize progressive dyspnea and chronic cough." },
      { name: "Asthma", description: "Reversible airway obstruction. Identify wheezing, cough, and trigger patterns." },
      { name: "Pulmonary Embolism", description: "Blood clot in lungs. Recognize sudden dyspnea, pleuritic pain, and risk factors." },
      { name: "Tuberculosis", description: "Chronic bacterial infection. Classic symptoms of night sweats, weight loss, and hemoptysis." },
      { name: "Pleural Effusion", description: "Fluid around the lungs. Identify decreased breath sounds and dullness to percussion." },
    ],
    flowSteps: [
      { title: "Evaluate Breathing", items: ["Respiratory rate", "Oxygen saturation", "Breath sounds", "Work of breathing"] },
      { title: "Characterize Pattern", items: ["Obstructive vs restrictive", "Acute vs chronic", "Infectious vs non-infectious", "Upper vs lower airway"] },
    ]
  },
  gastroenterology: {
    name: "Gastroenterology",
    color: "text-green-400",
    bgColor: "bg-green-500",
    borderColor: "border-green-500/20",
    icon: Pill,
    description: "Navigate digestive system disorders from GERD to appendicitis. Master abdominal examination and symptom interpretation.",
    stats: { diseases: 14, symptoms: 50, cases: 32 },
    diseases: [
      { name: "Appendicitis", description: "Appendix inflammation requiring surgery. Classic migration of pain to right lower quadrant." },
      { name: "GERD", description: "Gastroesophageal reflux disease. Heartburn, regurgitation, and esophageal symptoms." },
      { name: "Peptic Ulcer Disease", description: "Stomach or duodenal ulcers. Differentiate gastric vs duodenal by pain timing." },
      { name: "Cholecystitis", description: "Gallbladder inflammation. Right upper quadrant pain after fatty meals." },
      { name: "Pancreatitis", description: "Pancreas inflammation. Severe epigastric pain radiating to back." },
      { name: "Inflammatory Bowel Disease", description: "Crohn's and ulcerative colitis. Chronic diarrhea, blood, and abdominal pain patterns." },
    ],
    flowSteps: [
      { title: "Localize Pain", items: ["Abdominal quadrant", "Pain character", "Radiation pattern", "Aggravating factors"] },
      { title: "Identify Features", items: ["GI bleeding signs", "Obstruction symptoms", "Inflammatory markers", "Alarm symptoms"] },
    ]
  },
  endocrinology: {
    name: "Endocrinology",
    color: "text-orange-400",
    bgColor: "bg-orange-500",
    borderColor: "border-orange-500/20",
    icon: Thermometer,
    description: "Understand hormonal disorders from diabetes to thyroid disease. Learn to recognize metabolic and endocrine dysfunction patterns.",
    stats: { diseases: 11, symptoms: 40, cases: 25 },
    diseases: [
      { name: "Type 2 Diabetes", description: "Insulin resistance disorder. Polyuria, polydipsia, and metabolic complications." },
      { name: "Hypothyroidism", description: "Underactive thyroid. Fatigue, weight gain, cold intolerance, and bradycardia." },
      { name: "Hyperthyroidism", description: "Overactive thyroid. Weight loss, tremor, heat intolerance, and tachycardia." },
      { name: "Cushing's Syndrome", description: "Excess cortisol. Moon face, central obesity, and striae." },
      { name: "Addison's Disease", description: "Adrenal insufficiency. Fatigue, hyperpigmentation, and hypotension." },
      { name: "Diabetic Ketoacidosis", description: "Acute diabetic emergency. Fruity breath, Kussmaul breathing, and altered consciousness." },
    ],
    flowSteps: [
      { title: "Recognize Patterns", items: ["Metabolic symptoms", "Weight changes", "Energy levels", "Temperature sensitivity"] },
      { title: "Assess Function", items: ["Hyper vs hypo state", "Single vs multiple glands", "Primary vs secondary", "Acute vs chronic"] },
    ]
  }
};

const allSpecialties = ["cardiology", "neurology", "pulmonology", "gastroenterology", "endocrinology"];

export default function Specialty() {
  const params = useParams();
  const specialtyId = params.id as string;
  const specialty = specialtyData[specialtyId];

  if (!specialty) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Specialty not found</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = specialty.icon;
  const colorClasses: Record<string, { text: string; bg: string; border: string; shadow: string }> = {
    cardiology: { text: "text-red-400", bg: "bg-red-500", border: "border-red-500/20", shadow: "shadow-red-500/30" },
    neurology: { text: "text-purple-400", bg: "bg-purple-500", border: "border-purple-500/20", shadow: "shadow-purple-500/30" },
    pulmonology: { text: "text-cyan-400", bg: "bg-cyan-500", border: "border-cyan-500/20", shadow: "shadow-cyan-500/30" },
    gastroenterology: { text: "text-green-400", bg: "bg-green-500", border: "border-green-500/20", shadow: "shadow-green-500/30" },
    endocrinology: { text: "text-orange-400", bg: "bg-orange-500", border: "border-orange-500/20", shadow: "shadow-orange-500/30" },
  };
  const colors = colorClasses[specialtyId];
  const otherSpecialties = allSpecialties.filter(s => s !== specialtyId);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#283039] bg-[#0a0a0c]/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 bg-[#137fec] rounded flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">MediTutor AI</h2>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/quiz">
              <Button className={`${colors.bg} hover:opacity-90`} data-testid="button-practice-specialty">
                Practice {specialty.name}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className={`absolute top-20 right-0 w-[400px] h-[400px] ${colors.bg}/20 rounded-full blur-[100px] opacity-50`}></div>
        </div>
        
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.bg}/10 border ${colors.border} ${colors.text} mb-6`}>
                <Icon className="w-4 h-4" />
                <span className="text-sm font-semibold">{specialty.name} Specialty</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Master <span className={colors.text}>{specialty.name}</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-xl">
                {specialty.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${colors.text}`}>{specialty.stats.diseases}</p>
                  <p className="text-sm text-gray-500">Diseases</p>
                </div>
                <div className="w-px h-12 bg-[#283039]"></div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${colors.text}`}>{specialty.stats.symptoms}+</p>
                  <p className="text-sm text-gray-500">Symptoms</p>
                </div>
                <div className="w-px h-12 bg-[#283039]"></div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${colors.text}`}>{specialty.stats.cases}</p>
                  <p className="text-sm text-gray-500">Cases</p>
                </div>
              </div>
            </motion.div>
            
            {/* Animated Icon */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex justify-center"
            >
              <div className="relative">
                <div className={`w-64 h-64 rounded-full ${colors.bg}/5 border ${colors.border} flex items-center justify-center`}>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Icon className={`w-32 h-32 ${colors.text}`} strokeWidth={1} />
                  </motion.div>
                </div>
                {/* Pulse rings */}
                <div className={`absolute inset-0 rounded-full border-2 ${colors.border} animate-ping opacity-20`}></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Diseases Covered */}
      <section className="py-16 border-t border-[#283039]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Diseases You'll Learn to Diagnose</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialty.diseases.map((disease, index) => (
              <motion.div
                key={disease.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl bg-[#161618] border border-[#283039] hover:${colors.border} transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg`}
              >
                <div className={`w-12 h-12 rounded-xl ${colors.bg}/10 flex items-center justify-center mb-4`}>
                  <CheckCircle className={`w-6 h-6 ${colors.text}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{disease.name}</h3>
                <p className="text-sm text-gray-500">{disease.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Symptom Analysis Flow */}
      <section className="py-16 bg-[#0d0d10] border-t border-[#283039]">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="text-2xl font-bold mb-4 text-center">{specialty.name} Symptom Analysis Flow</h2>
          <p className="text-gray-500 text-center mb-12">How to approach {specialty.name.toLowerCase()} symptoms systematically</p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {specialty.flowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${colors.bg} flex items-center justify-center shadow-lg ${colors.shadow}`}>
                  <span className="text-2xl font-bold text-white">{index + 1}</span>
                </div>
                <h3 className="font-bold mb-4">{step.title}</h3>
                <div className="bg-[#161618] rounded-xl p-4 border border-[#283039]">
                  <ul className="text-sm text-gray-400 space-y-2 text-left">
                    {step.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.bg}`}></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Final Step */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-md text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold mb-2">Make Diagnosis</h3>
              <p className="text-sm text-gray-500">
                Combine symptom patterns with clinical reasoning to reach the correct {specialty.name.toLowerCase()} diagnosis.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Start Practice CTA */}
      <section className="py-16 border-t border-[#283039]">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <div className={`bg-gradient-to-r from-${specialtyId === 'cardiology' ? 'red' : specialtyId === 'neurology' ? 'purple' : specialtyId === 'pulmonology' ? 'cyan' : specialtyId === 'gastroenterology' ? 'green' : 'orange'}-500/20 to-${specialtyId === 'cardiology' ? 'orange' : specialtyId === 'neurology' ? 'pink' : specialtyId === 'pulmonology' ? 'blue' : specialtyId === 'gastroenterology' ? 'teal' : 'yellow'}-500/20 rounded-3xl p-12 border ${colors.border}`}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${colors.bg}/20 flex items-center justify-center`}
            >
              <Icon className={`w-8 h-8 ${colors.text}`} />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4">Ready to Practice {specialty.name}?</h2>
            <p className="text-gray-400 mb-8">Test your {specialty.name.toLowerCase()} diagnostic skills with our AI-powered quiz.</p>
            <Link href="/quiz">
              <Button className={`${colors.bg} hover:opacity-90 px-8 py-4 h-auto text-base font-bold`} data-testid="button-start-specialty-quiz">
                Start {specialty.name} Quiz
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Other Specialties */}
      <section className="py-12 bg-[#0d0d10] border-t border-[#283039]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h3 className="text-lg font-bold mb-6 text-center">Explore Other Specialties</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {otherSpecialties.map(s => {
              const specData = specialtyData[s];
              const specColors = colorClasses[s];
              return (
                <Link key={s} href={`/specialty/${s}`}>
                  <Button
                    variant="outline"
                    className={`${specColors.bg}/10 ${specColors.text} border ${specColors.border} hover:${specColors.bg}/20`}
                    data-testid={`button-specialty-${s}`}
                  >
                    {specData.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-[#137fec]/10 p-2 rounded-xl">
                <Stethoscope className="w-5 h-5 text-[#137fec]" />
              </div>
              <span className="text-lg font-bold">MediTutor AI</span>
            </div>
          </Link>
          <p className="text-sm text-gray-500">© 2024 MediTutor AI. Educational purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
