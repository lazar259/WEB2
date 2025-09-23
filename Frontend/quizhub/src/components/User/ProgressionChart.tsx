import React, { useMemo, useState } from 'react';
import { QuizAttemptResponse } from '../../services/types';
import './ProgressionChart.css';

interface ProgressionChartProps {
  attempts: QuizAttemptResponse[];
}

interface AttemptPoint {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  points: number;
  maxPoints: number;
  percentage: number;
  date: Date;
  timeSpent: number;
  attemptNumber: number;
}

interface QuizLine {
  quizId: number;
  quizTitle: string;
  points: AttemptPoint[];
  color: string;
}

const ProgressionChart: React.FC<ProgressionChartProps> = ({ attempts }) => {
  // Get unique quizzes
  const uniqueQuizzes = useMemo(() => {
    const completedAttempts = attempts.filter(attempt => attempt.completedAt);
    const quizMap = new Map();

    completedAttempts.forEach(attempt => {
      if (!quizMap.has(attempt.quizId)) {
        quizMap.set(attempt.quizId, {
          id: attempt.quizId,
          title: attempt.quizTitle,
          attemptCount: 0
        });
      }
      quizMap.get(attempt.quizId).attemptCount++;
    });

    return Array.from(quizMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [attempts]);

  // Selected quiz IDs state
  const [selectedQuizIds, setSelectedQuizIds] = useState<Set<number>>(
    new Set(uniqueQuizzes.slice(0, 5).map(quiz => quiz.id)) // Default to first 5 quizzes
  );

  const chartData = useMemo(() => {
    // Filter completed attempts only and sort by completion date
    const completedAttempts = attempts
      .filter(attempt => attempt.completedAt && selectedQuizIds.has(attempt.quizId))
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

    return completedAttempts.map((attempt, index) => ({
      attemptId: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quizTitle,
      points: attempt.score,
      maxPoints: attempt.maxScore,
      percentage: attempt.percentage,
      date: new Date(attempt.completedAt!),
      timeSpent: attempt.timeSpentInSeconds,
      attemptNumber: index + 1
    }));
  }, [attempts, selectedQuizIds]);

  // Chart configuration
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 40, bottom: 60, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Quiz colors
  const quizColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'];

  // Create consistent color mapping based on quiz ID
  const getQuizColor = (quizId: number): string => {
    const quizIndex = uniqueQuizzes.findIndex(quiz => quiz.id === quizId);
    return quizColors[quizIndex % quizColors.length];
  };

  // Group data by quiz for multiple lines
  const quizLines = useMemo((): QuizLine[] => {
    const groupedData = new Map<number, QuizLine>();

    chartData.forEach(point => {
      if (!groupedData.has(point.quizId)) {
        groupedData.set(point.quizId, {
          quizId: point.quizId,
          quizTitle: point.quizTitle,
          points: [],
          color: getQuizColor(point.quizId)
        });
      }
      groupedData.get(point.quizId)!.points.push(point);
    });

    return Array.from(groupedData.values());
  }, [chartData, uniqueQuizzes]);

  // Chart scaling functions
  const scaleX = (attemptIndex: number, totalAttempts: number) => {
    if (totalAttempts === 1) return plotWidth / 2;
    return (attemptIndex / (totalAttempts - 1)) * plotWidth;
  };

  const maxPoints = chartData.length > 0 ? Math.max(...chartData.map(d => d.points)) : 0;
  const minPoints = chartData.length > 0 ? Math.min(...chartData.map(d => d.points)) : 0;
  const pointsRange = maxPoints - minPoints;
  const chartMinPoints = Math.max(0, minPoints - pointsRange * 0.1);
  const chartMaxPoints = maxPoints + pointsRange * 0.1;

  const scaleY = (points: number) => {
    if (chartMaxPoints === chartMinPoints) return plotHeight / 2;
    return plotHeight - ((points - chartMinPoints) / (chartMaxPoints - chartMinPoints)) * plotHeight;
  };

  // Generate Y-axis ticks
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    const value = chartMinPoints + (i / tickCount) * (chartMaxPoints - chartMinPoints);
    yTicks.push(Math.round(value));
  }

  // Handle quiz selection
  const toggleQuizSelection = (quizId: number) => {
    const newSelected = new Set(selectedQuizIds);
    if (newSelected.has(quizId)) {
      newSelected.delete(quizId);
    } else {
      newSelected.add(quizId);
    }
    setSelectedQuizIds(newSelected);
  };

  const selectAllQuizzes = () => {
    setSelectedQuizIds(new Set(uniqueQuizzes.map(quiz => quiz.id)));
  };

  const clearAllQuizzes = () => {
    setSelectedQuizIds(new Set());
  };

  if (uniqueQuizzes.length === 0) {
    return (
      <div className="progression-chart-empty">
        <div className="empty-chart-icon">📊</div>
        <p>No completed quiz attempts to display</p>
      </div>
    );
  }

  return (
    <div className="progression-chart">
      <div className="chart-header">
        <h3>Score Progression Over Time</h3>
        <p>Track your improvement across quiz attempts</p>
      </div>

      {/* Quiz Filter */}
      <div className="quiz-filter">
        <div className="filter-header">
          <h4>Select Quizzes to Display</h4>
          <div className="filter-actions">
            <button className="filter-btn" onClick={selectAllQuizzes}>
              Select All
            </button>
            <button className="filter-btn" onClick={clearAllQuizzes}>
              Clear All
            </button>
          </div>
        </div>
        <div className="quiz-checkboxes">
          {uniqueQuizzes.map((quiz, index) => (
            <label key={quiz.id} className="quiz-checkbox">
              <input
                type="checkbox"
                checked={selectedQuizIds.has(quiz.id)}
                onChange={() => toggleQuizSelection(quiz.id)}
              />
              <span
                className="quiz-checkbox-indicator"
                style={{ backgroundColor: selectedQuizIds.has(quiz.id) ? getQuizColor(quiz.id) : '#e5e7eb' }}
              ></span>
              <span className="quiz-checkbox-label">
                {quiz.title} <span className="attempt-count">({quiz.attemptCount} attempts)</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Line Chart */}
      {chartData.length > 0 ? (
        <div className="chart-container">
        <svg width={chartWidth} height={chartHeight} className="chart-svg">
          {/* Chart background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="#f8fafc"
            stroke="#e2e8f0"
            rx="4"
          />

          {/* Grid lines */}
          {yTicks.map(tick => (
            <line
              key={`y-grid-${tick}`}
              x1={padding.left}
              y1={padding.top + scaleY(tick)}
              x2={padding.left + plotWidth}
              y2={padding.top + scaleY(tick)}
              stroke="#e5e7eb"
              strokeDasharray="2,2"
            />
          ))}

          {chartData.length > 1 && Array.from({length: Math.max(...quizLines.map(line => line.points.length))}, (_, i) => (
            <line
              key={`x-grid-${i}`}
              x1={padding.left + scaleX(i, Math.max(...quizLines.map(line => line.points.length)))}
              y1={padding.top}
              x2={padding.left + scaleX(i, Math.max(...quizLines.map(line => line.points.length)))}
              y2={padding.top + plotHeight}
              stroke="#e5e7eb"
              strokeDasharray="2,2"
            />
          ))}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotHeight}
            stroke="#374151"
            strokeWidth="2"
          />

          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={padding.left + plotWidth}
            y2={padding.top + plotHeight}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Y-axis labels */}
          {yTicks.map(tick => (
            <text
              key={`y-label-${tick}`}
              x={padding.left - 10}
              y={padding.top + scaleY(tick) + 5}
              textAnchor="end"
              className="chart-label"
            >
              {tick}
            </text>
          ))}

          {/* Chart lines and points for each quiz */}
          {quizLines.map(line => (
            <g key={line.quizId}>
              {/* Line */}
              {line.points.length > 1 && (
                <path
                  d={`M ${line.points.map((point, index) =>
                    `${padding.left + scaleX(index, line.points.length)},${padding.top + scaleY(point.points)}`
                  ).join(' L ')}`}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="chart-line"
                />
              )}

              {/* Data points */}
              {line.points.map((point, index) => (
                <g key={`${line.quizId}-point-${index}`}>
                  <circle
                    cx={padding.left + scaleX(index, line.points.length)}
                    cy={padding.top + scaleY(point.points)}
                    r="6"
                    fill={line.color}
                    stroke="white"
                    strokeWidth="2"
                    className="chart-point"
                  />

                  {/* Tooltip */}
                  <circle
                    cx={padding.left + scaleX(index, line.points.length)}
                    cy={padding.top + scaleY(point.points)}
                    r="12"
                    fill="transparent"
                    className="chart-point-hover"
                  >
                    <title>
                      {`${line.quizTitle}\nAttempt #${index + 1}\nPoints: ${point.points}/${point.maxPoints} (${point.percentage.toFixed(1)}%)\nDate: ${point.date.toLocaleDateString()}\nTime: ${formatTime(point.timeSpent)}`}
                    </title>
                  </circle>
                </g>
              ))}
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={padding.left + plotWidth / 2}
            y={chartHeight - 15}
            textAnchor="middle"
            className="chart-axis-label"
          >
            Attempt Number
          </text>

          <text
            x={15}
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            className="chart-axis-label"
            transform={`rotate(-90, 15, ${padding.top + plotHeight / 2})`}
          >
            Points Earned
          </text>
        </svg>
        </div>
      ) : (
        <div className="no-data-selected">
          <p>Select quizzes above to view progression chart</p>
        </div>
      )}
    </div>
  );
};

export default ProgressionChart;