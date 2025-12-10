"use client";

import { cn } from "@/app/utils/cn-classes";
import { CheckCircle, HelpCircle, XCircle } from "lucide-react";
import { ReactNode, useState } from "react";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizProps {
  question: string;
  options: QuizOption[];
  explanation?: string;
  children?: ReactNode;
}

// MDX-friendly version that accepts options as separate props
interface MDXQuizProps {
  question: string;
  option1: string;
  option2: string;
  option3?: string;
  option4?: string;
  correctAnswer: number; // 1-based index
  explanation?: string;
  children?: ReactNode;
}

export function Quiz({ question, options, explanation, children }: QuizProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (index: number) => {
    if (showResult) return; // Prevent changing answer after submission
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  return (
    <div className="my-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <HelpCircle className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {question}
          </h3>

          <div className="space-y-2 mb-4">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const showCorrect = showResult && option.isCorrect;
              const showIncorrect =
                showResult && isSelected && !option.isCorrect;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all",
                    isSelected && !showResult
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-300 hover:border-blue-300",
                    showCorrect && "border-green-500 bg-green-100",
                    showIncorrect && "border-red-500 bg-red-100",
                    showResult && "cursor-default"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        isSelected &&
                          !showResult &&
                          "border-blue-500 bg-blue-500",
                        showCorrect && "border-green-500 bg-green-500",
                        showIncorrect && "border-red-500 bg-red-500"
                      )}
                    >
                      {(isSelected || showCorrect) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span
                      className={cn(
                        showCorrect && "text-green-800 font-medium",
                        showIncorrect && "text-red-800",
                        !showResult && isSelected && "text-blue-800"
                      )}
                    >
                      {option.text}
                    </span>
                    {showCorrect && (
                      <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                    )}
                    {showIncorrect && (
                      <XCircle className="h-5 w-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && explanation && (
            <div className="mb-4 p-3 bg-white rounded-lg border">
              <p className="text-sm text-gray-700">
                <strong>Penjelasan:</strong> {explanation}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {!showResult ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Periksa Jawaban
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Coba Lagi
              </button>
            )}
          </div>
        </div>
      </div>

      {children && (
        <div className="mt-4 pt-4 border-t border-blue-200">{children}</div>
      )}
    </div>
  );
}

// MDX-friendly version that accepts options as separate props
export function MDXQuiz({
  question,
  option1,
  option2,
  option3,
  option4,
  correctAnswer,
  explanation,
  children,
}: MDXQuizProps) {
  // Convert MDX props to QuizOption format
  const options: QuizOption[] = [
    { text: option1, isCorrect: correctAnswer === 1 },
    { text: option2, isCorrect: correctAnswer === 2 },
    ...(option3 ? [{ text: option3, isCorrect: correctAnswer === 3 }] : []),
    ...(option4 ? [{ text: option4, isCorrect: correctAnswer === 4 }] : []),
  ];

  return (
    <Quiz question={question} options={options} explanation={explanation}>
      {children}
    </Quiz>
  );
}
