// FormListPage.tsx - 사용자가 만든 폼 목록을 보여주는 페이지
import { useEffect, useState } from "react";
import { fetchForms, type FormSummary } from "../api/formsApi";
import { Alert, Button, Card, Col, Row, Spinner, Stack } from "react-bootstrap";
import { Link } from "react-router-dom";

export const FormListPage = () => {
    const [forms, setForms] = useState<FormSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    return (
        <section className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h1 className="h4 mb-1">My Forms</h1>
                    <p className="text-muted mb-0">
                        생성한 설문 폼들을 한눈에 확인하고 관리할 수 있습니다.
                    </p>
                </div>
                <Link to="/forms/new">
                    <Button variant="primary">새 폼 만들기</Button>
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
                <Row xs={1} md={2} lg={3} className="g-3 mt-1">
                    {forms.map((form) => (
                        <Col key={form.id}>
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <Card.Title className="h6">
                                        {form.title}
                                    </Card.Title>
                                    {form.description && (
                                        <Card.Text className="text-muted small mb-3">
                                            {form.description}
                                        </Card.Text>
                                    )}
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
                                                편집
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
                                                응답보기
                                            </Button>
                                        </Link>
                                    </Stack>
                                    <div className="mt-2">
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            className="w-100"
                                            onClick={() =>
                                                handleCopyLink(form.id)
                                            }
                                        >
                                            {copiedId === form.id
                                                ? "✓ 복사됨"
                                                : "공개 링크 복사"}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </section>
    );
};
