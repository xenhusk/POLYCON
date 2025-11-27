import React from "react";
import { motion } from "framer-motion";

const ResultsExpertEvaluationSlide = () => {
  const evaluations = [
    { metric: "Delivery of Information", score: "2.83", rating: "GOOD" },
    { metric: "Usability / User Interface", score: "2.80", rating: "GOOD" },
    { metric: "Data Input", score: "2.72", rating: "GOOD" },
    { metric: "Overall System Quality", score: "2.65", rating: "GOOD" },
  ];

  return (
    <div className="w-screen h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Safe zone padding for navigation controls */}
      <div className="w-full max-w-[95vw] max-h-[90vh] flex flex-col justify-center space-y-[2vh] px-[clamp(60px,8vw,100px)] py-[clamp(50px,6vh,80px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-[1.5vh]"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-gray-800"
          >
            RESULTS
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-gray-700"
          >
            Expert Evaluation: Technical System Quality
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-600"
          >
            IT experts assessed the system on a 3-point scale, confirming its
            technical robustness.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-[2vw] shadow-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-[1vh] px-[1vw] text-[clamp(0.875rem,1.5vw,1.25rem)] font-bold text-gray-800">
                    Metric
                  </th>
                  <th className="text-center py-[1vh] px-[1vw] text-[clamp(0.875rem,1.5vw,1.25rem)] font-bold text-gray-800">
                    Score
                  </th>
                  <th className="text-center py-[1vh] px-[1vw] text-[clamp(0.875rem,1.5vw,1.25rem)] font-bold text-gray-800">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evaluation, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="border-b border-gray-200"
                  >
                    <td className="py-[1.5vh] px-[1vw] text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-700">
                      {evaluation.metric}
                    </td>
                    <td className="py-[1.5vh] px-[1vw] text-center text-[clamp(1.125rem,2vw,1.75rem)] font-bold text-[#057DCD]">
                      {evaluation.score}
                    </td>
                    <td className="py-[1.5vh] px-[1vw] text-center text-[clamp(0.875rem,1.5vw,1.25rem)] font-semibold text-gray-800">
                      {evaluation.rating}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-[clamp(0.875rem,1.5vw,1.25rem)] font-semibold text-[#057DCD] text-center mt-[2vh]"
          >
            Therefore, the system has passed the criteria set forth by the
            project committee.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsExpertEvaluationSlide;

