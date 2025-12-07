// FormBuilderPage.tsx - 새 설문 폼을 생성/편집하는 페이지
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
    createForm,
    updateForm,
    fetchFormById,
    type CreateFormQuestionRequest,
    type UpdateFormQuestionRequest,
    type QuestionType,
} from "../api/formsApi";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Badge,
    Button,
    Card,
    Form,
    Stack,
    Spinner,
    Tab,
    Tabs,
} from "react-bootstrap";

type QuestionOption = {
    id: string;
    label: string;
};

type Question = {
    id: string;
    title: string;
    type: QuestionType;
    required: boolean;
    options: QuestionOption[];
};

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
    SHORT_TEXT: "단답형",
    LONG_TEXT: "장문형",
    SINGLE_CHOICE: "객관식",
    MULTIPLE_CHOICE: "다중 선택",
    CHECKBOXES: "체크박스",
    DROPDOWN: "드롭다운",
    DATE: "날짜",
    TIME: "시간",
};

export const FormBuilderPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEditMode = !!id;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(isEditMode);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [alertKeywords, setAlertKeywords] = useState<string[]>([]);
    const [newKeyword, setNewKeyword] = useState("");

    // 편집 모드: 기존 폼 데이터 로드
    useEffect(() => {
        if (isEditMode && id) {
            const loadForm = async () => {
                try {
                    setLoading(true);
                    const form = await fetchFormById(id);
                    setTitle(form.title);
                    setDescription(form.description || "");
                    setAlertKeywords(form.alertKeywords || []);
                    setQuestions(
                        form.questions.map((q) => ({
                            id: q.id,
                            title: q.title,
                            type: q.type,
                            required: q.required,
                            options: q.options.map((o) => ({
                                id: o.id,
                                label: o.label,
                            })),
                        })),
                    );
                } catch (err) {
                    console.error(err);
                    setError("폼을 불러오는 중 오류가 발생했습니다.");
                } finally {
                    setLoading(false);
                }
            };
            loadForm();
        }
    }, [isEditMode, id]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!title.trim()) {
            setError("제목은 필수입니다.");
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            const questionsPayload:
                | CreateFormQuestionRequest[]
                | UpdateFormQuestionRequest[] = questions.map((q) => ({
                title: q.title.trim() || "제목 없는 질문",
                type: q.type,
                required: q.required,
                options: q.options
                    .map((o) => o.label.trim())
                    .filter((label) => label.length > 0),
            }));

            if (isEditMode && id) {
                await updateForm(id, {
                    title: title.trim(),
                    description: description.trim() || undefined,
                    questions: questionsPayload as UpdateFormQuestionRequest[],
                    alertKeywords: alertKeywords
                        .map((k) => k.trim())
                        .filter((k) => k.length > 0),
                });
            } else {
                await createForm({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    questions: questionsPayload as CreateFormQuestionRequest[],
                    alertKeywords: alertKeywords
                        .map((k) => k.trim())
                        .filter((k) => k.length > 0),
                });
            }

            navigate("/forms");
        } catch (err) {
            console.error(err);
            setError(
                isEditMode
                    ? "폼 수정 중 오류가 발생했습니다."
                    : "폼 생성 중 오류가 발생했습니다.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddQuestion = () => {
        const newQuestion: Question = {
            id: crypto.randomUUID(),
            title: "제목 없는 질문",
            type: "SHORT_TEXT",
            required: false,
            options: [],
        };

        setQuestions((prev) => [...prev, newQuestion]);
    };

    const handleAddKeyword = () => {
        const value = newKeyword.trim();
        if (!value) return;
        setAlertKeywords((prev) =>
            prev.includes(value) ? prev : [...prev, value],
        );
        setNewKeyword("");
    };

    const handleRemoveKeyword = (keyword: string) => {
        setAlertKeywords((prev) => prev.filter((k) => k !== keyword));
    };

    const handleChangeQuestionTitle = (id: string, value: string) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, title: value } : q)),
        );
    };

    const handleChangeQuestionType = (id: string, type: QuestionType) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== id) return q;

                // 선택지 타입에서만 options 사용
                const isOptionType =
                    type === "SINGLE_CHOICE" ||
                    type === "MULTIPLE_CHOICE" ||
                    type === "CHECKBOXES" ||
                    type === "DROPDOWN";

                return {
                    ...q,
                    type,
                    options: isOptionType
                        ? q.options.length > 0
                            ? q.options
                            : [
                                  { id: crypto.randomUUID(), label: "옵션 1" },
                                  { id: crypto.randomUUID(), label: "옵션 2" },
                              ]
                        : [],
                };
            }),
        );
    };

    const handleToggleRequired = (id: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === id ? { ...q, required: !q.required } : q,
            ),
        );
    };

    const handleAddOption = (questionId: string) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== questionId) return q;

                const nextIndex = q.options.length + 1;
                return {
                    ...q,
                    options: [
                        ...q.options,
                        { id: crypto.randomUUID(), label: `옵션 ${nextIndex}` },
                    ],
                };
            }),
        );
    };

    const handleChangeOptionLabel = (
        questionId: string,
        optionId: string,
        value: string,
    ) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== questionId) return q;

                return {
                    ...q,
                    options: q.options.map((opt) =>
                        opt.id === optionId ? { ...opt, label: value } : opt,
                    ),
                };
            }),
        );
    };

    const handleRemoveOption = (questionId: string, optionId: string) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id !== questionId) return q;

                return {
                    ...q,
                    options: q.options.filter((opt) => opt.id !== optionId),
                };
            }),
        );
    };

    const handleRemoveQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const hasQuestions = useMemo(() => questions.length > 0, [questions]);

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

    return (
        <section className="py-3">
            <header className="mb-4">
                <h1 className="h3 mb-2 fw-bold">
                    {isEditMode ? "📝 설문지 편집" : "✨ 새 설문지 만들기"}
                </h1>
                <p className="text-muted mb-0">
                    {isEditMode
                        ? "제목, 설명, 질문을 수정할 수 있습니다."
                        : "제목과 설명을 입력하고 질문을 추가해서 설문 폼을 구성합니다."}
                </p>
            </header>

            <Stack gap={4} as="form" onSubmit={handleSubmit}>
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4">
                        <Stack gap={3}>
                            <Form.Group controlId="formTitle">
                                <Form.Label className="fw-semibold">
                                    제목 *
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="예: 2024 고객 만족도 설문"
                                    size="lg"
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formDescription">
                                <Form.Label className="fw-semibold">
                                    설명 (선택)
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="설문에 대한 간단한 설명을 입력하세요"
                                />
                            </Form.Group>
                        </Stack>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4">
                        <Tabs defaultActiveKey="keywords" id="alert-tabs">
                            <Tab eventKey="keywords" title="알림 키워드">
                                <div className="mt-3">
                                    <p className="text-muted small mb-3">
                                        특정 키워드가 텍스트 답변에 포함되면
                                        알림을 띄웁니다. (폼별로 저장)
                                    </p>
                                    <Stack
                                        direction="horizontal"
                                        gap={2}
                                        className="mb-3 flex-wrap"
                                    >
                                        <Form.Control
                                            type="text"
                                            value={newKeyword}
                                            onChange={(e) =>
                                                setNewKeyword(e.target.value)
                                            }
                                            placeholder="예: 확인 필요, 민감 키워드"
                                            style={{ maxWidth: "260px" }}
                                        />
                                        <Button
                                            variant="primary"
                                            onClick={handleAddKeyword}
                                        >
                                            키워드 추가
                                        </Button>
                                    </Stack>

                                    {alertKeywords.length === 0 ? (
                                        <Alert variant="light" className="mb-0">
                                            아직 등록된 키워드가 없습니다.
                                            필요한 키워드를 추가하세요.
                                        </Alert>
                                    ) : (
                                        <Stack
                                            direction="horizontal"
                                            gap={2}
                                            className="flex-wrap"
                                        >
                                            {alertKeywords.map((keyword) => (
                                                <Badge
                                                    key={keyword}
                                                    bg="secondary"
                                                    className="d-flex align-items-center gap-2 py-2 px-3"
                                                >
                                                    <span>{keyword}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-light"
                                                        onClick={() =>
                                                            handleRemoveKeyword(
                                                                keyword,
                                                            )
                                                        }
                                                    >
                                                        ✕
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </Stack>
                                    )}
                                </div>
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>

                <section>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="h5 mb-0 fw-semibold">질문 목록</h2>
                            <Badge bg="primary" pill className="px-3">
                                {questions.length}
                            </Badge>
                        </div>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleAddQuestion}
                            className="d-flex align-items-center gap-2"
                        >
                            <span>➕</span>
                            <span>질문 추가</span>
                        </Button>
                    </div>

                    {!hasQuestions && (
                        <Alert
                            variant="info"
                            className="d-flex align-items-center gap-2"
                        >
                            <span>💡</span>
                            <span>
                                아직 추가된 질문이 없습니다.{" "}
                                <strong>질문 추가</strong> 버튼을 눌러 첫 번째
                                질문을 만들어보세요.
                            </span>
                        </Alert>
                    )}

                    <Stack gap={3}>
                        {questions.map((question, index) => {
                            const isOptionType =
                                question.type === "SINGLE_CHOICE" ||
                                question.type === "MULTIPLE_CHOICE" ||
                                question.type === "CHECKBOXES" ||
                                question.type === "DROPDOWN";

                            return (
                                <Card
                                    key={question.id}
                                    className="border-0 shadow-sm"
                                >
                                    <Card.Body className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <Badge
                                                bg="secondary"
                                                className="mb-2"
                                            >
                                                질문 {index + 1}
                                            </Badge>
                                            <Form.Check
                                                type="switch"
                                                id={`required-${question.id}`}
                                                label="필수"
                                                checked={question.required}
                                                onChange={() =>
                                                    handleToggleRequired(
                                                        question.id,
                                                    )
                                                }
                                                className="text-danger"
                                            />
                                        </div>

                                        <Stack gap={3}>
                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    질문 제목
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={
                                                        question.title ===
                                                        "제목 없는 질문"
                                                            ? ""
                                                            : question.title
                                                    }
                                                    onChange={(e) =>
                                                        handleChangeQuestionTitle(
                                                            question.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="질문을 입력하세요"
                                                />
                                            </Form.Group>

                                            <Form.Group>
                                                <Form.Label className="fw-semibold">
                                                    질문 유형
                                                </Form.Label>
                                                <Form.Select
                                                    value={question.type}
                                                    onChange={(e) =>
                                                        handleChangeQuestionType(
                                                            question.id,
                                                            e.target
                                                                .value as QuestionType,
                                                        )
                                                    }
                                                >
                                                    {(
                                                        Object.keys(
                                                            QUESTION_TYPE_LABEL,
                                                        ) as QuestionType[]
                                                    ).map((type) => (
                                                        <option
                                                            key={type}
                                                            value={type}
                                                        >
                                                            {
                                                                QUESTION_TYPE_LABEL[
                                                                    type
                                                                ]
                                                            }
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>

                                            {isOptionType && (
                                                <Stack gap={1}>
                                                    {question.options.map(
                                                        (opt, optIndex) => (
                                                            <div
                                                                key={opt.id}
                                                                className="d-flex align-items-center gap-2"
                                                            >
                                                                {/* 질문 타입에 따라 미리보기 아이콘 변경 */}
                                                                {question.type ===
                                                                    "SINGLE_CHOICE" && (
                                                                    <Form.Check
                                                                        type="radio"
                                                                        disabled
                                                                        className="mb-0"
                                                                        aria-label="객관식 옵션 미리보기"
                                                                    />
                                                                )}
                                                                {(question.type ===
                                                                    "MULTIPLE_CHOICE" ||
                                                                    question.type ===
                                                                        "CHECKBOXES") && (
                                                                    <Form.Check
                                                                        type="checkbox"
                                                                        disabled
                                                                        className="mb-0"
                                                                        aria-label="다중 선택 옵션 미리보기"
                                                                    />
                                                                )}
                                                                {question.type ===
                                                                    "DROPDOWN" && (
                                                                    <span className="text-muted small">
                                                                        {optIndex +
                                                                            1}
                                                                        .
                                                                    </span>
                                                                )}

                                                                <Form.Control
                                                                    type="text"
                                                                    value={
                                                                        opt.label
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleChangeOptionLabel(
                                                                            question.id,
                                                                            opt.id,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="옵션 텍스트"
                                                                />
                                                                <Button
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleRemoveOption(
                                                                            question.id,
                                                                            opt.id,
                                                                        )
                                                                    }
                                                                >
                                                                    삭제
                                                                </Button>
                                                            </div>
                                                        ),
                                                    )}
                                                    <div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="link"
                                                            className="px-0"
                                                            onClick={() =>
                                                                handleAddOption(
                                                                    question.id,
                                                                )
                                                            }
                                                        >
                                                            + 옵션 추가
                                                        </Button>
                                                    </div>
                                                </Stack>
                                            )}

                                            {!isOptionType && (
                                                <div className="text-muted small">
                                                    {question.type ===
                                                        "SHORT_TEXT" && (
                                                        <Form.Control
                                                            type="text"
                                                            disabled
                                                            placeholder="단답형 텍스트 응답"
                                                            className="mt-1"
                                                        />
                                                    )}
                                                    {question.type ===
                                                        "LONG_TEXT" && (
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            disabled
                                                            placeholder="장문형 텍스트 응답"
                                                            className="mt-1"
                                                        />
                                                    )}
                                                    {question.type ===
                                                        "DATE" && (
                                                        <Form.Control
                                                            type="date"
                                                            disabled
                                                            className="mt-1"
                                                        />
                                                    )}
                                                    {question.type ===
                                                        "TIME" && (
                                                        <Form.Control
                                                            type="time"
                                                            disabled
                                                            className="mt-1"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </Stack>
                                    </Card.Body>
                                    <Card.Footer className="bg-light border-0 p-3">
                                        <div className="d-flex justify-content-end">
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() =>
                                                    handleRemoveQuestion(
                                                        question.id,
                                                    )
                                                }
                                                className="d-flex align-items-center gap-2"
                                            >
                                                <span>🗑️</span>
                                                <span>질문 삭제</span>
                                            </Button>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            );
                        })}
                    </Stack>
                </section>

                {error && (
                    <Alert
                        variant="danger"
                        className="d-flex align-items-center gap-2"
                    >
                        <span>⚠️</span>
                        <span>{error}</span>
                    </Alert>
                )}

                <Card className="border-0 shadow-sm bg-light">
                    <Card.Body className="p-4">
                        <Stack
                            direction="horizontal"
                            gap={3}
                            className="justify-content-end"
                        >
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate("/forms")}
                                disabled={submitting}
                                size="lg"
                            >
                                취소
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                size="lg"
                                className="px-4"
                            >
                                {submitting
                                    ? isEditMode
                                        ? "수정 중..."
                                        : "생성 중..."
                                    : isEditMode
                                    ? "✔️ 수정 완료"
                                    : "✨ 폼 생성"}
                            </Button>
                        </Stack>
                    </Card.Body>
                </Card>
            </Stack>
        </section>
    );
};
