import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useQuiz, Question } from '@/contexts/QuizContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizSettingsScreen() {
  const { questions, timer, addQuestion, editQuestion, deleteQuestion, setTimer } = useQuiz();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newChoices, setNewChoices] = useState<{ [key: string]: string }>({});
  const [newAnswer, setNewAnswer] = useState<string | string[]>('');
  const [newType, setNewType] = useState<'multiple' | 'truefalse' | 'checkbox'>('multiple');
  const [timerInput, setTimerInput] = useState(timer.toString());

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      Alert.alert('Error', 'Question cannot be empty');
      return;
    }
    const question: Omit<Question, 'id'> = {
      question: newQuestion,
      choices: newChoices,
      answer: newAnswer,
      type: newType,
    };
    addQuestion(question);
    resetForm();
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion(question.question);
    setNewChoices(question.choices);
    setNewAnswer(question.answer);
    setNewType(question.type);
  };

  const handleSaveEdit = () => {
    if (editingQuestion) {
      editQuestion(editingQuestion.id, {
        question: newQuestion,
        choices: newChoices,
        answer: newAnswer,
        type: newType,
      });
      resetForm();
    }
  };

  const handleDeleteQuestion = (id: number) => {
    Alert.alert('Delete Question', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', onPress: () => deleteQuestion(id) },
    ]);
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setNewQuestion('');
    setNewChoices({});
    setNewAnswer('');
    setNewType('multiple');
  };

  const handleSetTimer = () => {
    const newTimer = parseInt(timerInput, 10);
    if (isNaN(newTimer) || newTimer <= 0) {
      Alert.alert('Error', 'Invalid timer value');
      return;
    }
    setTimer(newTimer);
    Alert.alert('Success', 'Timer updated');
  };

  const renderQuestion = ({ item }: { item: Question }) => (
    <View style={styles.questionItem}>
      <Text style={styles.questionText}>{item.question}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditQuestion(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteQuestion(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Quiz Settings</Text>

        {/* Timer Setting */}
        <View style={styles.timerSection}>
          <Text style={styles.sectionTitle}>Quiz Timer (seconds)</Text>
          <TextInput
            style={styles.input}
            value={timerInput}
            onChangeText={setTimerInput}
            keyboardType="numeric"
            placeholder="Enter time in seconds"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSetTimer}>
            <Text style={styles.saveButtonText}>Set Timer</Text>
          </TouchableOpacity>
        </View>

        {/* Questions List */}
        <Text style={styles.sectionTitle}>Questions ({questions.length})</Text>
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderQuestion}
          style={styles.list}
        />

        {/* Add/Edit Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </Text>
          <TextInput
            style={styles.input}
            value={newQuestion}
            onChangeText={setNewQuestion}
            placeholder="Enter question"
          />
          {/* For simplicity, assume choices are A, B, C, D for multiple, etc. */}
          <TextInput
            style={styles.input}
            value={newChoices.A || ''}
            onChangeText={(text) => setNewChoices({ ...newChoices, A: text })}
            placeholder="Choice A"
          />
          <TextInput
            style={styles.input}
            value={newChoices.B || ''}
            onChangeText={(text) => setNewChoices({ ...newChoices, B: text })}
            placeholder="Choice B"
          />
          <TextInput
            style={styles.input}
            value={newChoices.C || ''}
            onChangeText={(text) => setNewChoices({ ...newChoices, C: text })}
            placeholder="Choice C"
          />
          <TextInput
            style={styles.input}
            value={newChoices.D || ''}
            onChangeText={(text) => setNewChoices({ ...newChoices, D: text })}
            placeholder="Choice D"
          />
          <TextInput
            style={styles.input}
            value={Array.isArray(newAnswer) ? newAnswer.join(',') : newAnswer}
            onChangeText={(text) => setNewAnswer(newType === 'checkbox' ? text.split(',') : text)}
            placeholder="Answer (comma separated for checkbox)"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={editingQuestion ? handleSaveEdit : handleAddQuestion}
          >
            <Text style={styles.addButtonText}>
              {editingQuestion ? 'Save Changes' : 'Add Question'}
            </Text>
          </TouchableOpacity>
          {editingQuestion && (
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  timerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#2a2a4a',
    color: '#ffffff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  list: {
    maxHeight: 300,
  },
  questionItem: {
    backgroundColor: '#2a2a4a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  questionText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  form: {
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#757575',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
