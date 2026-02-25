// App.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useQuiz } from "@/contexts/QuizContext";

// Types imported from context

// Questions Data - now from context

// Home Screen Component
const HomeScreen: React.FC<{
  onStartQuiz: () => void;
  highScore: number | null;
  questionsLength: number;
}> = ({ onStartQuiz, highScore, questionsLength }) => {
  return (
    <View style={styles.homeContainer}>
      <View style={styles.heroSection}>
        <Text style={styles.emoji}>🧠</Text>
        <Text style={styles.title}>Programming Quiz</Text>
        <Text style={styles.subtitle}>Test your coding knowledge!</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>🏆 Highest Score</Text>
        <Text style={styles.statsValue}>
          {highScore !== null
            ? `${highScore}/${questions.length}`
            : "No attempts yet"}
        </Text>
        <Text style={styles.statsSubtext}>
          {questionsLength} Questions Available
        </Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={onStartQuiz}>
        <Text style={styles.startButtonText}>Start Quiz</Text>
        <Text style={styles.startButtonIcon}>→</Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>📝</Text>
          <Text style={styles.infoText}>Multiple Choice</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>✓</Text>
          <Text style={styles.infoText}>True/False</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>☑️</Text>
          <Text style={styles.infoText}>Multi-Select</Text>
        </View>
      </View>
    </View>
  );
};

