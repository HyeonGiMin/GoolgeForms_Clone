// FormListPage.tsx - 사용자가 만든 폼 목록을 보여주는 페이지
import { useEffect, useState } from "react";
import { fetchForms, deleteForm, type FormSummary } from "../api/formsApi";
import { Alert, Button, Card, Col, Row, Spinner, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";

export const FormListPage = () => {
    const [forms, setForms] = useState<FormSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchForms();
                setForms(data);
            } catch (err) {
                console.error(err);
                setError("폼 목록을 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const handleCopyLink = (formId: string) => {
        const shareUrl = `${window.location.origin}/forms/${formId}/answer`;
        navigator.clipboard.writeText(shareUrl);
        setCopiedId(formId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (formId: string) => {
        if (!confirm("이 폼을 삭제하시겠습니까? 모든 응답도 함께 삭제됩니다."))
            return;

        try {
            setDeletingId(formId);
            await deleteForm(formId);
            setForms((prev) => prev.filter((f) => f.id !== formId));
        } catch (err) {
            console.error(err);
            alert("폼 삭제에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <div>
                    <h1 className="h3 mb-2 fw-bold">내 설문지</h1>
                    <p className="text-muted mb-0">
                        생성한 설문 폼들을 한눈에 확인하고 관리할 수 있습니다.
                    </p>
                </div>
                <Link to="/forms/new">
                    <Button
                        variant="primary"
                        size="lg"
                        className="d-flex align-items-center gap-2"
                    >
                        <span>➕</span>
                        <span>새 폼 만들기</span>
                    </Button>
                </Link>
            </div>

            {loading && (
                <div className="d-flex align-items-center gap-2">
                    <Spinner animation="border" size="sm" />
                    <span>불러오는 중...</span>
                </div>
            )}

            {error && (
                <Alert variant="danger" className="mt-2">
                    {error}
                </Alert>
            )}

            {!loading && !error && forms.length === 0 && (
                <Alert variant="info" className="mt-3">
                    아직 생성된 폼이 없습니다. 우측 상단의{" "}
                    <strong>새 폼 만들기</strong> 버튼을 눌러 첫 폼을
                    만들어보세요.
                </Alert>
            )}

            {!loading && !error && forms.length > 0 && (
                <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                    {forms.map((form) => (
                        <Col key={form.id}>
                            <Card className="h-100 border-0 shadow-sm">
                                <Card.Body className="d-flex flex-column">
                                    <div className="mb-3 flex-grow-1">
                                        <Card.Title className="h5 mb-2 text-truncate">
                                            {form.title}
                                        </Card.Title>
                                        {form.description && (
                                            <Card.Text
                                                className="text-muted small mb-0"
                                                style={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {form.description}
                                            </Card.Text>
                                        )}
                                    </div>
                                    <Stack gap={2}>
                                        <Stack direction="horizontal" gap={2}>
                                            <Link
                                                to={`/forms/${form.id}/edit`}
                                                style={{ flex: 1 }}
                                            >
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="w-100"
                                                >
                                                    📝 편집
                                                </Button>
                                            </Link>
                                            <Link
                                                to={`/forms/${form.id}/responses`}
                                                style={{ flex: 1 }}
                                            >
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="w-100"
                                                >
                                                    📊 응답
                                                </Button>
                                            </Link>
                                        </Stack>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="w-100"
                                            disabled={deletingId === form.id}
                                            onClick={() =>
                                                handleDelete(form.id)
                                            }
                                        >
                                            {deletingId === form.id
                                                ? "삭제 중..."
                                                : "🗑️ 폼 삭제"}
                                        </Button>
                                        <Button
                                            variant={
                                                copiedId === form.id
                                                    ? "success"
                                                    : "outline-success"
                                            }
                                            size="sm"
                                            className="w-100"
                                            onClick={() =>
                                                handleCopyLink(form.id)
                                            }
                                        >
                                            {copiedId === form.id
                                                ? "✓ 링크 복사됨"
                                                : "🔗 공유 링크 복사"}
                                        </Button>
                                    </Stack>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </section>
    );
};
