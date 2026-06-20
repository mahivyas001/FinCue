// components/ui/ReasoningQuiz.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

interface ReasoningQuizProps {
  question: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation: string;
  onAnswered: (wasCorrect: boolean | null, selectedId: string | null) => void;
}

export default function ReasoningQuiz({
  question,
  options,
  correctOptionId,
  explanation,
  onAnswered,
}: ReasoningQuizProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    if (answered) return;
    setSelectedId(optionId);
    setAnswered(true);
  };

  const handleSkip = () => {
    onAnswered(null, null);
  };

  const handleContinue = () => {
    if (selectedId === null) {
      onAnswered(null, null);
    } else {
      onAnswered(selectedId === correctOptionId, selectedId);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.questionTitle}>{question}</Text>

      <View style={styles.optionsList}>
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const isCorrect = option.id === correctOptionId;
          
          const optionStyle: any[] = [styles.optionCard];
          const textStyle: any[] = [styles.optionLabel];

          if (answered) {
            if (isSelected) {
              if (isCorrect) {
                optionStyle.push(styles.optionCorrect);
                textStyle.push(styles.textCorrect);
              } else {
                optionStyle.push(styles.optionIncorrect);
                textStyle.push(styles.textIncorrect);
              }
            } else if (isCorrect) {
              // Highlight the correct one even if the user didn't select it
              optionStyle.push(styles.optionCorrectOutline);
            } else {
              optionStyle.push(styles.optionMuted);
            }
          } else {
            // Normal state
            optionStyle.push(styles.optionActive);
          }

          return (
            <TouchableOpacity
              key={option.id}
              style={optionStyle}
              onPress={() => handleOptionSelect(option.id)}
              disabled={answered}
              activeOpacity={0.75}
            >
              <View style={styles.optionRow}>
                <View style={[
                  styles.radioOuter,
                  answered && isCorrect && styles.radioCorrectOuter,
                  answered && isSelected && !isCorrect && styles.radioIncorrectOuter
                ]}>
                  {((!answered && isSelected) || (answered && isSelected) || (answered && isCorrect)) && (
                    <View style={[
                      styles.radioInner,
                      answered && isCorrect && styles.radioCorrectInner,
                      answered && isSelected && !isCorrect && styles.radioIncorrectInner
                    ]} />
                  )}
                </View>
                <Text style={textStyle}>{option.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {answered ? (
        <View style={styles.feedbackContainer}>
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackEmoji}>
              {selectedId === correctOptionId ? '🎉' : '💡'}
            </Text>
            <Text style={styles.feedbackStatus}>
              {selectedId === correctOptionId ? 'Yep, that tracks!' : 'Not quite — here\'s why:'}
            </Text>
          </View>
          <Text style={styles.feedbackExplanation}>{explanation}</Text>

          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.continueBtnText}>Reveal AI Explanation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Just show me</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  questionTitle: {
    fontSize:   16,
    lineHeight: 24,
    color:      COLORS.textPrimary.primary,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 20,
  },
  optionsList: {
    gap: 10,
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: COLORS.appBg.elevated,
    borderRadius:    14,
    borderWidth:     1.5,
    borderColor:     'transparent',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionActive: {
    borderColor: COLORS.border.default,
  },
  optionCorrect: {
    borderColor:     'rgba(16, 185, 129, 0.4)', // Soft green border
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  optionCorrectOutline: {
    borderColor:     'rgba(16, 185, 129, 0.25)',
    borderStyle:     'dashed',
  },
  optionIncorrect: {
    borderColor:     'rgba(148, 163, 184, 0.4)', // Muted Slate border
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
  },
  optionMuted: {
    opacity: 0.5,
    borderColor: 'transparent',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  radioOuter: {
    width:          18,
    height:         18,
    borderRadius:   9,
    borderWidth:    1.5,
    borderColor:    COLORS.textPrimary.faint,
    alignItems:     'center',
    justifyContent: 'center',
  },
  radioCorrectOuter: {
    borderColor: '#10B981',
  },
  radioIncorrectOuter: {
    borderColor: '#64748B',
  },
  radioInner: {
    width:           10,
    height:          10,
    borderRadius:    5,
    backgroundColor: COLORS.textPrimary.primary,
  },
  radioCorrectInner: {
    backgroundColor: '#10B981',
  },
  radioIncorrectInner: {
    backgroundColor: '#64748B',
  },
  optionLabel: {
    fontSize:   13,
    color:      COLORS.textPrimary.primary,
    fontFamily: 'Montserrat_500Medium',
    flex:       1,
  },
  textCorrect: {
    color:      '#10B981',
    fontFamily: 'Montserrat_600SemiBold',
  },
  textIncorrect: {
    color:      COLORS.textPrimary.muted,
  },
  feedbackContainer: {
    marginTop:       8,
    padding:         16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     'rgba(255, 255, 255, 0.05)',
    gap:             10,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  feedbackEmoji: {
    fontSize: 18,
  },
  feedbackStatus: {
    fontSize:   13,
    color:      COLORS.textPrimary.primary,
    fontFamily: 'Montserrat_600SemiBold',
  },
  feedbackExplanation: {
    fontSize:   12,
    lineHeight: 18,
    color:      COLORS.textPrimary.muted,
    fontFamily: 'Montserrat_400Regular',
  },
  continueBtn: {
    marginTop:       12,
    backgroundColor: '#64748B', // Neutral Slate styling
    borderRadius:    12,
    paddingVertical: 12,
    alignItems:      'center',
  },
  continueBtnText: {
    color:      '#FFFFFF',
    fontSize:   13,
    fontFamily: 'Montserrat_600SemiBold',
  },
  footer: {
    alignItems: 'center',
    marginTop:  8,
  },
  skipBtn: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize:       12,
    color:          COLORS.textPrimary.faint,
    fontFamily:     'Montserrat_500Medium',
    textDecorationLine: 'underline',
  },
});
