import React from "react";
import { motion } from "framer-motion";

const MethodologyPhases1_3Slide = () => {
  const phases = [
    {
      number: "01",
      title: "On Requirement Analysis",
      description:
        "Identified key challenges in the manual consultation process, such as scheduling conflicts and inefficient record-keeping, through surveys and interviews with CICT faculty and students.",
    },
    {
      number: "02",
      title: "On Design",
      description:
        "Created a scalable system architecture, including role-based interfaces, Entity-Relationship Diagrams (ERD) for database models, and detailed data flow diagrams.",
    },
    {
      number: "03",
      title: "On Development",
      description:
        "Built the system using modern technologies: React.js for the frontend, Flask (Python) for the backend, PostgreSQL for the database, and AssemblyAI for AI-driven transcription.",
    },
  ];

  return (
    <div className="w-screen h-screen bg-white flex items-center justify-center overflow-hidden">
      {/* Safe zone padding for navigation controls */}
      <div className="w-full max-w-[95vw] max-h-[90vh] flex flex-col justify-center px-[clamp(60px,8vw,100px)] py-[clamp(50px,6vh,80px)]">
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
            Agile Development Methodology
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[clamp(0.875rem,1.5vw,1.25rem)] text-gray-700 leading-[1.6] max-w-[85vw]"
          >
            Our development followed a structured methodology to ensure a robust
            and user-centric system.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="space-y-[1.5vh] flex-1 flex flex-col justify-center mt-[2vh]"
        >
          <div className="space-y-[2vh]">
            {phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                className="flex items-start gap-[1.5vw] bg-blue-50 rounded-2xl p-[2vw]"
              >
                {/* Number Badge */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex-shrink-0 w-[clamp(50px,5vw,70px)] h-[clamp(50px,5vw,70px)] bg-gradient-to-br from-[#057DCD] to-[#034a94] rounded-xl flex items-center justify-center shadow-md"
                >
                  <span className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-white">
                    {phase.number}
                  </span>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[clamp(1rem,1.8vw,1.5rem)] font-bold text-gray-800 mb-[0.5vh]">
                    {phase.title}
                  </h3>
                  <p className="text-[clamp(0.75rem,1.2vw,1rem)] text-gray-600 leading-[1.5]">
                    {phase.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MethodologyPhases1_3Slide;

