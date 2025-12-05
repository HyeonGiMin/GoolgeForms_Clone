// StatisticsChart.tsx - 응답 통계를 시각적으로 표현하는 컴포넌트
import { useMemo } from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";
import type { QuestionStatisticsDto } from "../api/formsApi";

interface StatisticsChartProps {
    statistic: QuestionStatisticsDto;
}

export const StatisticsChart = ({ statistic }: StatisticsChartProps) => {
    const stats = useMemo(() => {
        if (
            statistic.optionStatistics &&
            statistic.optionStatistics.length > 0
        ) {
            const total = statistic.optionStatistics.reduce(
                (sum, opt) => sum + opt.count,
                0,
            );
            const maxCount = Math.max(
                ...statistic.optionStatistics.map((opt) => opt.count),
                1,
            );
            return {
                type: "choice" as const,
                data: statistic.optionStatistics,
                total,
                maxCount,
            };
        }

        if (statistic.textAnswers && statistic.textAnswers.length > 0) {
            return {
                type: "text" as const,
                data: statistic.textAnswers,
                total: statistic.textAnswers.length,
            };
        }

        return null;
    }, [statistic]);

    if (!stats) {
        return <p className="text-muted small mb-0">응답 데이터 없음</p>;
    }

    if (stats.type === "choice") {
        return (
            <div className="statistics-container">
                {stats.data.map((option) => (
                    <div
                        key={`${statistic.questionId}-${option.optionLabel}`}
                        className="mb-3"
                    >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <div>
                                <h6 className="mb-0">{option.optionLabel}</h6>
                                <small className="text-muted">
                                    {option.count}명 (
                                    {option.percentage.toFixed(1)}%)
                                </small>
                            </div>
                        </div>

                        {/* 가로 막대 차트 */}
                        <div
                            className="progress"
                            role="progressbar"
                            style={{ height: "28px" }}
                        >
                            <div
                                className="progress-bar bg-primary"
                                style={{
                                    width: `${option.percentage}%`,
                                    fontSize: "12px",
                                    display:
                                        option.percentage > 10
                                            ? "flex"
                                            : "none",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                }}
                            >
                                {option.percentage > 10 &&
                                    `${option.percentage.toFixed(0)}%`}
                            </div>
                        </div>

                        {/* 숫자 표시 (막대 밖) */}
                        {option.percentage <= 10 && (
                            <small className="text-primary ms-2">
                                {option.percentage.toFixed(1)}%
                            </small>
                        )}
                    </div>
                ))}

                {/* 통계 요약 */}
                <div className="mt-3 p-2 bg-light rounded">
                    <Row className="text-center">
                        <Col>
                            <div className="fw-bold text-primary">
                                {stats.total}
                            </div>
                            <small className="text-muted">총 응답</small>
                        </Col>
                        <Col>
                            <div className="fw-bold text-success">
                                {(
                                    (stats.data.reduce(
                                        (max, opt) => Math.max(max, opt.count),
                                        0,
                                    ) /
                                        stats.total) *
                                    100
                                ).toFixed(1)}
                                %
                            </div>
                            <small className="text-muted">최고 응답률</small>
                        </Col>
                        <Col>
                            <div className="fw-bold text-info">
                                {
                                    stats.data.filter((opt) => opt.count > 0)
                                        .length
                                }
                            </div>
                            <small className="text-muted">선택된 항목</small>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }

    // 텍스트 답변
    return (
        <div className="text-answers-container">
            <div className="mb-2">
                <Badge bg="info">{stats.total}개 응답</Badge>
            </div>
            <div className="list-group list-group-flush">
                {stats.data.map((answer) => (
                    <div
                        key={`${statistic.questionId}-${answer}`}
                        className="list-group-item px-0 py-2"
                    >
                        <p className="mb-0">{answer}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface QuestionStatsCardProps {
    statistic: QuestionStatisticsDto;
}

export const QuestionStatsCard = ({ statistic }: QuestionStatsCardProps) => {
    const getTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            SHORT_TEXT: "단답형",
            LONG_TEXT: "장문형",
            MULTIPLE_CHOICE: "객관식",
            CHECKBOXES: "체크박스",
            DROPDOWN: "드롭다운",
            DATE: "날짜",
            TIME: "시간",
        };
        return labels[type] || type;
    };

    return (
        <Card className="shadow-sm h-100">
            <Card.Body>
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">
                            {statistic.questionTitle}
                        </h5>
                        <Badge bg="secondary">
                            {getTypeLabel(statistic.questionType)}
                        </Badge>
                    </div>
                    <small className="text-muted">
                        {statistic.responseCount}개 응답
                    </small>
                </div>

                <StatisticsChart statistic={statistic} />
            </Card.Body>
        </Card>
    );
};
