import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types
export type ChoiceMap = { [key: string]: string };
export type Question = {
  id: number;
  type: "multiple" | "truefalse" | "checkbox";
  question: string;
  choices: ChoiceMap;
  answer: string | string[];
};

interface QuizContextType {
  questions: Question[];
  timer: number; // in seconds
  loadData: () => Promise<void>;
  saveQuestions: (questions: Question[]) => Promise<void>;
  addQuestion: (question: Omit<Question, 'id'>) => void;
  editQuestion: (id: number, updatedQuestion: Omit<Question, 'id'>) => void;
  deleteQuestion: (id: number) => void;
  setTimer: (timer: number) => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

interface QuizProviderProps {
  children: ReactNode;
}

const defaultQuestions: Question[] = [
  {
    id: 1,
    type: "multiple",
    question: "What does CPU stand for?",
    choices: {
      A: "Central Process Unit",
      B: "Central Processing Unit",
      C: "Computer Personal Unit",
      D: "Central Program Utility",
    },
    answer: "B",
  },
  {
    id: 2,
    type: "multiple",
    question: "Which of the following is a programming language?",
    choices: {
      A: "HTML",
      B: "CSS",
      C: "Python",
      D: "HTTP",
    },
    answer: "C",
  },
  // Add more default questions if needed
];

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [timer, setTimerState] = useState<number>(300); // 5 minutes default

  const loadData = async () => {
    try {
      const storedQuestions = await AsyncStorage.getItem('questions');
      const storedTimer = await AsyncStorage.getItem('timer');
      if (storedQuestions) {
        setQuestions(JSON.parse(storedQuestions));
      }
      if (storedTimer) {
        setTimerState(parseInt(storedTimer, 10));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const saveQuestions = async (newQuestions: Question[]) => {
    try {
      await AsyncStorage.setItem('questions', JSON.stringify(newQuestions));
      setQuestions(newQuestions);
    } catch (error) {
      console.error('Failed to save questions:', error);
    }
  };

  const addQuestion = (question: Omit<Question, 'id'>) => {
    const newId = Math.max(...questions.map(q => q.id), 0) + 1;
    const newQuestion: Question = { ...question, id: newId };
    const updatedQuestions = [...questions, newQuestion];
    saveQuestions(updatedQuestions);
  };

  const editQuestion = (id: number, updatedQuestion: Omit<Question, 'id'>) => {
    const updatedQuestions = questions.map(q => q.id === id ? { ...updatedQuestion, id } : q);
    saveQuestions(updatedQuestions);
  };

  const deleteQuestion = (id: number) => {
    const updatedQuestions = questions.filter(q => q.id !== id);
    saveQuestions(updatedQuestions);
  };

  const setTimer = async (newTimer: number) => {
    try {
      await AsyncStorage.setItem('timer', newTimer.toString());
      setTimerState(newTimer);
    } catch (error) {
      console.error('Failed to save timer:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <QuizContext.Provider value={{
      questions,
      timer,
      loadData,
      saveQuestions,
      addQuestion,
      editQuestion,
      deleteQuestion,
      setTimer,
    }}>
      {children}
    </QuizContext.Provider>
  );
};