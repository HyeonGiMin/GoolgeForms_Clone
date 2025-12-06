// FormAnswerPage.tsx - 공개 설문 응답 폼 페이지 (누구나 응답 가능)
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchFormById,
    submitResponse,
    type FormDetail,
    type Question,
    type SubmitAnswerDto,
} from "../api/formsApi";
import {
    Alert,
    Badge,
    Button,
    Card,
    Form,
    Stack,
    Spinner,
} from "react-bootstrap";

type Answer = {
    questionId: string;
    answer?: string;
    selectedOptions: string[];
};

export const FormAnswerPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [form, setForm] = useState<FormDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());

    useEffect(() => {
        const loadForm = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const formData = await fetchFormById(id);
                setForm(formData);

                // 초기 답변 객체 생성
                const initialAnswers = new Map<string, Answer>();
                formData.questions.forEach((q) => {
                    initialAnswers.set(q.id, {
                        questionId: q.id,
                        answer: "",
                        selectedOptions: [],
                    });
                });
                setAnswers(initialAnswers);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("설문을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };

        loadForm();
    }, [id]);

    const handleTextChange = (questionId: string, value: string) => {
        setAnswers((prev) => {
            const updated = new Map(prev);
            const answer = updated.get(questionId) || {
                questionId,
                selectedOptions: [],
            };
            answer.answer = value;
            updated.set(questionId, answer);
            return updated;
        });
    };

    const handleOptionChange = (
        questionId: string,
        option: string,
        isCheckbox: boolean,
    ) => {
        setAnswers((prev) => {
            const updated = new Map(prev);
            const answer = updated.get(questionId) || {
                questionId,
                answer: "",
                selectedOptions: [],
            };

            if (isCheckbox) {
                // 체크박스: 다중 선택
                if (answer.selectedOptions.includes(option)) {
                    answer.selectedOptions = answer.selectedOptions.filter(
                        (o) => o !== option,
                    );
                } else {
                    answer.selectedOptions.push(option);
                }
            } else {
                // 라디오/드롭다운: 단일 선택
                answer.selectedOptions = [option];
            }

            updated.set(questionId, answer);
            return updated;
        });
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!id || !form) return;

        // 필수 항목 검증
        const missingRequired = form.questions.filter((q) => {
            if (!q.required) return false;

            const answer = answers.get(q.id);
            const isOptionType =
                q.type === "MULTIPLE_CHOICE" ||
                q.type === "CHECKBOXES" ||
                q.type === "DROPDOWN";

            if (isOptionType) {
                return !answer || answer.selectedOptions.length === 0;
            } else {
                return !answer || !answer.answer?.trim();
            }
        });

        if (missingRequired.length > 0) {
            setError(
                `다음 필수 항목을 입력해주세요: ${missingRequired
                    .map((q) => q.title)
                    .join(", ")}`,
            );
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            const payload = {
                answers: Array.from(answers.values()).map(
                    (ans): SubmitAnswerDto => {
                        const isOptionType =
                            form.questions.find((q) => q.id === ans.questionId)
                                ?.type === "MULTIPLE_CHOICE" ||
                            form.questions.find((q) => q.id === ans.questionId)
                                ?.type === "CHECKBOXES" ||
                            form.questions.find((q) => q.id === ans.questionId)
                                ?.type === "DROPDOWN";

                        return {
                            questionId: ans.questionId,
                            answer: isOptionType ? undefined : ans.answer,
                            selectedOptions: isOptionType
                                ? ans.selectedOptions
                                : undefined,
                        };
                    },
                ),
            };

            await submitResponse(id, payload);
            setSubmitSuccess(true);

            // confirmationMessage가 있으면 표시 후 이동, 없으면 바로 이동
            const delay = form.confirmationMessage ? 5000 : 3000;
            setTimeout(() => {
                navigate("/forms");
            }, delay);
        } catch (err) {
            console.error(err);
            setError("응답을 제출하지 못했습니다. 다시 시도해주세요.");
        } finally {
            setSubmitting(false);
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

    if (!form) {
        return (
            <section className="p-4">
                <div className="alert alert-danger">
                    설문을 찾을 수 없습니다.
                </div>
                <Button variant="secondary" onClick={() => navigate("/forms")}>
                    돌아가기
                </Button>
            </section>
        );
    }

    if (submitSuccess) {
        return (
            <section className="p-4">
                <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
                    <div className="text-center" style={{ maxWidth: "500px" }}>
                        <div className="mb-4">
                            <i
                                className="bi bi-check-circle-fill"
                                style={{ fontSize: "4rem", color: "#28a745" }}
                            />
                        </div>
                        <h2 className="mb-3">응답이 제출되었습니다!</h2>
                        {form.confirmationMessage && (
                            <Card className="mb-4 border-success">
                                <Card.Body>
                                    <p className="mb-0">
                                        {form.confirmationMessage}
                                    </p>
                                </Card.Body>
                            </Card>
                        )}
                        <p className="text-muted mb-4">
                            잠시 후 설문 목록으로 이동합니다...
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate("/forms")}
                        >
                            지금 이동
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            className="p-4"
            style={{ maxWidth: "800px", margin: "0 auto" }}
        >
            <header className="mb-4">
                <h1 className="h3 mb-2">{form.title}</h1>
                {form.description && (
                    <p className="text-muted">{form.description}</p>
                )}
            </header>

            {error && <Alert variant="danger">{error}</Alert>}

            <Stack gap={3} as="form" onSubmit={handleSubmit} className="mb-4">
                {form.questions.map((question, index) => (
                    <Card key={question.id} className="shadow-sm">
                        <Card.Body>
                            <div className="mb-3">
                                <h5 className="mb-1">
                                    {index + 1}. {question.title}
                                    {question.required && (
                                        <Badge bg="danger" className="ms-2">
                                            필수
                                        </Badge>
                                    )}
                                </h5>
                            </div>

                            <QuestionRenderer
                                question={question}
                                answer={answers.get(question.id)}
                                onTextChange={(value) =>
                                    handleTextChange(question.id, value)
                                }
                                onOptionChange={(option, isCheckbox) =>
                                    handleOptionChange(
                                        question.id,
                                        option,
                                        isCheckbox,
                                    )
                                }
                            />
                        </Card.Body>
                    </Card>
                ))}

                <div className="mt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={submitting}
                        className="w-100"
                    >
                        {submitting ? "제출 중..." : "응답 제출"}
                    </Button>
                </div>
            </Stack>
        </section>
    );
};

interface QuestionRendererProps {
    readonly question: Question;
    readonly answer?: Answer;
    readonly onTextChange: (value: string) => void;
    readonly onOptionChange: (option: string, isCheckbox: boolean) => void;
}

function QuestionRenderer({
    question,
    answer,
    onTextChange,
    onOptionChange,
}: QuestionRendererProps) {
    // 텍스트 입력 질문
    if (question.type === "SHORT_TEXT") {
        return (
            <Form.Control
                type="text"
                value={answer?.answer || ""}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="답변을 입력하세요"
            />
        );
    }

    if (question.type === "LONG_TEXT") {
        return (
            <Form.Control
                as="textarea"
                rows={4}
                value={answer?.answer || ""}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="답변을 입력하세요"
            />
        );
    }

    // 날짜 입력
    if (question.type === "DATE") {
        return (
            <Form.Control
                type="date"
                value={answer?.answer || ""}
                onChange={(e) => onTextChange(e.target.value)}
            />
        );
    }

    // 시간 입력
    if (question.type === "TIME") {
        return (
            <Form.Control
                type="time"
                value={answer?.answer || ""}
                onChange={(e) => onTextChange(e.target.value)}
            />
        );
    }

    // 객관식
    if (question.type === "MULTIPLE_CHOICE") {
        return (
            <Stack gap={2}>
                {question.options.map((option) => (
                    <Form.Check
                        key={option.id}
                        type="radio"
                        name={`question-${question.id}`}
                        id={`option-${option.id}`}
                        label={option.label}
                        value={option.label}
                        checked={answer?.selectedOptions.includes(option.label)}
                        onChange={() => onOptionChange(option.label, false)}
                    />
                ))}
            </Stack>
        );
    }

    // 체크박스
    if (question.type === "CHECKBOXES") {
        return (
            <Stack gap={2}>
                {question.options.map((option) => (
                    <Form.Check
                        key={option.id}
                        type="checkbox"
                        id={`option-${option.id}`}
                        label={option.label}
                        value={option.label}
                        checked={answer?.selectedOptions.includes(option.label)}
                        onChange={() => onOptionChange(option.label, true)}
                    />
                ))}
            </Stack>
        );
    }

    // 드롭다운
    if (question.type === "DROPDOWN") {
        return (
            <Form.Select
                value={answer?.selectedOptions[0] || ""}
                onChange={(e) => {
                    if (e.target.value) {
                        onOptionChange(e.target.value, false);
                    }
                }}
            >
                <option value="">-- 선택하세요 --</option>
                {question.options.map((option) => (
                    <option key={option.id} value={option.label}>
                        {option.label}
                    </option>
                ))}
            </Form.Select>
        );
    }

    return null;
}