// Quiz Screen Component
const QuizScreen: React.FC<{
  questions: Question[];
  timer: number;
  onFinish: (score: number, answers: Record<number, string | string[]>) => void;
  onGoHome: () => void;
}> = ({ questions, timer, onFinish, onGoHome }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [remainingTime, setRemainingTime] = useState<number>(timer);

  useEffect(() => {
    if (remainingTime > 0) {
      const timerId = setTimeout(() => setRemainingTime(remainingTime - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      // Time's up, auto-submit
      handleSubmit();
    }
  }, [remainingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const isCheckbox = currentQuestion.type === "checkbox";
  const progress = ((currentIndex + 1) / questions.length) * 100;

  useEffect(() => {
    // Load saved answer for current question
    const saved = answers[currentQuestion.id];
    if (saved) {
      if (isCheckbox) {
        setSelectedChoices(saved as string[]);
      } else {
        setSelectedChoices([(saved as string) || ""]);
      }
    } else {
      setSelectedChoices([]);
    }
  }, [currentIndex, answers, isCheckbox, currentQuestion.id]);

  const handleChoiceSelect = (choice: string) => {
    if (isCheckbox) {
      // Toggle selection for checkbox type
      if (selectedChoices.includes(choice)) {
        setSelectedChoices(selectedChoices.filter((c) => c !== choice));
      } else {
        setSelectedChoices([...selectedChoices, choice]);
      }
    } else {
      // Single selection
      setSelectedChoices([choice]);
    }
  };

  const saveAnswer = () => {
    if (selectedChoices.length > 0) {
      const answer = isCheckbox ? selectedChoices.sort() : selectedChoices[0];
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answer,
      }));
    }
  };

  const handleNext = () => {
    saveAnswer();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    saveAnswer();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    saveAnswer();

    // Calculate score
    let score = 0;
    const finalAnswers = {
      ...answers,
      [currentQuestion.id]: isCheckbox
        ? selectedChoices.sort()
        : selectedChoices[0],
    };

    questions.forEach((q) => {
      const userAnswer = finalAnswers[q.id];
      if (q.type === "checkbox") {
        if (Array.isArray(userAnswer) && Array.isArray(q.answer)) {
          const sortedUser = [...userAnswer].sort();
          const sortedCorrect = [...q.answer].sort();
          if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
            score++;
          }
        }
      } else {
        if (userAnswer === q.answer) {
          score++;
        }
      }
    });

    onFinish(score, finalAnswers);
  };

  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount =
    Object.keys(answers).length +
    (selectedChoices.length > 0 && !answers[currentQuestion.id] ? 1 : 0);

  return (
    <SafeAreaView style={styles.quizContainer}>
      {/* Header */}
      <View style={styles.quizHeader}>
        <TouchableOpacity onPress={onGoHome} style={styles.backButton}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.questionCounter}>
          Question {currentIndex + 1}/{questions.length}
        </Text>
        <Text style={styles.answeredCounter}>✓ {answeredCount}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Timer Display */}
      <View style={styles.timerDisplay}>
        <Text style={styles.timerDisplayText}>Time Remaining: {formatTime(remainingTime)}</Text>
      </View>

      <ScrollView
        style={styles.questionContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {currentQuestion.type === "checkbox"
              ? "☑️ Multi-Select"
              : currentQuestion.type === "truefalse"
                ? "✓ True/False"
                : "📝 Single Choice"}
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {/* Choices */}
        <View style={styles.choicesContainer}>
          {Object.entries(currentQuestion.choices).map(([key, value]) => {
            const isSelected = selectedChoices.includes(key);
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.choiceButton,
                  isSelected && styles.choiceButtonSelected,
                ]}
                onPress={() => handleChoiceSelect(key)}
              >
                <View
                  style={[
                    styles.choiceIndicator,
                    isCheckbox
                      ? styles.checkboxIndicator
                      : styles.radioIndicator,
                    isSelected && styles.indicatorSelected,
                  ]}
                >
                  {isSelected && (
                    <Text style={styles.indicatorCheck}>
                      {isCheckbox ? "✓" : "●"}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.choiceText,
                    isSelected && styles.choiceTextSelected,
                  ]}
                >
                  <Text style={styles.choiceKey}>{key}.</Text> {value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Text
            style={[
              styles.navButtonText,
              currentIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            ← Previous
          </Text>
        </TouchableOpacity>

        {isLastQuestion ? (
          <TouchableOpacity
            style={[styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Quiz ✓</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// Results Screen Component
const ResultsScreen: React.FC<{
  score: number;
  questionsLength: number;
  highScore: number | null;
  onRestart: () => void;
  onGoHome: () => void;
}> = ({ score, questionsLength, highScore, onRestart, onGoHome }) => {
  const percentage = Math.round((score / questionsLength) * 100);
  const isNewHighScore = highScore === null || score > highScore;

  const getMessage = () => {
    if (percentage === 100) return { emoji: "🏆", text: "Perfect Score!" };
    if (percentage >= 80) return { emoji: "🌟", text: "Excellent!" };
    if (percentage >= 60) return { emoji: "👍", text: "Good Job!" };
    if (percentage >= 40) return { emoji: "📚", text: "Keep Learning!" };
    return { emoji: "💪", text: "Try Again!" };
  };

  const message = getMessage();

  return (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultEmoji}>{message.emoji}</Text>
      <Text style={styles.resultMessage}>{message.text}</Text>

      {isNewHighScore && (
        <View style={styles.newHighScoreBadge}>
          <Text style={styles.newHighScoreText}>🎉 New High Score!</Text>
        </View>
      )}

      <View style={styles.scoreCard}>
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabelMain}>Your Score</Text>
          <Text style={styles.scoreValueMain}>
            {score}/{questionsLength}
          </Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>

        <View style={styles.scoreDivider} />

        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>🏆 Best Score</Text>
          <Text style={styles.scoreValue}>
            {Math.max(score, highScore || 0)}/{questionsLength}
          </Text>
        </View>
      </View>

      {/* Score Breakdown */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownIcon}>✓</Text>
          <Text style={styles.breakdownText}>Correct: {score}</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownIcon}>✗</Text>
          <Text style={styles.breakdownText}>
            Incorrect: {questionsLength - score}
          </Text>
        </View>
      </View>

      <View style={styles.resultButtons}>
        <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartButtonText}>🔄 Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={onGoHome}>
          <Text style={styles.homeButtonText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main App Component
export default function App() {
  const { questions, timer } = useQuiz();
  const [screen, setScreen] = useState<"home" | "quiz" | "results">("home");
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number | null>(null);

  useEffect(() => {
    loadHighScore();
  }, []);

  const loadHighScore = async () => {
    try {
      const saved = await AsyncStorage.getItem("quizHighScore");
      if (saved !== null) {
        setHighScore(parseInt(saved, 10));
      }
    } catch (error) {
      console.log("Error loading high score:", error);
    }
  };

  const saveHighScore = async (score: number) => {
    try {
      if (highScore === null || score > highScore) {
        await AsyncStorage.setItem("quizHighScore", score.toString());
        setHighScore(score);
      }
    } catch (error) {
      console.log("Error saving high score:", error);
    }
  };

  const handleStartQuiz = () => {
    setScreen("quiz");
  };

  const handleFinishQuiz = (
    score: number,
    answers: Record<number, string | string[]>,
  ) => {
    setCurrentScore(score);
    saveHighScore(score);
    setScreen("results");
  };

  const handleRestart = () => {
    setCurrentScore(0);
    setScreen("quiz");
  };

  const handleGoHome = () => {
    if (screen === "quiz") {
      Alert.alert("Leave Quiz?", "Your progress will be lost.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => setScreen("home"),
        },
      ]);
    } else {
      setScreen("home");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {screen === "home" && (
        <HomeScreen onStartQuiz={handleStartQuiz} highScore={highScore} questionsLength={questions.length} />
      )}
      {screen === "quiz" && (
        <QuizScreen questions={questions} timer={timer} onFinish={handleFinishQuiz} onGoHome={handleGoHome} />
      )}
      {screen === "results" && (
        <ResultsScreen
          score={currentScore}
          questionsLength={questions.length}
          highScore={highScore}
          onRestart={handleRestart}
          onGoHome={handleGoHome}
        />
      )}
    </SafeAreaView>
  );
}

// Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },

  // Home Screen Styles
  homeContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#a0a0a0",
  },
  statsCard: {
    backgroundColor: "#252541",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#3a3a5a",
  },
  statsLabel: {
    fontSize: 16,
    color: "#ffd700",
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statsSubtext: {
    fontSize: 14,
    color: "#888",
  },
  startButton: {
    backgroundColor: "#6c5ce7",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#6c5ce7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  startButtonIcon: {
    color: "#ffffff",
    fontSize: 24,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  infoItem: {
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  infoText: {
    color: "#888",
    fontSize: 12,
  },

  // Quiz Screen Styles
  quizContainer: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2a2a4a",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 18,
  },
  questionCounter: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  answeredCounter: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    height: 6,
    backgroundColor: "#2a2a4a",
    marginHorizontal: 16,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6c5ce7",
    borderRadius: 3,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#2a2a4a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  typeBadgeText: {
    color: "#a0a0a0",
    fontSize: 12,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 28,
    lineHeight: 32,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252541",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "#3a3a5a",
    marginBottom: 12,
  },
  choiceButtonSelected: {
    borderColor: "#6c5ce7",
    backgroundColor: "#2d2a4a",
  },
  choiceIndicator: {
    width: 28,
    height: 28,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4a4a6a",
  },
  radioIndicator: {
    borderRadius: 14,
  },
  checkboxIndicator: {
    borderRadius: 6,
  },
  indicatorSelected: {
    borderColor: "#6c5ce7",
    backgroundColor: "#6c5ce7",
  },
  indicatorCheck: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  choiceText: {
    flex: 1,
    fontSize: 16,
    color: "#e0e0e0",
    lineHeight: 22,
  },
  choiceTextSelected: {
    color: "#ffffff",
  },
  choiceKey: {
    fontWeight: "bold",
    color: "#6c5ce7",
  },
  navigationContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#2a2a4a",
  },
  navButton: {
    flex: 1,
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    color: "#666",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#6c5ce7",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#4ade80",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#1a1a2e",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Results Screen Styles
  resultsContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  resultMessage: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  newHighScoreBadge: {
    backgroundColor: "#ffd700",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  newHighScoreText: {
    color: "#1a1a2e",
    fontWeight: "bold",
    fontSize: 14,
  },
  scoreCard: {
    backgroundColor: "#252541",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#3a3a5a",
  },
  scoreSection: {
    alignItems: "center",
    paddingVertical: 12,
  },
  scoreDivider: {
    height: 1,
    backgroundColor: "#3a3a5a",
    marginVertical: 16,
  },
  scoreLabelMain: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  scoreValueMain: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#6c5ce7",
  },
  percentageText: {
    fontSize: 20,
    color: "#ffffff",
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#ffd700",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  breakdownCard: {
    flexDirection: "row",
    backgroundColor: "#252541",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 32,
    justifyContent: "space-around",
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  breakdownText: {
    color: "#ffffff",
    fontSize: 16,
  },
  resultButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  restartButton: {
    flex: 1,
    backgroundColor: "#6c5ce7",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  restartButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  homeButton: {
    flex: 1,
    backgroundColor: "#2a2a4a",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a5a",
  },
  homeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  timerDisplay: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  timerDisplayText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
