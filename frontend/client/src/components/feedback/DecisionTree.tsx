import { motion } from "framer-motion";
import { Check, X, Circle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export interface TreeNode {
  id: string;
  label: string;
  type: "symptom" | "test" | "diagnosis" | "ruled_out";
  asked: boolean;
  children?: TreeNode[];
}

interface DecisionTreeProps {
  tree: TreeNode;
  userDiagnosis: string;
  correctDiagnosis: string;
}

function TreeNodeComponent({ node, depth = 0, isLast = true }: { node: TreeNode; depth?: number; isLast?: boolean }) {
  const { isDarkMode } = useTheme();
  
  const getNodeStyles = () => {
    if (node.type === "diagnosis") {
      return node.asked 
        ? isDarkMode ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-emerald-100 border-emerald-500 text-emerald-600"
        : isDarkMode ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-red-100 border-red-300 text-red-600";
    }
    if (node.type === "ruled_out") {
      return isDarkMode ? "bg-gray-500/20 border-gray-500/50 text-gray-400 line-through" : "bg-slate-100 border-slate-300 text-slate-500 line-through";
    }
    if (node.asked) {
      return isDarkMode ? "bg-teal-500/20 border-teal-500 text-teal-300" : "bg-teal-100 border-teal-500 text-teal-700";
    }
    return isDarkMode ? "bg-white/5 border-white/20 text-gray-400" : "bg-slate-100 border-slate-300 text-slate-500";
  };

  const getIcon = () => {
    if (node.type === "diagnosis") {
      return node.asked ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />;
    }
    if (node.type === "ruled_out") {
      return <X className="w-3 h-3" />;
    }
    return node.asked ? <Check className="w-3 h-3" /> : <Circle className="w-3 h-3" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: depth * 0.1 }}
      className="relative"
    >
      {depth > 0 && (
        <div className="absolute left-0 top-0 -translate-x-6 h-full">
          <div className={`w-6 border-l border-b h-4 rounded-bl-lg ${isDarkMode ? "border-white/20" : "border-slate-300"}`} />
          {!isLast && <div className={`w-px h-full ml-0 ${isDarkMode ? "bg-white/20" : "bg-slate-300"}`} />}
        </div>
      )}
      
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${getNodeStyles()}`}>
        {getIcon()}
        <span>{node.label}</span>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="ml-8 mt-2 space-y-2">
          {node.children.map((child, i) => (
            <TreeNodeComponent 
              key={child.id} 
              node={child} 
              depth={depth + 1}
              isLast={i === node.children!.length - 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function DecisionTree({ tree, userDiagnosis, correctDiagnosis }: DecisionTreeProps) {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`rounded-2xl p-6 border ${isDarkMode ? "bg-[#1c1c1f] border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Diagnostic Decision Tree</h3>
      <p className={`text-sm mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
        Simplified view of your diagnostic path
      </p>
      
      <div className="overflow-x-auto pb-4">
        <TreeNodeComponent node={tree} />
      </div>

      <div className={`mt-6 pt-4 border-t grid grid-cols-2 gap-4 ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
        <div>
          <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Your Diagnosis</span>
          <p className={`text-sm font-medium mt-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{userDiagnosis}</p>
        </div>
        <div>
          <span className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Correct Diagnosis</span>
          <p className={`text-sm font-medium mt-1 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>{correctDiagnosis}</p>
        </div>
      </div>
    </div>
  );
}
