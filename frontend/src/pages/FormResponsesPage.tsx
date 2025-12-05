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
                        <Nav.Link eventKey="responses">응답 목록</Nav.Link>
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

                    {/* 응답 목록 탭 */}
                    <Tab.Pane eventKey="responses">
                        {responses.length === 0 ? (
                            <div className="alert alert-info">
                                아직 응답이 없습니다.
                            </div>
                        ) : (
                            <div className="list-group">
                                {responses.map((response, idx) => (
                                    <div
                                        key={response.id}
                                        className="list-group-item"
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1">
                                                    응답 #{idx + 1}
                                                </h6>
                                                <small className="text-muted">
                                                    {new Date(
                                                        response.createdAt,
                                                    ).toLocaleString("ko-KR")}
                                                </small>
                                            </div>
                                            <div className="btn-group">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() =>
                                                        setExpandedResponseId(
                                                            expandedResponseId ===
                                                                response.id
                                                                ? null
                                                                : response.id,
                                                        )
                                                    }
                                                >
                                                    {expandedResponseId ===
                                                    response.id
                                                        ? "접기"
                                                        : "보기"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() =>
                                                        handleDeleteResponse(
                                                            response.id,
                                                        )
                                                    }
                                                >
                                                    삭제
                                                </Button>
                                            </div>
                                        </div>

                                        {expandedResponseId === response.id && (
                                            <div className="mt-3 pt-3 border-top">
                                                {response.answers.map(
                                                    (answer) => (
                                                        <div
                                                            key={
                                                                answer.questionId
                                                            }
                                                            className="mb-3"
                                                        >
                                                            <h6 className="mb-2">
                                                                {
                                                                    answer.questionTitle
                                                                }
                                                            </h6>
                                                            {answer.selectedOptions &&
                                                            answer
                                                                .selectedOptions
                                                                .length > 0 ? (
                                                                <div>
                                                                    {answer.selectedOptions.map(
                                                                        (
                                                                            opt,
                                                                        ) => (
                                                                            <Badge
                                                                                key={`${answer.questionId}-${opt}`}
                                                                                bg="light"
                                                                                text="dark"
                                                                                className="me-2 mb-2"
                                                                            >
                                                                                {
                                                                                    opt
                                                                                }
                                                                            </Badge>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-muted">
                                                                    {answer.answer ||
                                                                        "응답 없음"}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </section>
    );
};
