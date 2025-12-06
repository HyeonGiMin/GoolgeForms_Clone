// FormResponsesPage.tsx - 설문 응답 보기 및 통계 페이지
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchFormById,
    fetchResponses,
    fetchStatistics,
    deleteResponse,
    type FormDetail,
    type FormResponseDto,
    type QuestionStatisticsDto,
} from "../api/formsApi";
import { QuestionStatsCard } from "../components/StatisticsChart";
import { Badge, Button, Nav, Spinner, Tab } from "react-bootstrap";

export const FormResponsesPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [form, setForm] = useState<FormDetail | null>(null);
    const [responses, setResponses] = useState<FormResponseDto[]>([]);
    const [statistics, setStatistics] = useState<QuestionStatisticsDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedResponseId, setExpandedResponseId] = useState<string | null>(
        null,
    );
    const [responseViewMode, setResponseViewMode] = useState<
        "summary" | "by-question" | "individual"
    >("summary");

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const [formData, responsesData, statisticsData] =
                    await Promise.all([
                        fetchFormById(id),
                        fetchResponses(id),
                        fetchStatistics(id),
                    ]);

                setForm(formData);
                setResponses(responsesData);
                setStatistics(statisticsData);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("데이터를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleDeleteResponse = async (responseId: string) => {
        if (!id) return;

        if (!confirm("이 응답을 삭제하시겠습니까?")) return;

        try {
            await deleteResponse(id, responseId);
            setResponses((prev) => prev.filter((r) => r.id !== responseId));
        } catch (err) {
            console.error(err);
            alert("응답 삭제에 실패했습니다.");
        }
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">로딩 중...</span>
                </Spinner>
            </div>
        );
    }

    if (error || !form) {
        return (
            <section className="p-4">
                <div className="alert alert-danger">
                    {error || "폼을 찾을 수 없습니다."}
                </div>
                <Button variant="secondary" onClick={() => navigate("/forms")}>
                    돌아가기
                </Button>
            </section>
        );
    }

    return (
        <section className="p-4">
            <header className="mb-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h1 className="h4 mb-1">{form.title}</h1>
                        <p className="text-muted mb-0">응답 현황</p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => navigate(`/forms/${id}/edit`)}
                    >
                        폼 편집
                    </Button>
                </div>
            </header>

            {form.description && (
                <p className="text-muted mb-4">{form.description}</p>
            )}

            <Tab.Container defaultActiveKey="statistics">
                <Nav variant="tabs" className="mb-4">
                    <Nav.Item>
                        <Nav.Link eventKey="statistics">
                            통계 ({responses.length}개 응답)
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="responses">응답 보기</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    {/* 통계 탭 */}
                    <Tab.Pane eventKey="statistics">
                        {responses.length === 0 ? (
                            <div className="alert alert-info">
                                아직 응답이 없습니다.
                            </div>
                        ) : (
                            <div className="row g-3">
                                {statistics.map((stat) => (
                                    <div
                                        key={stat.questionId}
                                        className="col-12"
                                    >
                                        <QuestionStatsCard statistic={stat} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tab.Pane>

                    {/* 응답 보기 탭 */}
                    <Tab.Pane eventKey="responses">
                        {responses.length === 0 ? (
                            <div className="alert alert-info">
                                아직 응답이 없습니다.
                            </div>
                        ) : (
                            <>
                                {/* 응답 보기 모드 선택 */}
                                <div className="btn-group mb-4" role="group">
                                    <Button
                                        variant={
                                            responseViewMode === "summary"
                                                ? "primary"
                                                : "outline-primary"
                                        }
                                        onClick={() =>
                                            setResponseViewMode("summary")
                                        }
                                    >
                                        요약
                                    </Button>
                                    <Button
                                        variant={
                                            responseViewMode === "by-question"
                                                ? "primary"
                                                : "outline-primary"
                                        }
                                        onClick={() =>
                                            setResponseViewMode("by-question")
                                        }
                                    >
                                        질문별
                                    </Button>
                                    <Button
                                        variant={
                                            responseViewMode === "individual"
                                                ? "primary"
                                                : "outline-primary"
                                        }
                                        onClick={() =>
                                            setResponseViewMode("individual")
                                        }
                                    >
                                        개별 응답
                                    </Button>
                                    <Button
                                        variant="outline-success"
                                        onClick={() => exportResponses()}
                                    >
                                        내보내기
                                    </Button>
                                </div>

                                {/* 요약 보기 */}
                                {responseViewMode === "summary" && (
                                    <ResponseSummary
                                        responses={responses}
                                        form={form}
                                    />
                                )}

                                {/* 질문별 보기 */}
                                {responseViewMode === "by-question" && (
                                    <ResponseByQuestion
                                        responses={responses}
                                        form={form}
                                    />
                                )}

                                {/* 개별 응답 보기 */}
                                {responseViewMode === "individual" && (
                                    <ResponseIndividual
                                        responses={responses}
                                        expandedResponseId={expandedResponseId}
                                        onToggleExpand={setExpandedResponseId}
                                        onDelete={handleDeleteResponse}
                                    />
                                )}
                            </>
                        )}
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </section>
    );

    function exportResponses() {
        const csvData = convertToCSV(responses, form?.questions || []);
        downloadCSV(csvData, `${form?.title || "responses"}.csv`);
    }
};

// ============ 응답 보기 컴포넌트들 ============

interface ResponseSummaryProps {
    responses: FormResponseDto[];
    form: FormDetail | null;
}

const ResponseSummary = ({ responses, form }: ResponseSummaryProps) => {
    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title mb-3">응답 요약</h5>
                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="text-center">
                            <div className="h3 text-primary mb-1">
                                {responses.length}
                            </div>
                            <small className="text-muted">총 응답</small>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center">
                            <div className="h3 text-success mb-1">
                                {responses.length > 0
                                    ? new Date(
                                          responses[0].createdAt,
                                      ).toLocaleDateString("ko-KR")
                                    : "-"}
                            </div>
                            <small className="text-muted">첫 응답</small>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center">
                            <div className="h3 text-info mb-1">
                                {responses.length > 0 && responses.at(-1)
                                    ? new Date(
                                          responses.at(-1)!.createdAt,
                                      ).toLocaleDateString("ko-KR")
                                    : "-"}
                            </div>
                            <small className="text-muted">최근 응답</small>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center">
                            <div className="h3 text-warning mb-1">
                                {form?.questions.length || 0}
                            </div>
                            <small className="text-muted">질문 수</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ResponseByQuestionProps {
    responses: FormResponseDto[];
    form: FormDetail | null;
}

const ResponseByQuestion = ({ responses, form }: ResponseByQuestionProps) => {
    if (!form) return null;

    return (
        <div className="row g-3">
            {form.questions.map((question) => (
                <div key={question.id} className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title mb-3">
                                {question.title}
                            </h5>
                            <div className="list-group list-group-flush">
                                {responses.map((response) => {
                                    const answer = response.answers.find(
                                        (a) => a.questionId === question.id,
                                    );
                                    return (
                                        <div
                                            key={response.id}
                                            className="list-group-item d-flex justify-content-between align-items-start"
                                        >
                                            <div className="flex-grow-1">
                                                {answer?.selectedOptions &&
                                                answer.selectedOptions.length >
                                                    0 ? (
                                                    <div>
                                                        {answer.selectedOptions.map(
                                                            (opt) => (
                                                                <Badge
                                                                    key={opt}
                                                                    bg="light"
                                                                    text="dark"
                                                                    className="me-2 mb-2"
                                                                >
                                                                    {opt}
                                                                </Badge>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="mb-0 text-muted">
                                                        {answer?.answer ||
                                                            "응답 없음"}
                                                    </p>
                                                )}
                                            </div>
                                            <small className="text-muted ms-2">
                                                {new Date(
                                                    response.createdAt,
                                                ).toLocaleString("ko-KR")}
                                            </small>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface ResponseIndividualProps {
    responses: FormResponseDto[];
    expandedResponseId: string | null;
    onToggleExpand: (id: string | null) => void;
    onDelete: (id: string) => void;
}

const ResponseIndividual = ({
    responses,
    expandedResponseId,
    onToggleExpand,
    onDelete,
}: ResponseIndividualProps) => {
    return (
        <div className="list-group">
            {responses.map((response, idx) => (
                <div key={response.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                            <h6 className="mb-1">응답 #{idx + 1}</h6>
                            <small className="text-muted">
                                {new Date(response.createdAt).toLocaleString(
                                    "ko-KR",
                                )}
                            </small>
                        </div>
                        <div className="btn-group btn-group-sm">
                            <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() =>
                                    onToggleExpand(
                                        expandedResponseId === response.id
                                            ? null
                                            : response.id,
                                    )
                                }
                            >
                                {expandedResponseId === response.id
                                    ? "접기"
                                    : "보기"}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => onDelete(response.id)}
                            >
                                삭제
                            </Button>
                        </div>
                    </div>

                    {expandedResponseId === response.id && (
                        <div className="mt-3 pt-3 border-top">
                            {response.answers.map((answer) => (
                                <div key={answer.questionId} className="mb-3">
                                    <h6 className="mb-2">
                                        {answer.questionTitle}
                                    </h6>
                                    {answer.selectedOptions &&
                                    answer.selectedOptions.length > 0 ? (
                                        <div>
                                            {answer.selectedOptions.map(
                                                (opt) => (
                                                    <Badge
                                                        key={`${answer.questionId}-${opt}`}
                                                        bg="light"
                                                        text="dark"
                                                        className="me-2 mb-2"
                                                    >
                                                        {opt}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted">
                                            {answer.answer || "응답 없음"}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// ============ Export 유틸 함수 ============

function convertToCSV(responses: FormResponseDto[], questions: any[]): string {
    const headers = [
        "응답 번호",
        "응답 시간",
        ...questions.map((q) => q.title),
    ];

    const rows = responses.map((response, idx) => [
        idx + 1,
        new Date(response.createdAt).toLocaleString("ko-KR"),
        ...questions.map((q) => {
            const answer = response.answers.find((a) => a.questionId === q.id);
            if (answer?.selectedOptions && answer.selectedOptions.length > 0) {
                return answer.selectedOptions.join("; ");
            }
            return answer?.answer || "";
        }),
    ]);

    const csvContent = [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((r) =>
            r
                .map(
                    (cell) =>
                        `"${cell?.toString().replaceAll('"', '""') || ""}"`,
                )
                .join(","),
        ),
    ].join("\n");

    return csvContent;
}

function downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    link.remove();
}
