import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createContext, useContext, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Create Context for sharing quiz data between tabs
const QuizContext = createContext();

// Default quiz questions
const defaultQuestions = [
  {
    id: "1",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
  },
  {
    id: "2",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
  },
  {
    id: "3",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1,
  },
];

// ==================== PREVIEW QUIZ TAB ====================
function PreviewQuiz() {
  const { questions, timerDuration } = useContext(QuizContext);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [autoSubmitFlag, setAutoSubmitFlag] = useState(false);

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResult(true);
    setQuizStarted(false);
  };

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (quizStarted && !showResult) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setAutoSubmitFlag(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, showResult]);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(timerDuration);
  }, [timerDuration]);

  // When autoSubmitFlag is set by the timer, run the final scoring
  useEffect(() => {
    if (autoSubmitFlag) {
      // inline scoring to avoid stale dependency warnings
      let correctCount = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctAnswer) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setShowResult(true);
      setQuizStarted(false);
      setAutoSubmitFlag(false);
    }
  }, [autoSubmitFlag, questions, selectedAnswers]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startQuiz = () => {
    if (questions.length === 0) {
      Alert.alert(
        "No Questions",
        "Please add questions in Quiz Settings first.",
      );
      return;
    }
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResult(false);
    setScore(0);
    setTimeLeft(timerDuration);
  };

  const selectAnswer = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex,
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  const submitQuiz = () => {
    Alert.alert("Submit Quiz", "Are you sure you want to submit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Submit", onPress: calculateScore },
    ]);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResult(false);
    setScore(0);
    setTimeLeft(timerDuration);
  };

  // Start Screen
  if (!quizStarted && !showResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startContainer}>
          <Ionicons name="help-circle" size={80} color="#4A90D9" />
          <Text style={styles.title}>Quiz Preview</Text>
          <Text style={styles.subtitle}>
            {questions.length} Questions | {formatTime(timerDuration)} Timer
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Result Screen
  if (showResult) {
    const percentage =
      questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Ionicons
            name={percentage >= 70 ? "trophy" : "sad"}
            size={80}
            color={percentage >= 70 ? "#FFD700" : "#FF6B6B"}
          />
          <Text style={styles.resultTitle}>Quiz Completed!</Text>
          <Text style={styles.scoreText}>
            Your Score: {score}/{questions.length}
          </Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
          <Text style={styles.feedbackText}>
            {percentage >= 70 ? "Great job!" : "Keep practicing!"}
          </Text>

          {/* Review Answers */}
          <ScrollView style={styles.reviewContainer}>
            <Text style={styles.reviewTitle}>Review Answers:</Text>
            {questions.map((q, index) => (
              <View key={q.id} style={styles.reviewItem}>
                <Text style={styles.reviewQuestion}>
                  {index + 1}. {q.question}
                </Text>
                <Text
                  style={[
                    styles.reviewAnswer,
                    selectedAnswers[q.id] === q.correctAnswer
                      ? styles.correctAnswer
                      : styles.wrongAnswer,
                  ]}
                >
                  Your answer:{" "}
                  {q.options[selectedAnswers[q.id]] || "Not answered"}
                </Text>
                {selectedAnswers[q.id] !== q.correctAnswer && (
                  <Text style={styles.correctAnswerText}>
                    Correct: {q.options[q.correctAnswer]}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Quiz Screen
  const currentQ = questions[currentQuestion];
  return (
    <SafeAreaView style={styles.container}>
      {/* Timer */}
      <View
        style={[
          styles.timerContainer,
          timeLeft <= 30 && styles.timerWarning,
          timeLeft <= 10 && styles.timerCritical,
        ]}
      >
        <Ionicons
          name="time"
          size={24}
          color={timeLeft <= 10 ? "#FF0000" : "#4A90D9"}
        />
        <Text
          style={[styles.timerText, timeLeft <= 10 && styles.timerTextCritical]}
        >
          {formatTime(timeLeft)}
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentQuestion + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQ.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQ.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswers[currentQ.id] === index && styles.selectedOption,
            ]}
            onPress={() => selectAnswer(currentQ.id, index)}
          >
            <View
              style={[
                styles.optionCircle,
                selectedAnswers[currentQ.id] === index && styles.selectedCircle,
              ]}
            >
              <Text
                style={[
                  styles.optionLetter,
                  selectedAnswers[currentQ.id] === index &&
                    styles.selectedLetter,
                ]}
              >
                {String.fromCharCode(65 + index)}
              </Text>
            </View>
            <Text
              style={[
                styles.optionText,
                selectedAnswers[currentQ.id] === index &&
                  styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestion === 0 && styles.disabledButton,
          ]}
          onPress={prevQuestion}
          disabled={currentQuestion === 0}
        >
          <Ionicons name="chevron-back" size={20} color="#FFF" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {currentQuestion === questions.length - 1 ? (
          <TouchableOpacity style={styles.submitButton} onPress={submitQuiz}>
            <Text style={styles.submitButtonText}>Submit</Text>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={nextQuestion}>
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==================== QUIZ SETTINGS TAB ====================
function QuizSettings() {
  const { questions, setQuestions, timerDuration, setTimerDuration } =
    useContext(QuizContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [timerInput, setTimerInput] = useState(String(timerDuration / 60));

  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setModalVisible(true);
  };

  const openEditModal = (question) => {
    setEditingQuestion(question);
    setQuestionText(question.question);
    setOptions([...question.options]);
    setCorrectAnswer(question.correctAnswer);
    setModalVisible(true);
  };

  const saveQuestion = () => {
    if (!questionText.trim()) {
      Alert.alert("Error", "Please enter a question.");
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      Alert.alert("Error", "Please fill all options.");
      return;
    }

    if (editingQuestion) {
      // Edit existing question
      setQuestions(
        questions.map((q) =>
          q.id === editingQuestion.id
            ? { ...q, question: questionText, options, correctAnswer }
            : q,
        ),
      );
    } else {
      // Add new question
      const newQuestion = {
        id: Date.now().toString(),
        question: questionText,
        options,
        correctAnswer,
      };
      setQuestions([...questions, newQuestion]);
    }
    setModalVisible(false);
  };

  const deleteQuestion = (id) => {
    Alert.alert(
      "Delete Question",
      "Are you sure you want to delete this question?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setQuestions(questions.filter((q) => q.id !== id)),
        },
      ],
    );
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const updateTimer = () => {
    const minutes = parseInt(timerInput) || 1;
    setTimerDuration(minutes * 60);
    Alert.alert("Success", `Timer set to ${minutes} minute(s)`);
  };

  const renderQuestionItem = ({ item, index }) => (
    <View style={styles.questionItem}>
      <View style={styles.questionItemHeader}>
        <View style={styles.questionNumber}>
          <Text style={styles.questionNumberText}>{index + 1}</Text>
        </View>
        <Text style={styles.questionItemText} numberOfLines={2}>
          {item.question}
        </Text>
      </View>
      <View style={styles.questionItemActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={18} color="#4A90D9" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteQuestion(item.id)}
        >
          <Ionicons name="trash" size={18} color="#FF6B6B" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Timer Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="time" size={20} color="#4A90D9" /> Quiz Timer
          </Text>
          <View style={styles.timerSettingContainer}>
            <TextInput
              style={styles.timerInputField}
              value={timerInput}
              onChangeText={setTimerInput}
              keyboardType="numeric"
              placeholder="Minutes"
            />
            <Text style={styles.timerLabel}>minutes</Text>
            <TouchableOpacity
              style={styles.setTimerButton}
              onPress={updateTimer}
            >
              <Text style={styles.setTimerButtonText}>Set Timer</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.currentTimerText}>
            Current: {Math.floor(timerDuration / 60)} min {timerDuration % 60}{" "}
            sec
          </Text>
        </View>

        {/* Questions List */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="list" size={20} color="#4A90D9" /> Quiz Questions
              ({questions.length})
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Ionicons name="add" size={24} color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {questions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={50} color="#CCC" />
              <Text style={styles.emptyStateText}>No questions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the Add button to create your first question
              </Text>
            </View>
          ) : (
            <FlatList
              data={questions}
              renderItem={renderQuestionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </Text>

              <Text style={styles.inputLabel}>Question</Text>
              <TextInput
                style={styles.textInput}
                value={questionText}
                onChangeText={setQuestionText}
                placeholder="Enter your question"
                multiline
              />

              <Text style={styles.inputLabel}>Options</Text>
              {options.map((option, index) => (
                <View key={index} style={styles.optionInputContainer}>
                  <TouchableOpacity
                    style={[
                      styles.correctIndicator,
                      correctAnswer === index &&
                        styles.correctIndicatorSelected,
                    ]}
                    onPress={() => setCorrectAnswer(index)}
                  >
                    <Ionicons
                      name={
                        correctAnswer === index
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={24}
                      color={correctAnswer === index ? "#4CAF50" : "#CCC"}
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.optionInput}
                    value={option}
                    onChangeText={(text) => updateOption(index, text)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                </View>
              ))}
              <Text style={styles.hintText}>
                Tap the circle to mark the correct answer
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveQuestion}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==================== TAB NAVIGATOR ====================
const Tab = createBottomTabNavigator();

export default function App() {
  const [questions, setQuestions] = useState(defaultQuestions);
  const [timerDuration, setTimerDuration] = useState(120); // 2 minutes default

  return (
    <QuizContext.Provider
      value={{ questions, setQuestions, timerDuration, setTimerDuration }}
    >
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === "Preview Quiz") {
                iconName = focused ? "play-circle" : "play-circle-outline";
              } else if (route.name === "Quiz Settings") {
                iconName = focused ? "settings" : "settings-outline";
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#4A90D9",
            tabBarInactiveTintColor: "gray",
            headerStyle: {
              backgroundColor: "#4A90D9",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          })}
        >
          <Tab.Screen name="Preview Quiz" component={PreviewQuiz} />
          <Tab.Screen name="Quiz Settings" component={QuizSettings} />
        </Tab.Navigator>
      </NavigationContainer>
    </QuizContext.Provider>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  // Start Screen Styles
  startContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: "#4A90D9",
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Timer Styles
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#E3F2FD",
    margin: 10,
    borderRadius: 10,
  },
  timerWarning: {
    backgroundColor: "#FFF3E0",
  },
  timerCritical: {
    backgroundColor: "#FFEBEE",
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A90D9",
    marginLeft: 10,
  },
  timerTextCritical: {
    color: "#FF0000",
  },

  // Progress Styles
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4A90D9",
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },

  // Question Styles
  questionContainer: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    lineHeight: 26,
  },

  // Options Styles
  optionsContainer: {
    paddingHorizontal: 15,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  selectedOption: {
    borderColor: "#4A90D9",
    backgroundColor: "#E3F2FD",
  },
  optionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedCircle: {
    backgroundColor: "#4A90D9",
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  selectedLetter: {
    color: "#FFF",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#4A90D9",
    fontWeight: "600",
  },

  // Navigation Styles
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginTop: "auto",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90D9",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  navButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: "#B0BEC5",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },

  // Result Styles
  resultContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
  },
  scoreText: {
    fontSize: 22,
    color: "#666",
    marginTop: 15,
  },
  percentageText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4A90D9",
    marginVertical: 10,
  },
  feedbackText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  reviewContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  reviewItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  reviewQuestion: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  reviewAnswer: {
    fontSize: 14,
    paddingVertical: 3,
  },
  correctAnswer: {
    color: "#4CAF50",
  },
  wrongAnswer: {
    color: "#FF6B6B",
  },
  correctAnswerText: {
    fontSize: 13,
    color: "#4CAF50",
    fontStyle: "italic",
  },
  retryButton: {
    backgroundColor: "#4A90D9",
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 30,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Settings Styles
  settingsSection: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  timerSettingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerInputField: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    width: 80,
    fontSize: 16,
    textAlign: "center",
  },
  timerLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: "#666",
  },
  setTimerButton: {
    backgroundColor: "#4A90D9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: "auto",
  },
  setTimerButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  currentTimerText: {
    marginTop: 10,
    color: "#888",
    fontSize: 13,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 5,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#BBB",
    marginTop: 5,
  },
  questionItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90D9",
  },
  questionItemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4A90D9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  questionNumberText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  questionItemText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  questionItemActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },
  editButtonText: {
    color: "#4A90D9",
    marginLeft: 4,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: "#FF6B6B",
    marginLeft: 4,
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
    minHeight: 60,
  },
  optionInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  correctIndicator: {
    padding: 5,
  },
  correctIndicatorSelected: {
    // Selected state handled by icon color
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
    marginLeft: 10,
  },
  hintText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
