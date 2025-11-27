import React from "react";
import { motion } from "framer-motion";

const ResultsPSSUQChartSlide = () => {
  const pssuqData = [
    { category: "Overall PSSUQ Score", score: 1.31 },
    { category: "System Usability (SYSUSE)", score: 1.29 },
    { category: "Information Quality (INFOQUAL)", score: 1.40 },
    { category: "Interface Quality (INTERQUAL)", score: 1.24 },
  ];

  const maxScore = 1.5;
  const idealScore = 1.0;

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
            PSSUQ Results: User Satisfaction with POLYCON
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-[2vw] shadow-xl">
            {/* Chart Container */}
            <div className="space-y-[2vh]">
              {/* Y-axis labels and bars */}
              <div className="space-y-[2.5vh]">
                {pssuqData.map((item, index) => {
                  const percentage = ((item.score - idealScore) / (maxScore - idealScore)) * 100;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.8 + index * 0.15 }}
                      className="flex items-center gap-[1.5vw]"
                    >
                      {/* Category Label */}
                      <div className="w-[35%] min-w-[200px] text-[clamp(0.75rem,1.2vw,1rem)] font-semibold text-gray-700">
                        {item.category}
                      </div>

                      {/* Bar Container */}
                      <div className="flex-1 relative h-[3vh] min-h-[30px]">
                        {/* Background scale */}
                        <div className="absolute inset-0 bg-gray-200 rounded-lg"></div>
                        
                        {/* Ideal Score Line (dashed) - at the start */}
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] border-l-2 border-dashed border-gray-500 opacity-70 z-10"></div>
                        
                        {/* Bar */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 1 + index * 0.15, ease: "easeOut" }}
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#20B2AA] to-[#17A2B8] rounded-r-lg flex items-center justify-end pr-[0.5vw] z-20"
                        >
                          <span className="text-[clamp(0.75rem,1.1vw,0.9375rem)] font-bold text-white">
                            {item.score}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* X-axis */}
              <div className="mt-[2vh] pt-[1vh] border-t-2 border-gray-300">
                <div className="flex justify-between items-center px-[35%]">
                  <span className="text-[clamp(0.7rem,1vw,0.875rem)] text-gray-600">1.0</span>
                  <span className="text-[clamp(0.7rem,1vw,0.875rem)] text-gray-600">1.1</span>
                  <span className="text-[clamp(0.7rem,1vw,0.875rem)] text-gray-600">1.2</span>
                  <span className="text-[clamp(0.7rem,1vw,0.875rem)] text-gray-600">1.3</span>
                  <span className="text-[clamp(0.7rem,1vw,0.875rem)] text-gray-600">1.4</span>
                  <span className="text-[clamp(0.7rem,1vw,0.875rem)] text-gray-600">1.5</span>
                </div>
                <p className="text-center text-[clamp(0.7rem,1vw,0.875rem)] text-gray-600 mt-[0.5vh]">
                  Grand Mean Score (1 = Highly Satisfied / Ideal)
                </p>
              </div>

              {/* Legend */}
              <div className="flex justify-end mt-[1vh]">
                <div className="flex items-center gap-[1vw]">
                  <div className="flex items-center gap-[0.5vw]">
                    <div className="w-[20px] h-[2px] border-t-2 border-dashed border-gray-400"></div>
                    <span className="text-[clamp(0.7rem,1vw,0.875rem)] text-gray-600">
                      Ideal Score (1.0)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPSSUQChartSlide;

